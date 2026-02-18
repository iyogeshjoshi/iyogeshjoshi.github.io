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

const Content = styled(motion.div)`
  max-width: 800px;
`;

const Bio = styled(motion.div)`
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const About: React.FC<AboutProps> = ({ bio, tagline, name }) => {
  return (
    <AboutContainer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20%" }}
    >
      <Title
        variants={fadeInUp}
      >
        {name}
      </Title>
      <Tagline
        variants={fadeInUp}
      >
        {tagline}
      </Tagline>
      <Content>
        <Bio
          variants={fadeInUp}
        >
          {bio}
        </Bio>
      </Content>
    </AboutContainer>
  );
};

export default About; 