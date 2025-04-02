import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const ToggleButton = styled(motion.button)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--accent-color);
  color: var(--bg-color);
  border: none;
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  box-shadow: 0 2px 8px var(--shadow-color);
  z-index: 1000;

  @media (max-width: 768px) {
    right: 15px;
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
  }
`;

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <ToggleButton
      onClick={onToggle}
      whileHover={{ scale: 1.05, translateY: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </ToggleButton>
  );
};

export default ThemeToggle; 