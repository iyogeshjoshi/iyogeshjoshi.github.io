import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ExperienceContainer = styled(motion.div)`
  min-height: 100vh;
  padding-top: 100px;
`;

const Title = styled(motion.h2)`
  font-size: 2.5rem;
  color: #64ffda;
  margin-bottom: 3rem;
`;

const ExperienceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ExperienceCard = styled(motion.div)`
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

const CompanyName = styled.h3`
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
    transition: width 0.3s ease;
  }

  ${ExperienceCard}:hover &::after {
    width: 100px;
  }
`;

const PositionSection = styled.div`
  margin-bottom: 2rem;
  padding-left: 1rem;
  border-left: 2px solid rgba(100, 255, 218, 0.2);

  &:last-child {
    margin-bottom: 0;
  }
`;

const Position = styled.h4`
  color: #ccd6f6;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const Duration = styled.p`
  color: #8892b0;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const Description = styled.ul`
  color: #e6f1ff;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  list-style: none;
  padding: 0;
`;

const DescriptionItem = styled.li`
  margin-bottom: 0.8rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  &::before {
    content: '▹';
    color: #64ffda;
    flex-shrink: 0;
  }
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.5rem;
`;

const Tech = styled.span`
  background-color: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  cursor: default;

  &:hover {
    background-color: rgba(100, 255, 218, 0.2);
    transform: translateY(-2px);
    border-color: rgba(100, 255, 218, 0.4);
    box-shadow: 0 2px 4px rgba(100, 255, 218, 0.1);
  }
`;

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string[];
  technologies: string[];
}

interface ExperiencesProps {
  experiences: Experience[];
}

const Experiences: React.FC<ExperiencesProps> = ({ experiences }) => {
  // Group experiences by company
  const groupedExperiences = experiences.reduce((acc, curr) => {
    if (!acc[curr.company]) {
      acc[curr.company] = {
        positions: [],
        technologies: new Set<string>()
      };
    }
    acc[curr.company].positions.push({
      position: curr.position,
      duration: curr.duration,
      description: curr.description
    });
    curr.technologies.forEach(tech => acc[curr.company].technologies.add(tech));
    return acc;
  }, {} as Record<string, { positions: Array<{ position: string; duration: string; description: string[] }>, technologies: Set<string> }>);

  return (
    <ExperienceContainer
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
        Work Experience
      </Title>
      <ExperienceGrid>
        {Object.entries(groupedExperiences).map(([company, data], index) => (
          <ExperienceCard
            key={company}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <CompanyName>{company}</CompanyName>
            {data.positions.map((pos, posIndex) => (
              <PositionSection key={`${pos.position}-${posIndex}`}>
                <Position>{pos.position}</Position>
                <Duration>{pos.duration}</Duration>
                <Description>
                  {pos.description.map((item, i) => (
                    <DescriptionItem key={i}>{item}</DescriptionItem>
                  ))}
                </Description>
              </PositionSection>
            ))}
            <TechStack>
              {Array.from(data.technologies).map((tech) => (
                <Tech key={tech}>{tech}</Tech>
              ))}
            </TechStack>
          </ExperienceCard>
        ))}
      </ExperienceGrid>
    </ExperienceContainer>
  );
};

export default Experiences; 