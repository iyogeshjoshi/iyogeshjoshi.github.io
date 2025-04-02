import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Skill } from '../utils/yamlLoader';

const SoftSkillsContainer = styled(motion.div)`
  min-height: 100vh;
  padding-top: 100px;
`;

const Title = styled(motion.h2)`
  color: var(--accent-color);
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const SkillCategory = styled(motion.div)`
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px var(--shadow-color);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px var(--shadow-color);
    border-color: var(--accent-color);
  }
`;

const CategoryTitle = styled.h3`
  color: var(--text-color);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
`;

const SkillsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SkillItem = styled(motion.li)`
  color: var(--text-color);
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;

  &::before {
    content: '▹';
    color: var(--accent-color);
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