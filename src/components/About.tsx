import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AboutContainer = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 80px;
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #64ffda;
`;

const Tagline = styled(motion.p)`
  font-size: 1.5rem;
  color: #8892b0;
  margin-bottom: 2rem;
`;

const Bio = styled(motion.p)`
  font-size: 1.2rem;
  line-height: 1.8;
  max-width: 800px;
  color: #e6f1ff;
`;

interface AboutProps {
  bio: string;
  tagline: string;
}

const About: React.FC<AboutProps> = ({ bio, tagline }) => {
  return (
    <AboutContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Title
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        Yogesh Joshi
      </Title>
      <Tagline
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        {tagline}
      </Tagline>
      <Bio
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        {bio}
      </Bio>
    </AboutContainer>
  );
};

export default About; 