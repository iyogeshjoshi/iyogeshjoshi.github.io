import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project, ProjectCategory, ProjectFilters, ProjectSortOptions } from '../types/project';
import { ProjectManager } from '../utils/projectManager';
import { hoverEffects, entranceAnimations, staggerContainer, cardHoverEffects } from '../utils/microInteractions';

// Styled Components
const GalleryContainer = styled(motion.section)`
  padding: var(--spacing-xl) 0;
  min-height: 100vh;
`;

const GalleryHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: var(--spacing-xl);
`;

const Title = styled(motion.h2)`
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--accent-color);
  margin-bottom: var(--spacing-md);
  font-weight: 700;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: var(--text-color);
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FilterSection = styled(motion.div)`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  backdrop-filter: blur(10px);
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const SearchInput = styled(motion.input)`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 48px;
  border: 2px solid var(--card-border);
  border-radius: 25px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  transition: all var(--duration-normal) var(--easing-ease-out);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
  }
  
  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color);
  opacity: 0.5;
  pointer-events: none;
`;

const FilterControls = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
`;

const CategoryButton = styled(motion.button)<{ $active: boolean; $color: string }>`
  padding: var(--spacing-xs) var(--spacing-md);
  border: 2px solid ${props => props.$active ? props.$color : 'var(--card-border)'};
  background: ${props => props.$active ? props.$color : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-color)'};
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-out);
  white-space: nowrap;
  
  &:hover {
    border-color: ${props => props.$color};
    background: ${props => props.$active ? props.$color : `${props.$color}20`};
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
`;

const ViewModeToggle = styled.div`
  display: flex;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  overflow: hidden;
`;

const ViewModeButton = styled(motion.button)<{ $active: boolean }>`
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  background: ${props => props.$active ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-color)'};
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-out);
  
  &:hover {
    background: ${props => props.$active ? 'var(--accent-color)' : 'var(--card-border)'};
  }
`;

const ResultsInfo = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  color: var(--text-color);
  opacity: 0.8;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }
`;

const ProjectGrid = styled(motion.div)<{ $viewMode: 'grid' | 'list' | 'masonry' }>`
  display: grid;
  gap: var(--spacing-lg);
  
  ${props => {
    switch (props.$viewMode) {
      case 'grid':
        return `
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          
          @media (max-width: 768px) {
            grid-template-columns: 1fr;
          }
        `;
      case 'list':
        return `
          grid-template-columns: 1fr;
        `;
      case 'masonry':
        return `
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          grid-auto-rows: masonry;
          
          @media (max-width: 768px) {
            grid-template-columns: 1fr;
          }
        `;
      default:
        return '';
    }
  }}
`;

const ProjectCard = styled(motion.div)<{ $viewMode: 'grid' | 'list' | 'masonry' }>`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-out);
  
  ${props => props.$viewMode === 'list' && `
    display: flex;
    align-items: center;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  `}
`;

const ProjectImage = styled(motion.div)<{ $backgroundImage: string; $viewMode: 'grid' | 'list' | 'masonry' }>`
  width: 100%;
  height: ${props => props.$viewMode === 'list' ? '200px' : '250px'};
  background-image: url(${props => props.$backgroundImage});
  background-size: cover;
  background-position: center;
  position: relative;
  
  ${props => props.$viewMode === 'list' && `
    width: 300px;
    flex-shrink: 0;
    
    @media (max-width: 768px) {
      width: 100%;
      height: 200px;
    }
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(186, 85, 211, 0.1));
    opacity: 0;
    transition: opacity var(--duration-normal) var(--easing-ease-out);
  }
  
  ${ProjectCard}:hover &::before {
    opacity: 1;
  }
`;

const ProjectContent = styled.div<{ $viewMode: 'grid' | 'list' | 'masonry' }>`
  padding: var(--spacing-lg);
  flex: 1;
  
  ${props => props.$viewMode === 'list' && `
    display: flex;
    flex-direction: column;
    justify-content: center;
  `}
`;

const ProjectTitle = styled(motion.h3)`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: var(--spacing-sm);
  line-height: 1.3;
`;

const ProjectDescription = styled(motion.p)`
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
`;

const ProjectCategory = styled(motion.span)<{ $color: string }>`
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ProjectDate = styled.span`
  color: var(--text-color);
  opacity: 0.6;
  font-size: 0.875rem;
`;

const TechnologyTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
`;

const TechnologyTag = styled(motion.span)<{ $color?: string }>`
  background: ${props => props.$color ? `${props.$color}15` : 'var(--card-border)'};
  color: ${props => props.$color || 'var(--text-color)'};
  padding: 4px var(--spacing-xs);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ProjectLink = styled(motion.a)`
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--accent-color);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--duration-normal) var(--easing-ease-out);
  
  &:hover {
    background: var(--secondary-color);
    transform: translateY(-1px);
  }
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  color: var(--text-color);
  opacity: 0.6;
`;

const LoadingState = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  color: var(--accent-color);
  font-size: 1.25rem;
`;

// Component Props
interface ProjectGalleryComponentProps {
  projects: Project[];
  categories: ProjectCategory[];
  onProjectSelect: (project: Project) => void;
}

// Main Component
const ProjectGallery: React.FC<ProjectGalleryComponentProps> = ({
  projects,
  categories,
  onProjectSelect,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'masonry'>('grid');
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [sortOptions, setSortOptions] = useState<ProjectSortOptions>({
    field: 'completionDate',
    direction: 'desc'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize project manager
  const projectManager = useMemo(() => 
    new ProjectManager(projects, categories), 
    [projects, categories]
  );

  // Get filtered and sorted projects
  const filteredProjects = useMemo(() => {
    const filtered = projectManager.getFilteredProjects(filters);
    return projectManager.sortProjects(filtered, sortOptions);
  }, [projectManager, filters, sortOptions]);

  // Handle search input
  const handleSearchChange = (query: string) => {
    setIsLoading(true);
    setFilters(prev => ({ ...prev, searchQuery: query }));
    
    // Simulate search delay for better UX
    setTimeout(() => setIsLoading(false), 300);
  };

  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === categoryId ? undefined : categoryId
    }));
  };

  // Handle project card click
  const handleProjectClick = (project: Project) => {
    onProjectSelect(project);
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  // Get placeholder image
  const getProjectImage = (project: Project) => {
    return project.images[0]?.url || '/images/placeholder-project.jpg';
  };

  return (
    <GalleryContainer
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
    >
      <GalleryHeader>
        <Title variants={entranceAnimations.fadeInUp}>
          Featured Projects
        </Title>
        <Subtitle variants={entranceAnimations.fadeInUp}>
          Explore my portfolio of innovative solutions and technical achievements
        </Subtitle>
      </GalleryHeader>

      <FilterSection variants={entranceAnimations.fadeInUp}>
        <FilterRow>
          <SearchContainer>
            <SearchIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search projects, technologies, or categories..."
              value={filters.searchQuery || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              {...hoverEffects.glow}
            />
          </SearchContainer>

          <FilterControls>
            <CategoryFilter>
              <CategoryButton
                $active={!filters.category}
                $color="#666"
                onClick={() => handleCategoryFilter('')}
                {...hoverEffects.bounce}
              >
                All
              </CategoryButton>
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  $active={filters.category === category.id}
                  $color={category.color}
                  onClick={() => handleCategoryFilter(category.id)}
                  {...hoverEffects.bounce}
                >
                  {category.name}
                </CategoryButton>
              ))}
            </CategoryFilter>

            <ViewModeToggle>
              <ViewModeButton
                $active={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
              </ViewModeButton>
              <ViewModeButton
                $active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="6" width="18" height="2"/>
                  <rect x="3" y="12" width="18" height="2"/>
                  <rect x="3" y="18" width="18" height="2"/>
                </svg>
              </ViewModeButton>
            </ViewModeToggle>
          </FilterControls>
        </FilterRow>
      </FilterSection>

      <ResultsInfo variants={entranceAnimations.fadeInUp}>
        <span>
          {isLoading ? 'Searching...' : `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''} found`}
        </span>
        <select
          value={`${sortOptions.field}-${sortOptions.direction}`}
          onChange={(e) => {
            const [field, direction] = e.target.value.split('-') as [typeof sortOptions.field, typeof sortOptions.direction];
            setSortOptions({ field, direction });
          }}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            color: 'var(--text-color)',
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: '8px'
          }}
        >
          <option value="completionDate-desc">Newest First</option>
          <option value="completionDate-asc">Oldest First</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
          <option value="category-asc">Category A-Z</option>
        </select>
      </ResultsInfo>

      {isLoading ? (
        <LoadingState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Loading projects...
        </LoadingState>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          variants={entranceAnimations.fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <h3>No projects found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </EmptyState>
      ) : (
        <ProjectGrid
          $viewMode={viewMode}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                $viewMode={viewMode}
                onClick={() => handleProjectClick(project)}
                variants={entranceAnimations.fadeInUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: index * 0.1 }}
                {...cardHoverEffects.subtle}
                layout
              >
                <ProjectImage
                  $backgroundImage={getProjectImage(project)}
                  $viewMode={viewMode}
                />
                
                <ProjectContent $viewMode={viewMode}>
                  <ProjectMeta>
                    <ProjectCategory $color={project.category.color}>
                      {project.category.name}
                    </ProjectCategory>
                    <ProjectDate>
                      {formatDate(project.completionDate)}
                    </ProjectDate>
                  </ProjectMeta>

                  <ProjectTitle {...hoverEffects.glow}>
                    {project.title}
                  </ProjectTitle>

                  <ProjectDescription>
                    {project.description}
                  </ProjectDescription>

                  <TechnologyTags>
                    {project.technologies.slice(0, 4).map((tech) => (
                      <TechnologyTag
                        key={tech.name}
                        $color={tech.color}
                        {...hoverEffects.bounce}
                      >
                        {tech.name}
                      </TechnologyTag>
                    ))}
                    {project.technologies.length > 4 && (
                      <TechnologyTag>
                        +{project.technologies.length - 4} more
                      </TechnologyTag>
                    )}
                  </TechnologyTags>

                  <ProjectLinks>
                    {project.liveUrl && (
                      <ProjectLink
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        {...hoverEffects.lift}
                      >
                        Live Demo
                      </ProjectLink>
                    )}
                    {project.githubUrl && (
                      <ProjectLink
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        {...hoverEffects.lift}
                      >
                        GitHub
                      </ProjectLink>
                    )}
                  </ProjectLinks>
                </ProjectContent>
              </ProjectCard>
            ))}
          </AnimatePresence>
        </ProjectGrid>
      )}
    </GalleryContainer>
  );
};

export default ProjectGallery;