import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { hoverEffects, buttonFeedback } from '../utils/microInteractions';

interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'auto';
  onToggle: () => void;
}

const ToggleButton = styled(motion.button)`
  background: var(--accent-color);
  color: #ffffff;
  border: none;
  height: 40px;
  padding: 0 var(--spacing-md);
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: all var(--duration-normal) var(--easing-ease-out);
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 8px 20px var(--shadow-color);
    background-color: var(--secondary-color);
  }

  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  /* Light theme button */
  [data-theme='light'] & {
    color: #ffffff;
  }

  [data-theme='auto'] & {
    @media (prefers-color-scheme: light) {
      color: #ffffff;
    }
  }

  @media (max-width: 768px) {
    height: 36px;
    padding: 0 var(--spacing-sm);
    font-size: 13px;
  }
`;

const ThemeIcon = styled(motion.span)`
  font-size: 16px;
  display: flex;
  align-items: center;
  transition: transform var(--duration-normal) var(--easing-ease-out);
`;

const ThemeLabel = styled(motion.span)`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const getThemeIcon = (theme: 'light' | 'dark' | 'auto') => {
  switch (theme) {
    case 'light':
      return '☀️';
    case 'dark':
      return '🌙';
    case 'auto':
      return '🔄';
    default:
      return '🔄';
  }
};

const getThemeLabel = (theme: 'light' | 'dark' | 'auto') => {
  switch (theme) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'auto':
      return 'Auto';
    default:
      return 'Auto';
  }
};

const getNextTheme = (currentTheme: 'light' | 'dark' | 'auto') => {
  switch (currentTheme) {
    case 'light':
      return 'dark';
    case 'dark':
      return 'auto';
    case 'auto':
      return 'light';
    default:
      return 'light';
  }
};

const iconVariants = {
  initial: { rotate: 0, scale: 1 },
  animate: { rotate: 360, scale: [1, 1.2, 1] },
  hover: { rotate: 15, scale: 1.1 },
};

const labelVariants = {
  initial: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  enter: { opacity: 1, y: 0 },
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const nextTheme = getNextTheme(theme);

  return (
    <ToggleButton
      onClick={onToggle}
      {...hoverEffects.lift}
      {...buttonFeedback}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      title={`Current theme: ${getThemeLabel(theme)}. Click to switch to ${getThemeLabel(nextTheme)}.`}
      aria-label={`Switch theme from ${getThemeLabel(theme)} to ${getThemeLabel(nextTheme)}`}
    >
      <ThemeIcon
        variants={iconVariants}
        initial="initial"
        animate="initial"
        whileHover="hover"
        whileTap="animate"
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={theme}
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 180, scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            {getThemeIcon(theme)}
          </motion.span>
        </AnimatePresence>
      </ThemeIcon>
      
      <AnimatePresence mode="wait">
        <ThemeLabel
          key={theme}
          variants={labelVariants}
          initial="exit"
          animate="enter"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {getThemeLabel(theme)}
        </ThemeLabel>
      </AnimatePresence>
    </ToggleButton>
  );
};

export default ThemeToggle;
