import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    /* Dark theme (default) - Purple Gradient Palette */
    --bg-color: #1E1434; /* Rich dark purple background */
    --text-color: #E8E0F0; /* Soft lavender white for readability */
    --secondary-color: #B794F6; /* Light purple for secondary */
    --accent-color: #9F7AEA; /* Medium purple for accents */
    --card-bg: rgba(159, 122, 234, 0.08);
    --card-border: rgba(159, 122, 234, 0.2);
    --shadow-color: rgba(0, 0, 0, 0.3);
    
    /* Color palette - Dark theme */
    --color-primary-500: #9F7AEA;
    --color-secondary-500: #B794F6;
    --color-accent-500: #D6BCFA;
    --color-neutral-50: #E8E0F0;
    --color-neutral-100: #2D2344;
    --color-neutral-800: #4C3668;
    --color-neutral-900: #1E1434; */
    
    /* Typography */
    --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --spacing-3xl: 4rem;
    
    /* Animation */
    --duration-fast: 0.15s;
    --duration-normal: 0.3s;
    --duration-slow: 0.5s;
    --easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
    --easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  }

  [data-theme='light'] {
    --bg-color: #F8F5FA; /* Soft lavender white background */
    --text-color: #3D2C5E; /* Dark purple-gray for readable text */
    --secondary-color: #7C3AED; /* Vivid purple for secondary */
    --accent-color: #8B5CF6; /* Bright purple for accents */
    --card-bg: rgba(139, 92, 246, 0.06);
    --card-border: rgba(139, 92, 246, 0.15);
    --shadow-color: rgba(61, 44, 94, 0.08);
  }

  [data-theme='auto'] {
    /* Auto theme will inherit from system preference */
  }

  @media (prefers-color-scheme: light) {
    [data-theme='auto'] {
      --bg-color: #F8F5FA;
      --text-color: #3D2C5E;
      --secondary-color: #7C3AED;
      --accent-color: #8B5CF6;
      --card-bg: rgba(139, 92, 246, 0.06);
      --card-border: rgba(139, 92, 246, 0.15);
      --shadow-color: rgba(61, 44, 94, 0.08);
    }
  }

  @media (prefers-color-scheme: dark) {
    [data-theme='auto'] {
      --bg-color: #1E1434;
      --text-color: #E8E0F0;
      --secondary-color: #B794F6;
      --accent-color: #9F7AEA;
      --card-bg: rgba(159, 122, 234, 0.08);
      --card-border: rgba(159, 122, 234, 0.2);
      --shadow-color: rgba(0, 0, 0, 0.3);
    }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  *::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-family-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--bg-color);
    color: var(--text-color);
    overflow-x: hidden;
    transition: background-color var(--duration-normal) var(--easing-ease-out),
                color var(--duration-normal) var(--easing-ease-out);
  }

  #root {
    min-height: 100vh;
  }

  /* Enhanced smooth transitions for theme changes */
  * {
    transition: background-color var(--duration-normal) var(--easing-ease-out),
                color var(--duration-normal) var(--easing-ease-out),
                border-color var(--duration-normal) var(--easing-ease-out),
                box-shadow var(--duration-normal) var(--easing-ease-out),
                opacity var(--duration-fast) var(--easing-ease-out),
                transform var(--duration-fast) var(--easing-ease-out);
  }

  /* Focus styles for accessibility */
  *:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  /* Selection styles */
  ::selection {
    background-color: var(--accent-color);
    color: var(--bg-color);
  }

  /* Scrollbar styles for webkit browsers */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--card-bg);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--accent-color);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-color);
  }
`;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);
