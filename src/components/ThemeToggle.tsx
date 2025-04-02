import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ToggleButton = styled(motion.button)`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: var(--accent-color);
  color: var(--bg-color);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s ease;
  z-index: 1000;
  padding: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
  }

  @media (max-width: 768px) {
    right: 15px;
    width: 32px;
    height: 32px;
    font-size: 14px;
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
      whileHover={{ scale: 1.05 }}
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