import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { hoverEffects, entranceAnimations } from '../utils/microInteractions';

const SkillsContainer = styled(motion.div)`
  padding: 2rem 0;
`;

const Title = styled(motion.h2)`
  color: var(--accent-color);
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const SkillsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const SkillCategory = styled(motion.div)<{ expanded: boolean }>`
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 6px var(--shadow-color);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px var(--shadow-color);
    border-color: var(--accent-color);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CategoryTitle = styled(motion.h3)`
  color: var(--text-color);
  font-size: 1.25rem;
  margin: 0;
`;

const CategoryIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.5rem;
`;

const ExpandIcon = styled(motion.span)<{ expanded: boolean }>`
  font-size: 1.5rem;
  color: var(--accent-color);
  transform: rotate(${(props) => (props.expanded ? '180deg' : '0deg')});
  transition: transform 0.3s ease;
`;

const SkillsContent = styled(motion.div)`
  overflow: hidden;
`;

const SkillBar = styled(motion.div)`
  margin-bottom: 1rem;
`;

const SkillBarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const SkillName = styled.span`
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.9rem;
`;

const SkillLevel = styled.span`
  color: var(--accent-color);
  font-size: 0.8rem;
  font-weight: 600;
`;

const SkillBarTrack = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--card-border);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const SkillBarFill = styled(motion.div)<{ proficiency: number }>`
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), #ffffff);
  border-radius: 4px;
  position: relative;
`;

interface SkillData {
  name: string;
  proficiency: number;
  yearsExperience: number;
}

interface SkillCategory {
  name: string;
  icon: string;
  skills: SkillData[];
  color: string;
}

interface Skill {
  name: string;
  items: string[];
}

interface SkillsProps {
  skills: Skill[];
}

const Skills: React.FC<SkillsProps> = ({ skills }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleCategory = () => {
    setIsExpanded(!isExpanded);
  };

  const enhancedSkillCategories: SkillCategory[] = skills.map(
    (category, index) => {
      const icons = ['💻', '🎨', '🔧', '📱', '🌐', '⚡'];
      const colors = [
        '#8A2BE2',
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#96CEB4',
        '#FFEAA7',
      ];

      const skillProficiencies: { [key: string]: number } = {
        'JavaScript/TypeScript': 9,
        'React.js': 9,
        'Node.js': 8,
        Express: 8,
        Redux: 8,
        'Next.js': 8,
        Angular: 7,
        'Vue.js': 7,
        PHP: 7,
        'RESTful APIs': 9,
        GraphQL: 8,
        WebSockets: 7,
        'Socket.io': 7,
        'Microservices Architecture': 8,
        'Serverless Computing': 7,
        'Event-driven Architecture': 7,
        'Firebase Functions': 8,
        Redis: 8,
        PostgreSQL: 8,
        MySQL: 8,
        MongoDB: 8,
        'Firebase Firestore': 8,
        DynamoDB: 7,
        AWS: 8,
        GCP: 7,
        'CI/CD': 8,
        Jenkins: 7,
        'GitHub Actions': 8,
        Docker: 8,
        Kubernetes: 7,
        Terraform: 7,
        Lambda: 7,
        'Google Cloud': 7,
        Jest: 8,
        Mocha: 7,
        Cypress: 8,
        Selenium: 7,
        'TDD/BDD': 8,
        OAuth: 8,
        JWT: 8,
        SAML: 7,
        'Web Security Best Practices': 8,
        'OWASP Guidelines': 7,
      };

      return {
        name: category.name,
        icon: icons[index % icons.length],
        color: colors[index % colors.length],
        skills: category.items.slice(0, 6).map((item) => ({
          name: item,
          proficiency: skillProficiencies[item] || 7,
          yearsExperience: Math.floor(Math.random() * 5) + 3,
        })),
      };
    }
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <SkillsContainer
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20%' }}
    >
      <Title variants={entranceAnimations.fadeInUp}>
        Technical Skills & Expertise
      </Title>

      <SkillsGrid>
        {enhancedSkillCategories.map((category) => {
          return (
            <SkillCategory
              key={category.name}
              variants={categoryVariants}
              expanded={isExpanded}
              onClick={toggleCategory}
              {...hoverEffects.lift}
            >
              <CategoryHeader>
                <CategoryTitle variants={skillVariants}>
                  <CategoryIcon>{category.icon}</CategoryIcon>
                  {category.name}
                </CategoryTitle>
                <ExpandIcon expanded={isExpanded}>⌄</ExpandIcon>
              </CategoryHeader>

              <AnimatePresence>
                {isExpanded && (
                  <SkillsContent
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    {category.skills.map((skill, index) => (
                      <SkillBar
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <SkillBarHeader>
                          <SkillName>{skill.name}</SkillName>
                          <SkillLevel>{skill.proficiency}/10</SkillLevel>
                        </SkillBarHeader>
                        <SkillBarTrack>
                          <SkillBarFill
                            proficiency={skill.proficiency}
                            initial={{ width: '0%' }}
                            animate={{
                              width: `${(skill.proficiency / 10) * 100}%`,
                            }}
                            transition={{
                              duration: 1,
                              delay: index * 0.1,
                              ease: 'easeOut',
                            }}
                          />
                        </SkillBarTrack>
                      </SkillBar>
                    ))}
                  </SkillsContent>
                )}
              </AnimatePresence>
            </SkillCategory>
          );
        })}
      </SkillsGrid>
    </SkillsContainer>
  );
};

export default Skills;
