import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    /* Dark theme (default) - Lavender Variant */
    --bg-color: #2D2344; /* Soft dark lavender background */
    --text-color: #E8E0F0; /* Soft lavender white for readability */
    --secondary-color: #B794F6; /* Light purple for secondary */
    --accent-color: #9F7AEA; /* Medium purple for accents */
    --card-bg: rgba(159, 122, 234, 0.1);
    --card-border: rgba(159, 122, 234, 0.25);
    --shadow-color: rgba(0, 0, 0, 0.25);
    
    /* Color palette - Dark theme */
    --color-primary-500: #9F7AEA;
    --color-secondary-500: #B794F6;
    --color-accent-500: #D6BCFA;
    --color-neutral-50: #E8E0F0;
    --color-neutral-100: #3D3259;
    --color-neutral-800: #5B4B7C;
    --color-neutral-900: #2D2344;
    
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
    --bg-color: #DDA0DD; /* Light purple background */
    --text-color: #4B0082; /* Deep purple text */
    --secondary-color: #8A2BE2; /* Blue violet for secondary text */
    --accent-color: #9370DB; /* Medium slate blue for accents */
    --card-bg: rgba(147, 112, 219, 0.05);
    --card-border: rgba(147, 112, 219, 0.15);
    --shadow-color: rgba(75, 0, 130, 0.1);
  }

  [data-theme='auto'] {
    /* Auto theme will inherit from system preference */
  }

  @media (prefers-color-scheme: light) {
    [data-theme='auto'] {
      --bg-color: #DDA0DD;
      --text-color: #4B0082;
      --secondary-color: #8A2BE2;
      --accent-color: #9370DB;
      --card-bg: rgba(147, 112, 219, 0.05);
      --card-border: rgba(147, 112, 219, 0.15);
      --shadow-color: rgba(75, 0, 130, 0.1);
    }
  }

  @media (prefers-color-scheme: dark) {
    [data-theme='auto'] {
      --bg-color: #2D2344;
      --text-color: #E8E0F0;
      --secondary-color: #B794F6;
      --accent-color: #9F7AEA;
      --card-bg: rgba(159, 122, 234, 0.1);
      --card-border: rgba(159, 122, 234, 0.25);
      --shadow-color: rgba(0, 0, 0, 0.25);
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
