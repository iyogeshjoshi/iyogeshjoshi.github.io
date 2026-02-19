import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { hoverEffects, entranceAnimations, createStaggeredAnimation } from '../utils/microInteractions';

const ExperienceContainer = styled(motion.div)`
  padding: 2rem 0;
`;

const Title = styled(motion.h2)`
  color: var(--accent-color);
  font-size: 2rem;
  margin-bottom: 3rem;
  text-align: center;
`;

const TimelineContainer = styled(motion.div)`
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
`;

const TimelineLine = styled(motion.div)`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--accent-color), var(--color-primary-500, #a855f7));
  transform: translateX(-50%);
  border-radius: 2px;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }

  @media (max-width: 768px) {
    left: 30px;
  }
`;

const TimelineItem = styled(motion.div)<{ index: number }>`
  position: relative;
  margin-bottom: 4rem;
  display: flex;
  align-items: center;
  
  ${props => props.index % 2 === 0 ? `
    flex-direction: row;
    text-align: right;
    
    @media (max-width: 768px) {
      flex-direction: row;
      text-align: left;
    }
  ` : `
    flex-direction: row-reverse;
    text-align: left;
    
    @media (max-width: 768px) {
      flex-direction: row;
      text-align: left;
    }
  `}

  @media (max-width: 768px) {
    margin-left: 60px;
  }
`;

const TimelineContent = styled(motion.div)<{ index: number; expanded: boolean }>`
  flex: 1;
  max-width: 45%;
  
  ${props => props.index % 2 === 0 ? `
    margin-right: 2rem;
    
    @media (max-width: 768px) {
      margin-right: 0;
      margin-left: 1rem;
    }
  ` : `
    margin-left: 2rem;
    
    @media (max-width: 768px) {
      margin-left: 1rem;
    }
  `}

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const ExperienceCard = styled(motion.div)<{ expanded: boolean }>`
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px var(--shadow-color);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px var(--shadow-color);
    border-color: var(--accent-color);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--accent-color), var(--color-primary-500, #a855f7));
    opacity: ${props => props.expanded ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`;

const TimelineMarker = styled(motion.div)`
  position: absolute;
  left: 49.2%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: var(--accent-color);
  border: 4px solid var(--bg-color);
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 0 0 4px var(--accent-color);
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  @media (max-width: 768px) {
    left: 30px;
  }
`;

const CompanyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CompanyLogo = styled(motion.div)`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--accent-color), var(--color-primary-500, #a855f7));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
`;

const CompanyInfo = styled.div`
  flex: 1;
`;

const Company = styled.h3`
  color: var(--text-color);
  font-size: 1.4rem;
  margin: 0;
  font-weight: 600;
`;

const Role = styled.h4`
  color: var(--accent-color);
  font-size: 1.1rem;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
`;

const Duration = styled.p`
  color: var(--color-neutral-400, #a1a1aa);
  font-size: 0.9rem;
  margin: 0.5rem 0;
  font-weight: 500;
`;

const Location = styled.span`
  color: var(--color-neutral-500, #71717a);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &::before {
    content: '📍';
  }
`;

const ExpandedContent = styled(motion.div)`
  margin-top: 1.5rem;
  overflow: hidden;
`;

const Description = styled.ul`
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 1.2rem;
  padding: 0;

  li {
    margin-bottom: 0.8rem;
    position: relative;
    
    &::marker {
      color: var(--accent-color);
    }
  }
`;

const AchievementItem = styled(motion.li)`
  background: rgba(138, 43, 226, 0.05);
  border-left: 3px solid var(--accent-color);
  padding: 0.8rem 1rem;
  margin: 0.5rem 0;
  border-radius: 0 8px 8px 0;
  list-style: none;
  position: relative;

  &::before {
    content: '🏆';
    margin-right: 0.5rem;
  }
`;

const MetricsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
`;

const Metric = styled.div`
  background: linear-gradient(135deg, var(--accent-color), var(--color-primary-500, #a855f7));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  min-width: 80px;
`;

const TechStack = styled.div`
  margin-top: 1.5rem;
`;

const TechTitle = styled.h5`
  color: var(--text-color);
  font-size: 1rem;
  margin-bottom: 0.8rem;
  font-weight: 600;
`;

const TechGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TechTag = styled(motion.span)`
  background-color: rgba(138, 43, 226, 0.3);
  color: #ffffff;
  border: 1px solid rgba(138, 43, 226, 0.5);
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: var(--accent-color);
    color: #ffffff;
    transform: translateY(-2px);
  }

  [data-theme='light'] & {
    background-color: rgba(147, 112, 219, 0.2);
    color: #4B0082;
    border: 1px solid rgba(147, 112, 219, 0.4);
    
    &:hover {
      background-color: var(--accent-color);
      color: #ffffff;
    }
  }
`;

const ExpandIcon = styled(motion.span)<{ expanded: boolean }>`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 1.2rem;
  color: var(--accent-color);
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.3s ease;
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

const Experiences: React.FC<ExperiencesProps> = ({ experiences }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Generate company logo initials
  const getCompanyInitials = (company: string) => {
    return company
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate mock achievements and metrics for demonstration
  const generateAchievements = (description: string[]) => {
    const achievements = description.filter(desc => 
      desc.toLowerCase().includes('improved') || 
      desc.toLowerCase().includes('increased') || 
      desc.toLowerCase().includes('reduced') ||
      desc.toLowerCase().includes('led') ||
      desc.toLowerCase().includes('implemented')
    );
    return achievements.length > 0 ? achievements : [description[0]];
  };

  const generateMetrics = (index: number) => {
    const metrics = [
      ['Performance', '+25%'],
      ['Efficiency', '+40%'],
      ['User Satisfaction', '95%'],
      ['Code Quality', 'A+'],
      ['Team Size', '5-8'],
      ['Projects', '12+']
    ];
    
    // Return 2-3 metrics per experience
    const startIndex = (index * 2) % metrics.length;
    return metrics.slice(startIndex, startIndex + 3);
  };

  const containerVariants = createStaggeredAnimation(0.2, 0.3);

  const timelineItemVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      scale: 0.9
    },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.2,
        ease: 'easeOut',
      },
    }),
  };

  const markerVariants = {
    hidden: { 
      scale: 0,
      opacity: 0
    },
    visible: (index: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: index * 0.2 + 0.3,
        ease: 'backOut',
      },
    }),
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: (index: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.2 + 0.1,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <ExperienceContainer
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20%' }}
    >
      <Title variants={entranceAnimations.fadeInUp}>
        Professional Experience
      </Title>
      
      <TimelineContainer>
        <TimelineLine
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ transformOrigin: 'top' }}
        />
        
        {experiences.map((exp, index) => {
          const isExpanded = expandedItems.has(index);
          const achievements = generateAchievements(exp.description);
          const metrics = generateMetrics(index);
          
          return (
            <TimelineItem
              key={index}
              index={index}
              variants={timelineItemVariants}
              custom={index}
            >
              <TimelineMarker
                variants={markerVariants}
                custom={index}
                {...hoverEffects.pulse}
                whileHover={{ 
                  scale: 1.3,
                  boxShadow: '0 0 0 8px var(--accent-color)',
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.9 }}
              />
              
              <TimelineContent index={index} expanded={isExpanded}>
                <ExperienceCard
                  expanded={isExpanded}
                  onClick={() => toggleExpanded(index)}
                  variants={cardVariants}
                  custom={index}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ExpandIcon 
                    expanded={isExpanded}
                    whileHover={{ scale: 1.2 }}
                  >
                    ⌄
                  </ExpandIcon>
                  
                  <CompanyHeader>
                    <CompanyLogo
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {getCompanyInitials(exp.company)}
                    </CompanyLogo>
                    <CompanyInfo>
                      <Company>{exp.company}</Company>
                      <Role>{exp.position}</Role>
                    </CompanyInfo>
                  </CompanyHeader>
                  
                  <Duration>{exp.duration}</Duration>
                  <Location>{exp.location}</Location>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <ExpandedContent
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <Description>
                          {exp.description.map((desc, i) => (
                            <li key={i}>{desc}</li>
                          ))}
                        </Description>
                        
                        {achievements.length > 0 && (
                          <div>
                            <TechTitle>Key Achievements</TechTitle>
                            {achievements.map((achievement, i) => (
                              <AchievementItem
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                {achievement}
                              </AchievementItem>
                            ))}
                          </div>
                        )}
                        
                        <MetricsContainer>
                          {metrics.map(([label, value], i) => (
                            <Metric key={i}>
                              <div>{label}</div>
                              <div>{value}</div>
                            </Metric>
                          ))}
                        </MetricsContainer>
                        
                        <TechStack>
                          <TechTitle>Technologies Used</TechTitle>
                          <TechGrid>
                            {exp.technologies.map((tech, i) => (
                              <TechTag
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                {...hoverEffects.bounce}
                              >
                                {tech}
                              </TechTag>
                            ))}
                          </TechGrid>
                        </TechStack>
                      </ExpandedContent>
                    )}
                  </AnimatePresence>
                </ExperienceCard>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </TimelineContainer>
    </ExperienceContainer>
  );
};

export default Experiences;
