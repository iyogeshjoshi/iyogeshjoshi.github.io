// Color Shades Interface
export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base color
  600: string;
  700: string;
  800: string;
  900: string;
}

// Semantic Colors Interface
export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

// Color Palette Interface
export interface ColorPalette {
  primary: ColorShades;
  secondary: ColorShades;
  accent: ColorShades;
  neutral: ColorShades;
  semantic: SemanticColors;
}

// Typography Scale Interface
export interface TypographyScale {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

// Spacing Scale Interface
export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

// Animation Settings Interface
export interface AnimationSettings {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

// Breakpoint Configuration Interface
export interface BreakpointConfiguration {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Enhanced Theme Interface
export interface Theme {
  type: 'light' | 'dark' | 'auto';
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  animations: AnimationSettings;
  breakpoints: BreakpointConfiguration;
}

// Dark Theme Color Palette - Purple Gradient
const darkColorPalette: ColorPalette = {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Base - Purple
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Base - Magenta
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  accent: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899', // Base - Pink
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a', // Base
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#8b5cf6',
  },
};

// Light Theme Color Palette - Purple Gradient
const lightColorPalette: ColorPalette = {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Base - Purple
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Base - Magenta
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  accent: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899', // Base - Pink
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a', // Base
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  semantic: {
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#7c3aed',
  },
};

// Typography Scale
const typography: TypographyScale = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    secondary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing Scale
const spacing: SpacingScale = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem',   // 128px
};

// Animation Settings
const animations: AnimationSettings = {
  duration: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Breakpoint Configuration
const breakpoints: BreakpointConfiguration = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Dark Theme
export const darkTheme: Theme = {
  type: 'dark',
  colors: darkColorPalette,
  typography,
  spacing,
  animations,
  breakpoints,
};

// Light Theme
export const lightTheme: Theme = {
  type: 'light',
  colors: lightColorPalette,
  typography,
  spacing,
  animations,
  breakpoints,
};

// Auto Theme (will be determined by system preference)
export const autoTheme: Theme = {
  type: 'auto',
  colors: darkColorPalette, // Default to dark, will be overridden by system preference
  typography,
  spacing,
  animations,
  breakpoints,
};

// Theme utilities
export const getThemeColors = (isDark: boolean = false) => {
  const colors = isDark ? darkColorPalette : lightColorPalette;
  return colors;
};

// CSS Custom Properties Generator
export const generateCSSCustomProperties = (theme: Theme, isDark: boolean = false) => {
  const colors = isDark ? darkColorPalette : lightColorPalette;
  
  return {
    // Primary colors
    '--color-primary-50': colors.primary[50],
    '--color-primary-100': colors.primary[100],
    '--color-primary-200': colors.primary[200],
    '--color-primary-300': colors.primary[300],
    '--color-primary-400': colors.primary[400],
    '--color-primary-500': colors.primary[500],
    '--color-primary-600': colors.primary[600],
    '--color-primary-700': colors.primary[700],
    '--color-primary-800': colors.primary[800],
    '--color-primary-900': colors.primary[900],
    
    // Secondary colors
    '--color-secondary-50': colors.secondary[50],
    '--color-secondary-100': colors.secondary[100],
    '--color-secondary-200': colors.secondary[200],
    '--color-secondary-300': colors.secondary[300],
    '--color-secondary-400': colors.secondary[400],
    '--color-secondary-500': colors.secondary[500],
    '--color-secondary-600': colors.secondary[600],
    '--color-secondary-700': colors.secondary[700],
    '--color-secondary-800': colors.secondary[800],
    '--color-secondary-900': colors.secondary[900],
    
    // Accent colors
    '--color-accent-50': colors.accent[50],
    '--color-accent-100': colors.accent[100],
    '--color-accent-200': colors.accent[200],
    '--color-accent-300': colors.accent[300],
    '--color-accent-400': colors.accent[400],
    '--color-accent-500': colors.accent[500],
    '--color-accent-600': colors.accent[600],
    '--color-accent-700': colors.accent[700],
    '--color-accent-800': colors.accent[800],
    '--color-accent-900': colors.accent[900],
    
    // Neutral colors
    '--color-neutral-50': colors.neutral[50],
    '--color-neutral-100': colors.neutral[100],
    '--color-neutral-200': colors.neutral[200],
    '--color-neutral-300': colors.neutral[300],
    '--color-neutral-400': colors.neutral[400],
    '--color-neutral-500': colors.neutral[500],
    '--color-neutral-600': colors.neutral[600],
    '--color-neutral-700': colors.neutral[700],
    '--color-neutral-800': colors.neutral[800],
    '--color-neutral-900': colors.neutral[900],
    
    // Semantic colors
    '--color-success': colors.semantic.success,
    '--color-warning': colors.semantic.warning,
    '--color-error': colors.semantic.error,
    '--color-info': colors.semantic.info,
    
    // Legacy color mappings for backward compatibility
    '--bg-color': isDark ? '#4B0082' : '#DDA0DD', // Deep purple : Light purple
    '--text-color': isDark ? '#ffffff' : '#4B0082', // White : Deep purple
    '--secondary-color': isDark ? '#BA55D3' : '#8A2BE2', // Medium orchid : Blue violet
    '--accent-color': isDark ? '#8A2BE2' : '#9370DB', // Blue violet : Medium slate blue
    '--card-bg': isDark ? 'rgba(138, 43, 226, 0.1)' : 'rgba(147, 112, 219, 0.05)',
    '--card-border': isDark ? 'rgba(138, 43, 226, 0.2)' : 'rgba(147, 112, 219, 0.15)',
    '--shadow-color': isDark ? 'rgba(75, 0, 130, 0.3)' : 'rgba(75, 0, 130, 0.1)',
    
    // Typography
    '--font-family-primary': theme.typography.fontFamily.primary,
    '--font-family-secondary': theme.typography.fontFamily.secondary,
    '--font-family-mono': theme.typography.fontFamily.mono,
    
    // Spacing
    '--spacing-xs': theme.spacing.xs,
    '--spacing-sm': theme.spacing.sm,
    '--spacing-md': theme.spacing.md,
    '--spacing-lg': theme.spacing.lg,
    '--spacing-xl': theme.spacing.xl,
    '--spacing-2xl': theme.spacing['2xl'],
    '--spacing-3xl': theme.spacing['3xl'],
    '--spacing-4xl': theme.spacing['4xl'],
    '--spacing-5xl': theme.spacing['5xl'],
    
    // Animation
    '--duration-fast': theme.animations.duration.fast,
    '--duration-normal': theme.animations.duration.normal,
    '--duration-slow': theme.animations.duration.slow,
    '--easing-ease-in': theme.animations.easing.easeIn,
    '--easing-ease-out': theme.animations.easing.easeOut,
    '--easing-ease-in-out': theme.animations.easing.easeInOut,
  };
};
