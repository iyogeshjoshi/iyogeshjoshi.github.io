import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { installMatchMedia } from '../test/matchMedia';
import type { MatchMediaMock } from '../test/matchMedia';
import { useTheme } from './useTheme';

describe('useTheme analytics', () => {
  let mm: MatchMediaMock;
  const gtag = vi.fn();

  beforeEach(() => {
    gtag.mockReset();
    (window as Window & { gtag?: unknown }).gtag = gtag;
    window.localStorage.clear();
    document.documentElement.dataset.theme = 'light';
    document.documentElement.dataset.themeMode = 'light';
    mm = installMatchMedia();
  });

  afterEach(() => {
    mm.restore();
    delete (window as Window & { gtag?: unknown }).gtag;
  });

  it('does not fire theme_change on mount', () => {
    renderHook(() => useTheme());
    expect(gtag).not.toHaveBeenCalled();
  });

  it('fires theme_change when the user cycles', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.cycle());
    expect(gtag).toHaveBeenCalledWith('event', 'theme_change', {
      theme_mode: 'dark',
    });
  });
});
