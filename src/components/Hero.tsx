import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { hoverEffects, entranceAnimations, staggerContainer } from '../utils/microInteractions';

// Styled Components
const HeroContainer = styled(motion.section)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 120px var(--spacing-xl) var(--spacing-xl);
  overflow: hidden;
  background: linear-gradient(135deg, var(--bg-color) 0%, rgba(138, 43, 226, 0.1) 100%);

  @media (max-width: 768px) {
    padding: 100px var(--spacing-md) var(--spacing-md);
    text-align: center;
  }
`;

const BackgroundAnimation = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
`;

const GeometricShape = styled(motion.div)<{ $size: number; $delay: number }>`
  position: absolute;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border: 2px solid var(--accent-color);
  border-radius: 50%;
  opacity: 0.1;
`;

const ContentContainer = styled(motion.div)`
  position: relative;
  z-index: 2;
  max-width: 800px;
  width: 100%;
  text-align: center;
`;

const Name = styled(motion.h1)`
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: var(--spacing-md);
  line-height: 1.1;
  
  @media (max-width: 768px) {
    margin-bottom: var(--spacing-sm);
  }
`;

const TaglineContainer = styled(motion.div)`
  margin-bottom: var(--spacing-lg);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    min-height: 60px;
    margin-bottom: var(--spacing-md);
  }
`;

const Tagline = styled(motion.h2)`
  font-size: clamp(1.25rem, 4vw, 2rem);
  font-weight: 400;
  color: var(--secondary-color);
  line-height: 1.3;
  position: relative;
  
  &::after {
    content: '|';
    color: var(--accent-color);
    animation: blink 1s infinite;
    margin-left: 2px;
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const Bio = styled(motion.p)`
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: var(--spacing-xl);
  opacity: 0.9;
  
  @media (max-width: 768px) {
    margin-bottom: var(--spacing-lg);
  }
`;

const CTAContainer = styled(motion.div)`
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: var(--spacing-sm);
    flex-direction: column;
    align-items: center;
  }
`;

const CTAButton = styled(motion.button)<{ $variant: 'primary' | 'secondary' | 'outline' }>`
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-out);
  position: relative;
  overflow: hidden;
  min-width: 160px;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
          color: white;
          border: none;
          box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
          
          &:hover {
            box-shadow: 0 12px 35px rgba(138, 43, 226, 0.4);
            transform: translateY(-2px);
          }
        `;
      case 'secondary':
        return `
          background: transparent;
          color: var(--accent-color);
          border: 2px solid var(--accent-color);
          
          &:hover {
            background: var(--accent-color);
            color: white;
            transform: translateY(-2px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: var(--text-color);
          border: 2px solid var(--neutral-400);
          
          &:hover {
            border-color: var(--accent-color);
            color: var(--accent-color);
            transform: translateY(-2px);
          }
        `;
      default:
        return '';
    }
  }}
  
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
  
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
  
  @media (max-width: 768px) {
    min-width: 140px;
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: 0.9rem;
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: var(--spacing-xl);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-color);
  opacity: 0.7;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    bottom: var(--spacing-lg);
  }
`;

const ScrollText = styled.span`
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ScrollArrow = styled(motion.div)`
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid currentColor;
  margin-top: 4px;
`;

// Interfaces
interface CTAButton {
  label: string;
  action: 'scroll' | 'download' | 'contact' | 'external';
  target?: string;
  variant: 'primary' | 'secondary' | 'outline';
}

interface HeroProps {
  name: string;
  tagline: string;
  bio: string;
  ctaButtons: CTAButton[];
  backgroundAnimation?: 'particles' | 'gradient' | 'geometric';
  onCTAClick: (action: string, target?: string) => void;
}

// Typing effect hook
const useTypingEffect = (text: string, speed: number = 100) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    let index = 0;
    setDisplayText('');
    setIsComplete(false);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
};

// Geometric background component
const GeometricBackground: React.FC = () => {
  const shapes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 200 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: i * 0.5,
    duration: 10 + Math.random() * 10,
  }));

  return (
    <BackgroundAnimation>
      {shapes.map((shape) => (
        <GeometricShape
          key={shape.id}
          $size={shape.size}
          $delay={shape.delay}
          initial={{ 
            x: `${shape.x}vw`, 
            y: `${shape.y}vh`,
            scale: 0,
            rotate: 0 
          }}
          animate={{ 
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
            x: [`${shape.x}vw`, `${(shape.x + 20) % 100}vw`],
            y: [`${shape.y}vh`, `${(shape.y + 30) % 100}vh`],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: 'linear',
          }}
        />
      ))}
    </BackgroundAnimation>
  );
};

// Main Hero Component
const Hero: React.FC<HeroProps> = ({
  name,
  tagline,
  bio,
  ctaButtons,
  backgroundAnimation = 'geometric',
  onCTAClick,
}) => {
  const { displayText: typedTagline, isComplete } = useTypingEffect(tagline, 80);

  const handleCTAClick = (button: CTAButton) => {
    onCTAClick(button.action, button.target);
  };

  const scrollToNext = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <HeroContainer
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      id="hero"
    >
      {backgroundAnimation === 'geometric' && <GeometricBackground />}
      
      <ContentContainer>
        <Name
          variants={entranceAnimations.fadeInUp}
          {...hoverEffects.glow}
        >
          {name}
        </Name>

        <TaglineContainer>
          <Tagline
            variants={entranceAnimations.fadeInUp}
            style={{ 
              opacity: typedTagline ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            {typedTagline}
          </Tagline>
        </TaglineContainer>

        <AnimatePresence>
          {isComplete && (
            <>
              <Bio
                variants={entranceAnimations.fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5 }}
              >
                {bio}
              </Bio>

              <CTAContainer
                variants={entranceAnimations.fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.8 }}
              >
                {ctaButtons.map((button, index) => (
                  <CTAButton
                    key={button.label}
                    $variant={button.variant}
                    onClick={() => handleCTAClick(button)}
                    {...hoverEffects.lift}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    aria-label={`${button.label} - ${button.action}`}
                  >
                    {button.label}
                  </CTAButton>
                ))}
              </CTAContainer>
            </>
          )}
        </AnimatePresence>
      </ContentContainer>

      <ScrollIndicator
        onClick={scrollToNext}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 2 }}
        whileHover={{ opacity: 1 }}
        role="button"
        tabIndex={0}
        aria-label="Scroll to next section"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToNext();
          }
        }}
      >
        <ScrollText>Scroll</ScrollText>
        <ScrollArrow
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </ScrollIndicator>
    </HeroContainer>
  );
};

export default Hero;