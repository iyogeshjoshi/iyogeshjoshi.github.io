import React, { useEffect, useState, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioData, loadPortfolioData } from './utils/yamlLoader';
import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import SoftSkills from './components/SoftSkills';
import Experiences from './components/Experiences';
import Contact from './components/Contact';
import DownloadButton from './components/DownloadButton';
import ThemeToggle from './components/ThemeToggle';
import SEO from './components/SEO';
import { Theme, lightTheme, darkTheme } from './theme';

const AppContainer = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
  transition: all 0.3s ease;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Section = styled(motion.section)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    return savedTheme === 'light' ? lightTheme : darkTheme;
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    const theme = savedTheme === 'light' ? lightTheme : darkTheme;
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme.type);
  }, []);

  // Helper function to parse date string
  const parseDate = useCallback((dateStr: string) => {
    const [month, year] = dateStr.split(' ');
    const monthIndex = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ].indexOf(month.toUpperCase());
    return new Date(parseInt(year), monthIndex);
  }, []);

  // Helper function to sort experiences
  const sortExperiences = useCallback((experiences: PortfolioData['experiences']) => {
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
  }, [parseDate]);

  const handleDownload = () => {
    window.open('https://deviloper.dev/yogesh_resume.pdf', '_blank');
  };

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prevTheme: Theme) => {
      const newTheme = prevTheme.type === 'light' ? darkTheme : lightTheme;
      localStorage.setItem('theme', newTheme.type);
      document.documentElement.setAttribute('data-theme', newTheme.type);
      return newTheme;
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const portfolioData = await loadPortfolioData();
        if (portfolioData.experiences) {
          portfolioData.experiences = sortExperiences(portfolioData.experiences);
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
            <ThemeToggle theme={currentTheme.type} onToggle={toggleTheme} />
            <Header name={data.name} />
            <MainContent>
              <Section
                id="about"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20%" }}
              >
                <About bio={data.bio} tagline={data.tagline} name={data.name} />
              </Section>
              
              <Section
                id="skills"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20%" }}
              >
                <Skills skills={data.skills} />
              </Section>

              <Section
                id="soft-skills"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20%" }}
              >
                <SoftSkills softSkills={data.soft_skills} />
              </Section>

              <Section
                id="experiences"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20%" }}
              >
                <Experiences experiences={data.experiences} />
              </Section>

              <Section
                id="contact"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20%" }}
              >
                <Contact contact={data.contact} />
              </Section>
            </MainContent>
            <DownloadButton onDownload={handleDownload} />
          </motion.div>
        </AnimatePresence>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App; 