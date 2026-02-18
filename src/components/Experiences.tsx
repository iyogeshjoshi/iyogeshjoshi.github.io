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

const ExperienceGrid = styled(motion.div)`
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

const Location = styled.span`
  color: var(--secondary-color);
  font-size: 1rem;
  margin-left: 1rem;
  &::before {
    content: '📍';
    margin-right: 0.3rem;
  }
`;

interface Experience {
  company: string;
  position: string;
  duration: string;
  location: string;
  description: string[];
  technologies: string[];
}

interface ExperiencesProps {
  experiences: Experience[];
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const Experiences: React.FC<ExperiencesProps> = ({ experiences }) => {
  return (
    <ExperienceContainer
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20%" }}
    >
      <Title variants={cardVariants}>Work Experience</Title>
      <ExperienceGrid>
        {experiences.map((exp, index) => (
          <ExperienceCard
            key={index}
            variants={cardVariants}
          >
            <Company>{exp.company}</Company>
            <Role>{exp.position}</Role>
            <Duration>{exp.duration}</Duration>
            <Location>{exp.location}</Location>
            <Description>
              {exp.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </Description>
            <Tech>
              {exp.technologies.map((tech, i) => (
                <TechTag key={i}>{tech}</TechTag>
              ))}
            </Tech>
          </ExperienceCard>
        ))}
      </ExperienceGrid>
    </ExperienceContainer>
  );
};

export default Experiences; 