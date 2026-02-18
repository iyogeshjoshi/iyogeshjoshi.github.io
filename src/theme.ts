export interface Theme {
  type: 'light' | 'dark';
  colors: {
    background: string;
    text: string;
    accent: string;
    secondary: string;
    cardBg: string;
    cardBorder: string;
  };
}

export const lightTheme: Theme = {
  type: 'light',
  colors: {
    background: 'var(--bg-color)',
    text: 'var(--text-color)',
    accent: 'var(--accent-color)',
    secondary: 'var(--secondary-color)',
    cardBg: 'var(--card-bg)',
    cardBorder: 'var(--card-border)'
  }
};

export const darkTheme: Theme = {
  type: 'dark',
  colors: {
    background: 'var(--bg-color)',
    text: 'var(--text-color)',
    accent: 'var(--accent-color)',
    secondary: 'var(--secondary-color)',
    cardBg: 'var(--card-bg)',
    cardBorder: 'var(--card-border)'
  }
}; 