import { afterEach, describe, expect, it, vi } from 'vitest';

import { track } from './gtag';

type W = Window & { gtag?: unknown };

describe('track', () => {
  afterEach(() => {
    delete (window as W).gtag;
  });

  it('is a no-op without gtag', () => {
    expect(() => track('x', { a: 1 })).not.toThrow();
  });

  it('forwards the event and strips undefined params', () => {
    const g = vi.fn();
    (window as W).gtag = g;
    track('theme_change', { theme_mode: 'dark', gone: undefined });
    expect(g).toHaveBeenCalledWith('event', 'theme_change', {
      theme_mode: 'dark',
    });
  });

  it('never throws when gtag throws', () => {
    (window as W).gtag = () => {
      throw new Error('boom');
    };
    expect(() => track('x')).not.toThrow();
  });
});
