import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { entranceAnimations, staggerContainer, hoverEffects } from '../utils/microInteractions';

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
  cursor: default;
  
  &:hover {
    filter: brightness(1.1);
  }
`;

const Tagline = styled(motion.p)`
  font-size: 1.5rem;
  color: var(--secondary-color);
  margin-bottom: 2rem;
  cursor: default;
  
  &:hover {
    filter: brightness(1.05);
  }
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
    transition: all var(--duration-normal) var(--easing-ease-out);
    
    &:hover {
      transform: translateX(4px);
      color: var(--secondary-color);
    }
  }

  a {
    color: var(--accent-color);
    text-decoration: none;
    position: relative;
    transition: all var(--duration-normal) var(--easing-ease-out);

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--accent-color);
      transition: width var(--duration-normal) var(--easing-ease-out);
    }

    &:hover {
      color: var(--secondary-color);
      transform: translateY(-1px);
      
      &::after {
        width: 100%;
      }
    }

    &:focus {
      outline: 2px solid var(--accent-color);
      outline-offset: 2px;
      border-radius: 2px;
    }
  }
`;

const HighlightText = styled(motion.span)`
  color: var(--accent-color);
  font-weight: 600;
  cursor: default;
  transition: all var(--duration-normal) var(--easing-ease-out);
  
  &:hover {
    color: var(--secondary-color);
    text-shadow: 0 0 8px rgba(138, 43, 226, 0.3);
  }
`;

interface AboutProps {
  bio: string;
  tagline: string;
  name: string;
}

const About: React.FC<AboutProps> = ({ bio, tagline, name }) => {
  // Enhanced bio rendering with interactive highlights
  const renderBio = (bioText: string) => {
    // Split bio into paragraphs and add interactive elements
    const paragraphs = bioText.split('\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Split paragraph into words and highlight key terms
      const words = paragraph.split(' ');
      const highlightedContent = words.map((word, wordIndex) => {
        // Remove punctuation for matching but keep it for display
        const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
        const keyTerms = ['developer', 'engineer', 'programming', 'technology', 'software', 'web', 'mobile', 'full-stack', 'javascript', 'development'];
        
        if (keyTerms.includes(cleanWord)) {
          return (
            <HighlightText
              key={`${index}-${wordIndex}`}
              {...hoverEffects.glow}
            >
              {word}
            </HighlightText>
          );
        }
        return word;
      });

      // Join words with spaces, handling React elements properly
      const content = highlightedContent.reduce((acc, word, wordIndex) => {
        if (wordIndex === 0) return [word];
        return [...acc, ' ', word];
      }, [] as React.ReactNode[]);

      return (
        <motion.p
          key={index}
          variants={entranceAnimations.fadeInUp}
          custom={index}
          whileHover={{
            x: 4,
            transition: { duration: 0.2 }
          }}
        >
          {content}
        </motion.p>
      );
    });
  };

  return (
    <AboutContainer
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20%' }}
    >
      <Title 
        variants={entranceAnimations.fadeInUp}
        {...hoverEffects.glow}
      >
        {name}
      </Title>
      <Tagline 
        variants={entranceAnimations.fadeInUp}
        {...hoverEffects.bounce}
      >
        {tagline}
      </Tagline>
      <Content variants={entranceAnimations.fadeInUp}>
        <Bio>
          {renderBio(bio)}
        </Bio>
      </Content>
    </AboutContainer>
  );
};

export default About;
