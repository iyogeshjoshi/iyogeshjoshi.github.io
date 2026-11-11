export const THEME_STORAGE_KEY = 'theme';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#0A0F1A',
  light: '#F6F7F9',
};

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  light: 'dark',
  dark: 'auto',
  auto: 'light',
};

export const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'auto';

export const nextMode = (mode: ThemeMode): ThemeMode => NEXT_MODE[mode];

export const readMode = (): ThemeMode => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
};

export const writeMode = (mode: ThemeMode): void => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage may be unavailable (private mode, blocked); theme still applies.
  }
};

export const resolve = (mode: ThemeMode, prefersLight: boolean): ResolvedTheme => {
  if (mode === 'auto') return prefersLight ? 'light' : 'dark';
  return mode;
};

export const LIGHT_QUERY = '(prefers-color-scheme: light)';

export const systemPrefersLight = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia(LIGHT_QUERY).matches;
  } catch {
    return false;
  }
};

/** Sets data-theme / data-theme-mode and <meta name="theme-color">. No-op on the server. */
export const applyTheme = (mode: ThemeMode): ResolvedTheme => {
  const resolved = resolve(mode, systemPrefersLight());
  if (typeof document === 'undefined') return resolved;

  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themeMode = mode;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[resolved]);
  return resolved;
};
