import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { hoverEffects, buttonFeedback } from '../utils/microInteractions';

const Button = styled(motion.button)`
  background-color: var(--accent-color);
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

  svg {
    width: 16px;
    height: 16px;
    transition: transform var(--duration-normal) var(--easing-ease-out);
  }

  &:hover svg {
    transform: translateY(2px);
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

    svg {
      width: 14px;
      height: 14px;
    }
  }

  @media (max-width: 480px) {
    padding: 0 var(--spacing-xs);
    
    span {
      display: none;
    }
  }
`;

const SuccessIndicator = styled(motion.div)`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-success);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--color-success);
  }
`;

const DownloadIcon = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    whileHover={{ y: 2 }}
    transition={{ duration: 0.2 }}
  >
    <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
  </motion.svg>
);

interface DownloadButtonProps {
  onDownload: () => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ onDownload }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDownload = () => {
    onDownload();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div style={{ position: 'relative' }}>
      <AnimatePresence>
        {showSuccess && (
          <SuccessIndicator
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            Download Started!
          </SuccessIndicator>
        )}
      </AnimatePresence>
      
      <Button
        onClick={handleDownload}
        {...hoverEffects.lift}
        {...buttonFeedback}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        title="Download Resume"
        aria-label="Download resume PDF"
      >
        <DownloadIcon />
        <span>Resume</span>
      </Button>
    </div>
  );
};

export default DownloadButton;
