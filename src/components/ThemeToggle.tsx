import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ToggleButton = styled(motion.button)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--bg-color);
  border: 1px solid var(--accent-color);
  color: var(--accent-color);
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  z-index: 1000;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px var(--shadow-color);

  &:hover {
    background: var(--accent-color);
    color: var(--bg-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px var(--shadow-color);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <ToggleButton
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {theme === 'light' ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          Dark Mode
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          Light Mode
        </>
      )}
    </ToggleButton>
  );
};

export default ThemeToggle; 