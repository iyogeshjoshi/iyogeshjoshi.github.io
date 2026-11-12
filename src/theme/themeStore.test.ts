import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { installMatchMedia } from '../test/matchMedia';
import type { MatchMediaMock } from '../test/matchMedia';
import { THEME_STORAGE_KEY, applyTheme, nextMode, readMode, resolve, writeMode } from './themeStore';

describe('themeStore', () => {
  let mm: MatchMediaMock;

  beforeEach(() => {
    window.localStorage.clear();
    document.head.innerHTML = '<meta name="theme-color" content="#000000">';
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.themeMode;
    mm = installMatchMedia();
  });

  afterEach(() => {
    mm.restore();
    vi.restoreAllMocks();
  });

  it('cycles light -> dark -> auto -> light', () => {
    expect(nextMode('light')).toBe('dark');
    expect(nextMode('dark')).toBe('auto');
    expect(nextMode('auto')).toBe('light');
  });

  it('resolves auto from system preference', () => {
    expect(resolve('auto', true)).toBe('light');
    expect(resolve('auto', false)).toBe('dark');
    expect(resolve('dark', true)).toBe('dark');
    expect(resolve('light', false)).toBe('light');
  });

  it('reads valid stored modes', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(readMode()).toBe('light');
  });

  it('falls back to auto for missing or invalid values', () => {
    expect(readMode()).toBe('auto');
    window.localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(readMode()).toBe('auto');
  });

  it('falls back to auto when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readMode()).toBe('auto');
  });

  it('writeMode persists and swallows storage errors', () => {
    writeMode('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => writeMode('light')).not.toThrow();
  });

  it('applyTheme sets attributes and theme-color meta', () => {
    expect(applyTheme('light')).toBe('light');
    const root = document.documentElement;
    expect(root.dataset.theme).toBe('light');
    expect(root.dataset.themeMode).toBe('light');
    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute('content')).toBe('#F6F7F9');

    mm.set('(prefers-color-scheme: light)', false);
    expect(applyTheme('auto')).toBe('dark');
    expect(root.dataset.theme).toBe('dark');
    expect(root.dataset.themeMode).toBe('auto');
    expect(meta?.getAttribute('content')).toBe('#0A0F1A');
  });
});
