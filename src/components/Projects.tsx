import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ProjectsContainer = styled(motion.div)`
  min-height: 100vh;
  padding-top: 100px;
`;

const Title = styled(motion.h2)`
  font-size: 2.5rem;
  color: #64ffda;
  margin-bottom: 3rem;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const ProjectCard = styled(motion.div)`
  background-color: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  padding: 2rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ProjectTitle = styled.h3`
  color: #64ffda;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ProjectDescription = styled.p`
  color: #e6f1ff;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const TechnologiesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Technology = styled.span`
  background-color: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
`;

const ProjectLink = styled.a`
  color: #64ffda;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: #9effeb;
  }
`;

interface Project {
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

interface ProjectsProps {
  projects: Project[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <ProjectsContainer
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
        Featured Projects
      </Title>
      <ProjectsGrid>
        {projects.map((project, index) => (
          <ProjectCard
            key={project.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <ProjectTitle>{project.name}</ProjectTitle>
            <ProjectDescription>{project.description}</ProjectDescription>
            <TechnologiesList>
              {project.technologies.map((tech) => (
                <Technology key={tech}>{tech}</Technology>
              ))}
            </TechnologiesList>
            <ProjectLink href={project.link} target="_blank" rel="noopener noreferrer">
              View Project →
            </ProjectLink>
          </ProjectCard>
        ))}
      </ProjectsGrid>
    </ProjectsContainer>
  );
};

export default Projects; 