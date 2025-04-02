import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, useScroll } from 'framer-motion';
import { PortfolioData, loadPortfolioData } from './utils/yamlLoader';
import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import SoftSkills from './components/SoftSkills';
import Experiences from './components/Experiences';
import Contact from './components/Contact';
import DownloadButton from './components/DownloadButton';
import ThemeToggle from './components/ThemeToggle';

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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  color: var(--accent-color);
  background-color: var(--bg-color);
`;

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
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
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
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
    return <LoadingContainer>Loading...</LoadingContainer>;
  }

  return (
    <AppContainer>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <Header name={data.name} />
      <MainContent>
        <Section
          id="about"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8 }}
        >
          <About bio={data.bio} tagline={data.tagline} />
        </Section>
        <Section
          id="skills"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8 }}
        >
          <Skills skills={data.skills} />
        </Section>
        <Section
          id="soft-skills"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8 }}
        >
          <SoftSkills softSkills={data.soft_skills} />
        </Section>
        <Section
          id="experiences"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8 }}
        >
          <Experiences experiences={data.experiences} />
        </Section>
        <Section
          id="contact"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8 }}
        >
          <Contact contact={data.contact} />
        </Section>
      </MainContent>
      <DownloadButton onDownload={handleDownload} />
    </AppContainer>
  );
};

export default App; 