import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ProjectGallery from './ProjectGallery';
import ProjectDetailModal from './ProjectDetailModal';
import { projects, projectCategories } from '../data/projects';
import { Project } from '../types/project';
import { GitHubRepo } from '../utils/github';

const ProjectsContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);

  @media (max-width: 768px) {
    padding: 0 var(--spacing-md);
  }
`;

interface ProjectsProps {
  githubRepos?: GitHubRepo[];
  showFeaturedOnly?: boolean;
  maxProjects?: number;
}

const Projects: React.FC<ProjectsProps> = ({
  githubRepos = [],
  showFeaturedOnly = false,
  maxProjects,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allProjects = React.useMemo(() => {
    const githubMapped: Project[] = githubRepos.map((repo) => ({
      id: `github-${repo.name}`,
      title: repo.name,
      description: repo.description,
      longDescription: repo.description,
      technologies: repo.language
        ? [
            {
              name: repo.language,
              category: 'frontend' as const,
              color: repo.languageColor || '#666',
            },
          ]
        : [],
      category: projectCategories.find((c) => c.id === 'fullstack')!,
      images: [],
      liveUrl: repo.url,
      githubUrl: repo.url,
      featured: true,
      completionDate: new Date(repo.updatedAt),
      challenges: [],
      outcomes: [],
      metrics: {
        customMetrics: {
          Stars: repo.stars.toString(),
        },
      },
    }));

    const manualProjects = showFeaturedOnly
      ? projects.filter((project) => project.featured)
      : projects;

    const combined = [...githubMapped, ...manualProjects];

    if (maxProjects) {
      return combined.slice(0, maxProjects);
    }

    return combined;
  }, [githubRepos, showFeaturedOnly, maxProjects]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  const handleNavigateProject = (direction: 'prev' | 'next') => {
    if (!selectedProject) return;

    const currentIndex = allProjects.findIndex(
      (p) => p.id === selectedProject.id
    );
    let newIndex: number;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allProjects.length - 1;
    } else {
      newIndex = currentIndex < allProjects.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedProject(allProjects[newIndex]);
  };

  const canNavigatePrev = () => {
    if (!selectedProject) return false;
    const currentIndex = allProjects.findIndex(
      (p) => p.id === selectedProject.id
    );
    return allProjects.length > 1 && currentIndex !== -1;
  };

  const canNavigateNext = () => {
    if (!selectedProject) return false;
    const currentIndex = allProjects.findIndex(
      (p) => p.id === selectedProject.id
    );
    return allProjects.length > 1 && currentIndex !== -1;
  };

  return (
    <ProjectsContainer>
      <ProjectGallery
        projects={allProjects}
        categories={projectCategories}
        onProjectSelect={handleProjectSelect}
      />

      <ProjectDetailModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNavigate={handleNavigateProject}
        canNavigatePrev={canNavigatePrev()}
        canNavigateNext={canNavigateNext()}
      />
    </ProjectsContainer>
  );
};

export default Projects;
