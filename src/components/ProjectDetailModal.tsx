import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types/project';
import { hoverEffects, entranceAnimations, buttonFeedback } from '../utils/microInteractions';

// Styled Components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  overflow-y: auto;
`;

const ModalContainer = styled(motion.div)`
  background: var(--bg-color);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    margin: var(--spacing-md);
    max-height: 95vh;
    border-radius: 16px;
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 40px;
  height: 40px;
  border: none;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 50%;
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all var(--duration-normal) var(--easing-ease-out);
  
  &:hover {
    background: var(--accent-color);
    color: white;
    transform: scale(1.1);
  }
  
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
  
  @media (max-width: 768px) {
    top: var(--spacing-md);
    right: var(--spacing-md);
    width: 36px;
    height: 36px;
  }
`;

const NavigationButton = styled(motion.button)<{ $direction: 'prev' | 'next' }>`
  position: absolute;
  top: 50%;
  ${props => props.$direction === 'prev' ? 'left: var(--spacing-lg)' : 'right: var(--spacing-lg)'};
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border: none;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 50%;
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all var(--duration-normal) var(--easing-ease-out);
  
  &:hover {
    background: var(--accent-color);
    color: white;
    transform: translateY(-50%) scale(1.1);
  }
  
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: var(--card-bg);
      color: var(--text-color);
      transform: translateY(-50%);
    }
  }
  
  @media (max-width: 768px) {
    ${props => props.$direction === 'prev' ? 'left: var(--spacing-md)' : 'right: var(--spacing-md)'};
    width: 40px;
    height: 40px;
  }
`;

const ModalContent = styled.div`
  padding: var(--spacing-xl);
  
  @media (max-width: 768px) {
    padding: var(--spacing-lg);
  }
`;

const ImageGallerySection = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const MainImage = styled(motion.div)<{ $backgroundImage: string }>`
  width: 100%;
  height: 400px;
  background-image: url(${props => props.$backgroundImage});
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  position: relative;
  cursor: zoom-in;
  overflow: hidden;
  
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
  
  &:hover::before {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    height: 250px;
  }
`;

const ImageThumbnails = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--card-border);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--accent-color);
    border-radius: 2px;
  }
`;

const Thumbnail = styled(motion.div)<{ $backgroundImage: string; $active: boolean }>`
  width: 80px;
  height: 60px;
  background-image: url(${props => props.$backgroundImage});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px solid ${props => props.$active ? 'var(--accent-color)' : 'var(--card-border)'};
  transition: all var(--duration-normal) var(--easing-ease-out);
  
  &:hover {
    border-color: var(--accent-color);
    transform: scale(1.05);
  }
`;

const ProjectHeader = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const ProjectTitle = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--accent-color);
  margin-bottom: var(--spacing-md);
  font-weight: 700;
  line-height: 1.2;
`;

const ProjectMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const CategoryBadge = styled(motion.span)<{ $color: string }>`
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CompletionDate = styled.span`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.875rem;
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
`;

const ProjectLink = styled(motion.a)`
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--accent-color);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all var(--duration-normal) var(--easing-ease-out);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  &:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProjectDescription = styled(motion.p)`
  font-size: 1.125rem;
  color: var(--text-color);
  line-height: 1.7;
  margin-bottom: var(--spacing-xl);
`;

const ContentSection = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const SectionTitle = styled(motion.h3)`
  font-size: 1.5rem;
  color: var(--accent-color);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
`;

const TechnologyStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
`;

const TechnologyTag = styled(motion.span)<{ $color?: string }>`
  background: ${props => props.$color ? `${props.$color}15` : 'var(--card-bg)'};
  color: ${props => props.$color || 'var(--text-color)'};
  border: 1px solid ${props => props.$color ? `${props.$color}30` : 'var(--card-border)'};
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--duration-normal) var(--easing-ease-out);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ChallengesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ChallengeItem = styled(motion.li)`
  padding: var(--spacing-md);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  margin-bottom: var(--spacing-sm);
  position: relative;
  padding-left: var(--spacing-xl);
  
  &::before {
    content: '⚡';
    position: absolute;
    left: var(--spacing-md);
    top: var(--spacing-md);
    font-size: 1.2rem;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const OutcomesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const OutcomeItem = styled(motion.li)`
  padding: var(--spacing-md);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  margin-bottom: var(--spacing-sm);
  position: relative;
  padding-left: var(--spacing-xl);
  
  &::before {
    content: '✅';
    position: absolute;
    left: var(--spacing-md);
    top: var(--spacing-md);
    font-size: 1.2rem;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
`;

const MetricCard = styled(motion.div)`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: var(--spacing-lg);
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: var(--spacing-xs);
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Component Props
interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
}

// Main Component
const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  onNavigate,
  canNavigatePrev,
  canNavigateNext,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Reset selected image when project changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [project]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (canNavigatePrev) {
            onNavigate('prev');
          }
          break;
        case 'ArrowRight':
          if (canNavigateNext) {
            onNavigate('next');
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedImageIndex(prev => 
            prev > 0 ? prev - 1 : (project?.images.length || 1) - 1
          );
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedImageIndex(prev => 
            prev < (project?.images.length || 1) - 1 ? prev + 1 : 0
          );
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate, canNavigatePrev, canNavigateNext, project]);

  // Handle overlay click
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  // Get current image
  const getCurrentImage = () => {
    if (!project || !project.images.length) {
      return '/images/placeholder-project.jpg';
    }
    return project.images[selectedImageIndex]?.url || project.images[0].url;
  };

  // Get metrics array
  const getMetricsArray = () => {
    if (!project?.metrics) return [];
    
    const metrics = [];
    if (project.metrics.performanceImprovement) {
      metrics.push({ label: 'Performance', value: project.metrics.performanceImprovement });
    }
    if (project.metrics.userEngagement) {
      metrics.push({ label: 'Engagement', value: project.metrics.userEngagement });
    }
    if (project.metrics.codeReduction) {
      metrics.push({ label: 'Code Efficiency', value: project.metrics.codeReduction });
    }
    if (project.metrics.customMetrics) {
      Object.entries(project.metrics.customMetrics).forEach(([key, value]) => {
        metrics.push({ label: key, value });
      });
    }
    
    return metrics;
  };

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleOverlayClick}
        >
          <ModalContainer
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <CloseButton
              onClick={onClose}
              {...hoverEffects.bounce}
              {...buttonFeedback}
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </CloseButton>

            <NavigationButton
              $direction="prev"
              onClick={() => onNavigate('prev')}
              disabled={!canNavigatePrev}
              {...hoverEffects.bounce}
              {...buttonFeedback}
              aria-label="Previous project"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
            </NavigationButton>

            <NavigationButton
              $direction="next"
              onClick={() => onNavigate('next')}
              disabled={!canNavigateNext}
              {...hoverEffects.bounce}
              {...buttonFeedback}
              aria-label="Next project"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </NavigationButton>

            <ModalContent>
              {/* Image Gallery Section */}
              <ImageGallerySection>
                <MainImage
                  $backgroundImage={getCurrentImage()}
                  {...hoverEffects.glow}
                  onClick={() => {
                    // TODO: Implement full-screen image viewer
                    console.log('Open full-screen image viewer');
                  }}
                />
                
                {project.images.length > 1 && (
                  <ImageThumbnails>
                    {project.images.map((image, index) => (
                      <Thumbnail
                        key={index}
                        $backgroundImage={image.url}
                        $active={index === selectedImageIndex}
                        onClick={() => setSelectedImageIndex(index)}
                        {...hoverEffects.bounce}
                        whileTap={{ scale: 0.95 }}
                      />
                    ))}
                  </ImageThumbnails>
                )}
              </ImageGallerySection>

              {/* Project Header */}
              <ProjectHeader>
                <ProjectTitle variants={entranceAnimations.fadeInUp}>
                  {project.title}
                </ProjectTitle>

                <ProjectMeta>
                  <CategoryBadge $color={project.category.color}>
                    {project.category.name}
                  </CategoryBadge>
                  <CompletionDate>
                    Completed {formatDate(project.completionDate)}
                  </CompletionDate>
                </ProjectMeta>

                <ProjectLinks>
                  {project.liveUrl && (
                    <ProjectLink
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...hoverEffects.lift}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                        <polyline points="15,3 21,3 21,9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Live Demo
                    </ProjectLink>
                  )}
                  {project.githubUrl && (
                    <ProjectLink
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...hoverEffects.lift}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </ProjectLink>
                  )}
                </ProjectLinks>
              </ProjectHeader>

              {/* Project Description */}
              <ProjectDescription variants={entranceAnimations.fadeInUp}>
                {project.longDescription}
              </ProjectDescription>

              {/* Technology Stack */}
              <ContentSection>
                <SectionTitle variants={entranceAnimations.fadeInUp}>
                  Technology Stack
                </SectionTitle>
                <TechnologyStack>
                  {project.technologies.map((tech) => (
                    <TechnologyTag
                      key={tech.name}
                      $color={tech.color}
                      {...hoverEffects.bounce}
                    >
                      {tech.name}
                    </TechnologyTag>
                  ))}
                </TechnologyStack>
              </ContentSection>

              {/* Challenges */}
              {project.challenges.length > 0 && (
                <ContentSection>
                  <SectionTitle variants={entranceAnimations.fadeInUp}>
                    Challenges & Solutions
                  </SectionTitle>
                  <ChallengesList>
                    {project.challenges.map((challenge, index) => (
                      <ChallengeItem
                        key={index}
                        variants={entranceAnimations.fadeInUp}
                        custom={index}
                      >
                        {challenge}
                      </ChallengeItem>
                    ))}
                  </ChallengesList>
                </ContentSection>
              )}

              {/* Outcomes */}
              {project.outcomes.length > 0 && (
                <ContentSection>
                  <SectionTitle variants={entranceAnimations.fadeInUp}>
                    Results & Impact
                  </SectionTitle>
                  <OutcomesList>
                    {project.outcomes.map((outcome, index) => (
                      <OutcomeItem
                        key={index}
                        variants={entranceAnimations.fadeInUp}
                        custom={index}
                      >
                        {outcome}
                      </OutcomeItem>
                    ))}
                  </OutcomesList>
                </ContentSection>
              )}

              {/* Metrics */}
              {project.metrics && getMetricsArray().length > 0 && (
                <ContentSection>
                  <SectionTitle variants={entranceAnimations.fadeInUp}>
                    Key Metrics
                  </SectionTitle>
                  <MetricsGrid>
                    {getMetricsArray().map((metric, index) => (
                      <MetricCard
                        key={metric.label}
                        variants={entranceAnimations.fadeInUp}
                        custom={index}
                        {...hoverEffects.lift}
                      >
                        <MetricValue>{metric.value}</MetricValue>
                        <MetricLabel>{metric.label}</MetricLabel>
                      </MetricCard>
                    ))}
                  </MetricsGrid>
                </ContentSection>
              )}
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailModal;