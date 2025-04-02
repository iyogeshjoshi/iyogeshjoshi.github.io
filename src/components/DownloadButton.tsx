import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FloatingButton = styled(motion.button)`
  position: fixed;
  top: 20px;
  right: 76px;
  background-color: var(--accent-color);
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
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
  }

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    right: 67px;
    height: 32px;
    padding: 0 12px;
    font-size: 13px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
  </svg>
);

interface DownloadButtonProps {
  onDownload: () => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ onDownload }) => {
  return (
    <FloatingButton
      onClick={onDownload}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DownloadIcon />
      Resume
    </FloatingButton>
  );
};

export default DownloadButton; 