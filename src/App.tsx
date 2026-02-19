import React, { useEffect, useState, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioData, loadPortfolioData } from './utils/yamlLoader';
import { fetchGitHubRepos, GitHubRepo } from './utils/github';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import SoftSkills from './components/SoftSkills';
import Experiences from './components/Experiences';
import Contact from './components/Contact';
import DownloadButton from './components/DownloadButton';
import ThemeToggle from './components/ThemeToggle';
import SEO from './components/SEO';
import {
  Theme,
  lightTheme,
  darkTheme,
  autoTheme,
  generateCSSCustomProperties,
} from './theme';

type ThemeType = 'light' | 'dark' | 'auto';

const AppContainer = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
  transition: all var(--duration-normal) var(--easing-ease-out);
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);

  @media (max-width: 768px) {
    padding: 0 var(--spacing-md);
  }
`;

const Section = styled(motion.section)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--spacing-xl) 0;

  @media (max-width: 768px) {
    padding: var(--spacing-lg) 0;
  }
`;

const LoadingContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  color: var(--accent-color);
  background-color: var(--bg-color);
`;

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

// Custom hook for system theme detection
const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return systemTheme;
};

// Custom hook for theme management
const useTheme = () => {
  const systemTheme = useSystemTheme();

  const [themeType, setThemeType] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    return savedTheme || 'auto';
  });

  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    if (savedTheme === 'light') return lightTheme;
    if (savedTheme === 'dark') return darkTheme;
    return autoTheme;
  });

  // Update theme when system preference or theme type changes
  useEffect(() => {
    let theme: Theme;
    let effectiveTheme: 'light' | 'dark';

    switch (themeType) {
      case 'light':
        theme = lightTheme;
        effectiveTheme = 'light';
        break;
      case 'dark':
        theme = darkTheme;
        effectiveTheme = 'dark';
        break;
      case 'auto':
      default:
        theme = systemTheme === 'light' ? lightTheme : darkTheme;
        effectiveTheme = systemTheme;
        break;
    }

    setCurrentTheme(theme);

    // Update CSS custom properties
    const cssProperties = generateCSSCustomProperties(
      theme,
      effectiveTheme === 'dark'
    );
    const root = document.documentElement;

    Object.entries(cssProperties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Set data attribute for theme-specific styles
    document.documentElement.setAttribute('data-theme', themeType);

    // Store theme preference
    localStorage.setItem('theme', themeType);
  }, [themeType, systemTheme]);

  const toggleTheme = useCallback(() => {
    setThemeType((prevType) => {
      switch (prevType) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'auto';
        case 'auto':
        default:
          return 'light';
      }
    });
  }, []);

  return {
    themeType,
    currentTheme,
    toggleTheme,
    effectiveTheme: themeType === 'auto' ? systemTheme : themeType,
  };
};

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const { themeType, currentTheme, toggleTheme } = useTheme();

  // Helper function to parse date string
  const parseDate = useCallback((dateStr: string) => {
    const [month, year] = dateStr.split(' ');
    const monthIndex = [
      'JANUARY',
      'FEBRUARY',
      'MARCH',
      'APRIL',
      'MAY',
      'JUNE',
      'JULY',
      'AUGUST',
      'SEPTEMBER',
      'OCTOBER',
      'NOVEMBER',
      'DECEMBER',
    ].indexOf(month.toUpperCase());
    return new Date(parseInt(year), monthIndex);
  }, []);

  // Helper function to sort experiences
  const sortExperiences = useCallback(
    (experiences: PortfolioData['experiences']) => {
      if (!experiences) return [];
      return [...experiences].sort((a, b) => {
        const aEndDate = a.duration.toUpperCase().includes('PRESENT')
          ? new Date()
          : parseDate(a.duration.split(' - ')[1]);
        const bEndDate = b.duration.toUpperCase().includes('PRESENT')
          ? new Date()
          : parseDate(b.duration.split(' - ')[1]);
        return bEndDate.getTime() - aEndDate.getTime();
      });
    },
    [parseDate]
  );

  const handleDownload = () => {
    window.open('https://deviloper.dev/yogesh_resume.pdf', '_blank');
  };

  const handleCTAClick = (action: string, target?: string) => {
    switch (action) {
      case 'scroll':
        if (target) {
          const element = document.getElementById(target);
          if (element) {
            const headerHeight = 80;
            const elementPosition = element.offsetTop - headerHeight;
            window.scrollTo({
              top: elementPosition,
              behavior: 'smooth',
            });
          }
        }
        break;
      case 'download':
        handleDownload();
        break;
      case 'contact':
        const contactElement = document.getElementById('contact');
        if (contactElement) {
          const headerHeight = 80;
          const elementPosition = contactElement.offsetTop - headerHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth',
          });
        }
        break;
      case 'external':
        if (target) {
          window.open(target, '_blank');
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const portfolioData = await loadPortfolioData();
        if (portfolioData.experiences) {
          portfolioData.experiences = sortExperiences(
            portfolioData.experiences
          );
        }
        setData(portfolioData);
      } catch (error) {
        console.error('Failed to load portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sortExperiences]);

  useEffect(() => {
    const loadGitHubRepos = async () => {
      try {
        const repos = await fetchGitHubRepos();
        setGithubRepos(repos);
      } catch (err) {
        console.error('GitHub repos error:', err);
      }
    };

    loadGitHubRepos();
  }, []);

  if (loading || !data) {
    return (
      <LoadingContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        Loading...
      </LoadingContainer>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <AppContainer>
        <SEO />
        <AnimatePresence mode="wait">
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Header name={data.name}>
              <DownloadButton onDownload={handleDownload} />
              <ThemeToggle theme={themeType} onToggle={toggleTheme} />
            </Header>

            {/* Hero Section */}
            <Hero
              name={data.name}
              tagline={data.tagline}
              bio={data.bio}
              ctaButtons={[
                {
                  label: 'View My Work',
                  action: 'scroll',
                  target: 'experiences',
                  variant: 'primary',
                },
                {
                  label: 'Contact Me',
                  action: 'contact',
                  variant: 'secondary',
                },
                {
                  label: 'Download Resume',
                  action: 'download',
                  variant: 'outline',
                },
              ]}
              backgroundAnimation="geometric"
              onCTAClick={handleCTAClick}
            />

            <MainContent>
              <Section
                id="about"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-20%' }}
              >
                <About bio={data.bio} tagline={data.tagline} name={data.name} />
              </Section>

              <Section
                id="projects"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-20%' }}
              >
                <Projects githubRepos={githubRepos} />
              </Section>

              <Section
                id="skills"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-20%' }}
              >
                <Skills skills={data.skills} />
              </Section>

              <Section
                id="soft-skills"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-20%' }}
              >
                <SoftSkills softSkills={data.soft_skills} />
              </Section>

              <Section
                id="experiences"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-20%' }}
              >
                <Experiences experiences={data.experiences} />
              </Section>

              <Section
                id="contact"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-20%' }}
              >
                <Contact contact={data.contact} />
              </Section>
            </MainContent>
          </motion.div>
        </AnimatePresence>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
