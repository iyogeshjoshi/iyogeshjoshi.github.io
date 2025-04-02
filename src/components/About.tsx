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

const Title = styled(motion.h2)`
  color: var(--accent-color);
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const Tagline = styled(motion.p)`
  font-size: 1.5rem;
  color: var(--secondary-color);
  margin-bottom: 2rem;
`;

const Content = styled.div`
  max-width: 800px;
`;

const Bio = styled.div`
  color: var(--text-color);
  font-size: 1.2rem;
  line-height: 1.6;

  p {
    margin-bottom: 1rem;
  }

  a {
    color: var(--accent-color);
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      text-decoration: underline;
    }
  }
`;

interface AboutProps {
  bio: string;
  tagline: string;
  name: string;
}

const About: React.FC<AboutProps> = ({ bio, tagline, name }) => {
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
        {name}
      </Title>
      <Tagline
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        {tagline}
      </Tagline>
      <Content>
        <Bio>
          {bio}
        </Bio>
      </Content>
    </AboutContainer>
  );
};

export default About; 