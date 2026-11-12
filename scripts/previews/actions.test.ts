import { describe, expect, it, vi } from 'vitest';

import {
  CHARCAP_SAMPLE_TEXT,
  PREVIEW_ACTIONS,
  getPreviewAction,
  runPreviewAction,
} from './actions';
import type { ActionPage } from './actions';

function fakePage(failSelectors = false) {
  const click = vi.fn(async () => {
    if (failSelectors) throw new Error('no element\nstack');
  });
  const fill = vi.fn(async () => {
    if (failSelectors) throw new Error('no element');
  });
  const waitForTimeout = vi.fn(async () => undefined);
  const locator = vi.fn(() => ({ first: () => ({ click, fill }) }));
  return {
    page: { locator, waitForTimeout } as ActionPage,
    click,
    fill,
    waitForTimeout,
    locator,
  };
}

describe('preview actions', () => {
  it('has an async action per interactive app', () => {
    for (const slug of ['game-of-life', 'charcap', 'ping-pong', 'primordia']) {
      expect(typeof PREVIEW_ACTIONS[slug]).toBe('function');
    }
  });

  it('looks up by slug and ignores prototype keys / unknown slugs', () => {
    expect(getPreviewAction('charcap')).toBe(PREVIEW_ACTIONS.charcap);
    expect(getPreviewAction('online-ruler')).toBeUndefined();
    expect(getPreviewAction('constructor')).toBeUndefined();
  });

  it('game-of-life clicks Random then Start and waits 2.5s', async () => {
    const f = fakePage();
    await runPreviewAction('game-of-life', f.page);
    expect(f.click).toHaveBeenCalledTimes(2);
    expect(f.waitForTimeout).toHaveBeenCalledWith(2500);
  });

  it('charcap types the sample sentence', async () => {
    const f = fakePage();
    await runPreviewAction('charcap', f.page);
    expect(f.fill).toHaveBeenCalledWith(CHARCAP_SAMPLE_TEXT, expect.anything());
  });

  it('waits for ping-pong and primordia', async () => {
    const a = fakePage();
    await runPreviewAction('ping-pong', a.page);
    expect(a.waitForTimeout).toHaveBeenCalledWith(2000);
    const b = fakePage();
    await runPreviewAction('primordia', b.page);
    expect(b.waitForTimeout).toHaveBeenCalledWith(4000);
  });

  it('warns and continues when selectors are missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const f = fakePage(true);
    await expect(
      runPreviewAction('game-of-life', f.page)
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(2);
    expect(f.waitForTimeout).toHaveBeenCalledWith(2500);
    warn.mockRestore();
  });

  it('is a no-op for apps without an action', async () => {
    const f = fakePage();
    await runPreviewAction('online-ruler', f.page);
    expect(f.locator).not.toHaveBeenCalled();
  });
});
