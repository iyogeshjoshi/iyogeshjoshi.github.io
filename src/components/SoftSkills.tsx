import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Skill } from '../utils/yamlLoader';

const SoftSkillsContainer = styled(motion.div)`
  min-height: 100vh;
  padding-top: 100px;
`;

const Title = styled(motion.h2)`
  font-size: 2.5rem;
  color: #64ffda;
  margin-bottom: 3rem;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const SkillCategory = styled(motion.div)`
  background-color: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(100, 255, 218, 0.15);
    background-color: rgba(100, 255, 218, 0.15);
    border-color: rgba(100, 255, 218, 0.4);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at center,
      rgba(100, 255, 218, 0.1) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const CategoryTitle = styled.h3`
  color: #64ffda;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 50px;
    height: 2px;
    background-color: #64ffda;
  }
`;

const SkillsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SkillItem = styled(motion.li)`
  color: #e6f1ff;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;

  &::before {
    content: '▹';
    color: #64ffda;
  }
`;

interface SoftSkillsProps {
  softSkills: Skill[];
}

const SoftSkills: React.FC<SoftSkillsProps> = ({ softSkills }) => {
  return (
    <SoftSkillsContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Professional Skills
      </Title>
      <SkillsGrid>
        {softSkills.map((category, index) => (
          <SkillCategory
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <CategoryTitle>{category.name}</CategoryTitle>
            <SkillsList>
              {category.items.map((item, itemIndex) => (
                <SkillItem
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + itemIndex * 0.05 }}
                >
                  {item}
                </SkillItem>
              ))}
            </SkillsList>
          </SkillCategory>
        ))}
      </SkillsGrid>
    </SoftSkillsContainer>
  );
};

export default SoftSkills; 