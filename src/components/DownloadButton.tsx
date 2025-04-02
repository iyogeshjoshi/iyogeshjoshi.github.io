import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FloatingButton = styled(motion.button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: #64ffda;
  color: #0a192f;
  padding: 1rem 2rem;
  border-radius: 30px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
`;

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 11v3H2v-3H0v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2zm-1-4l-1.41-1.41L9 8.17V0H7v8.17L4.41 5.59 3 7l5 5 5-5z"
      fill="currentColor"
    />
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DownloadIcon />
      Resume
    </FloatingButton>
  );
};

export default DownloadButton; 