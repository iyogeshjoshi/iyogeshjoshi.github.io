import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface Skill {
  name: string;
  items: string[];
  progress?: number;
  level?: string;
}

const SkillsContainer = styled(motion.div)`
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

const SkillCard = styled(motion.div)`
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

const SkillCategory = styled.h3`
  color: var(--text-color);
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const SkillList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const SkillTag = styled(motion.span)`
  background-color: var(--card-bg);
  color: var(--accent-color);
  border: 1px solid var(--card-border);
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--accent-color);
    color: var(--bg-color);
    transform: translateY(-2px);
  }
`;

const ProgressBar = styled.div<{ progress?: number }>`
  width: 100%;
  height: 6px;
  background-color: var(--card-border);
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const Progress = styled.div<{ progress?: number }>`
  width: ${props => (props.progress || 0)}%;
  height: 100%;
  background-color: var(--accent-color);
  border-radius: 3px;
  transition: width 0.6s ease;
`;

const SkillLevel = styled.div`
  color: var(--secondary-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface SkillsProps {
  skills: Skill[];
}

const Skills: React.FC<SkillsProps> = ({ skills = [] }) => {
  return (
    <SkillsContainer
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
        Skills & Expertise
      </Title>
      <SkillsGrid>
        {(skills || []).map((category, index) => (
          <SkillCard
            key={category.name || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <SkillCategory>{category.name}</SkillCategory>
            <SkillList>
              {(category.items || []).map((item, itemIndex) => (
                <SkillTag
                  key={item || itemIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + itemIndex * 0.05 }}
                >
                  {item}
                </SkillTag>
              ))}
            </SkillList>
          </SkillCard>
        ))}
      </SkillsGrid>
    </SkillsContainer>
  );
};

export default Skills; 