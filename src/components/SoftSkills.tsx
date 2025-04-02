import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Skill } from '../utils/yamlLoader';

const SoftSkillsContainer = styled(motion.div)`
  padding: 2rem 0;
`;

const Title = styled(motion.h2)`
  color: var(--accent-color);
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const SkillsGrid = styled(motion.div)`
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

const CategoryTitle = styled(motion.h3)`
  color: var(--text-color);
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const SkillsList = styled(motion.ul)`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const SkillItem = styled(motion.li)`
  background-color: var(--card-bg);
  color: var(--accent-color);
  padding: 0.4rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  border: 1px solid var(--card-border);
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--accent-color);
    color: var(--bg-color);
    transform: translateY(-2px);
  }
`;

interface SoftSkillsProps {
  softSkills: Skill[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const categoryVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const SoftSkills: React.FC<SoftSkillsProps> = ({ softSkills }) => {
  return (
    <SoftSkillsContainer
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20%" }}
    >
      <Title variants={itemVariants}>Soft Skills</Title>
      <SkillsGrid>
        {softSkills.map((category, index) => (
          <SkillCategory
            key={category.name}
            variants={categoryVariants}
          >
            <CategoryTitle variants={itemVariants}>
              {category.name}
            </CategoryTitle>
            <SkillsList>
              {category.items.map((skill, skillIndex) => (
                <SkillItem
                  key={`${category.name}-${skillIndex}`}
                  variants={itemVariants}
                >
                  {skill}
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