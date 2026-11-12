import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import {
  LIGHT_QUERY,
  applyTheme,
  isThemeMode,
  nextMode,
  resolve,
  systemPrefersLight,
  writeMode,
} from './themeStore';
import type { ResolvedTheme, ThemeMode } from './themeStore';

export interface UseTheme {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  cycle: () => void;
  setMode: (mode: ThemeMode) => void;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

const initialMode = (): ThemeMode => {
  if (typeof document === 'undefined') return 'auto';
  const attr = document.documentElement.dataset.themeMode;
  return isThemeMode(attr) ? attr : 'auto';
};

const initialResolved = (mode: ThemeMode): ResolvedTheme => {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.dataset.theme;
    if (attr === 'light' || attr === 'dark') return attr;
  }
  return resolve(mode, systemPrefersLight());
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// useLayoutEffect warns during server rendering; it is only needed in the browser.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** What the server renders: no stored preference is visible there. */
const SERVER_MODE: ThemeMode = 'auto';
const SERVER_RESOLVED: ResolvedTheme = resolve(SERVER_MODE, false);

export const useTheme = (): UseTheme => {
  // Start from the server values so hydration matches the prerendered markup,
  // then adopt what the inline head script put on <html> before first paint.
  const [mode, setModeState] = useState<ThemeMode>(SERVER_MODE);
  const [resolved, setResolved] = useState<ResolvedTheme>(SERVER_RESOLVED);

  useIsomorphicLayoutEffect(() => {
    const current = initialMode();
    setModeState(current);
    setResolved(initialResolved(current));
  }, []);

  // Follow system changes while in auto.
  useEffect(() => {
    if (mode !== 'auto' || typeof window.matchMedia !== 'function')
      return undefined;
    const mql = window.matchMedia(LIGHT_QUERY);
    const onChange = (): void => setResolved(applyTheme('auto'));
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    const commit = (): void => {
      setModeState(next);
      setResolved(applyTheme(next));
    };
    writeMode(next);
    const doc = document as ViewTransitionDocument;
    if (
      typeof doc.startViewTransition === 'function' &&
      !prefersReducedMotion()
    ) {
      doc.startViewTransition(commit);
    } else {
      commit();
    }
  }, []);

  const cycle = useCallback(() => setMode(nextMode(mode)), [mode, setMode]);

  return { mode, resolved, cycle, setMode };
};
