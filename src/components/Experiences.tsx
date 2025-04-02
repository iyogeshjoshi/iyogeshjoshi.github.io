import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ExperienceContainer = styled(motion.div)`
  min-height: 100vh;
  padding-top: 100px;
`;

const Title = styled(motion.h2)`
  color: var(--accent-color);
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const ExperienceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ExperienceCard = styled(motion.div)`
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px var(--shadow-color);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px var(--shadow-color);
    border-color: var(--accent-color);
  }
`;

const Company = styled.h3`
  color: var(--text-color);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const Role = styled.h4`
  color: var(--secondary-color);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const Duration = styled.p`
  color: var(--accent-color);
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const Description = styled.ul`
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.6;
  margin-left: 1.2rem;
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const Tech = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const TechTag = styled.span`
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
            <Company>{company}</Company>
            {data.positions.map((pos, posIndex) => (
              <div key={`${pos.position}-${posIndex}`}>
                <Role>{pos.position}</Role>
                <Duration>{pos.duration}</Duration>
                <Description>
                  {pos.description.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </Description>
              </div>
            ))}
            <Tech>
              {Array.from(data.technologies).map((tech) => (
                <TechTag key={tech}>{tech}</TechTag>
              ))}
            </Tech>
          </ExperienceCard>
        ))}
      </ExperienceGrid>
    </ExperienceContainer>
  );
};

export default Experiences; 