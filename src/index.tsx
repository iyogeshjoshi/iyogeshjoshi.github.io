import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    /* Dark theme (default) */
    --bg-color: #0a192f;
    --text-color: #e6f1ff;
    --secondary-color: #8892b0;
    --accent-color: #64ffda;
    --card-bg: rgba(100, 255, 218, 0.1);
    --card-border: rgba(100, 255, 218, 0.2);
    --shadow-color: rgba(0, 0, 0, 0.2);
  }

  [data-theme='light'] {
    --bg-color: #f5f5f5;
    --text-color: #2d3748;
    --secondary-color: #4a5568;
    --accent-color: #0d9488;
    --card-bg: rgba(13, 148, 136, 0.1);
    --card-border: rgba(13, 148, 136, 0.2);
    --shadow-color: rgba(0, 0, 0, 0.1);
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
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--bg-color);
    color: var(--text-color);
    overflow-x: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  #root {
    min-height: 100vh;
  }

  /* Add smooth transitions for theme changes */
  * {
    transition: background-color 0.3s ease,
                color 0.3s ease,
                border-color 0.3s ease,
                box-shadow 0.3s ease;
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