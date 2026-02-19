import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Navigation items configuration
const navigationItems = [
  { id: 'hero', label: 'Home', href: '#hero' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'soft-skills', label: 'Soft Skills', href: '#soft-skills' },
  { id: 'experiences', label: 'Experience', href: '#experiences' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

const HeaderContainer = styled.header`
  background-color: rgba(75, 0, 130, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 10px rgba(75, 0, 130, 0.4);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: var(--spacing-md) var(--spacing-xl);
  transition: all var(--duration-normal) var(--easing-ease-out);

  @media (max-width: 768px) {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  /* Light theme header */
  [data-theme='light'] & {
    background-color: rgba(221, 160, 221, 0.95);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 10px rgba(147, 112, 219, 0.2);
  }

  [data-theme='auto'] & {
    @media (prefers-color-scheme: light) {
      background-color: rgba(221, 160, 221, 0.95);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 10px rgba(147, 112, 219, 0.2);
    }
  }
`;

const ScrollProgressBar = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-color), var(--secondary-color));
  transform-origin: left;
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const Logo = styled(motion.div)`
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: color var(--duration-normal) var(--easing-ease-out);

  &:hover {
    color: var(--accent-color);
    filter: brightness(1.2);
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  /* Light theme logo */
  [data-theme='light'] & {
    color: #4B0082;
    
    &:hover {
      color: #8A2BE2;
    }
  }

  [data-theme='auto'] & {
    @media (prefers-color-scheme: light) {
      color: #4B0082;
      
      &:hover {
        color: #8A2BE2;
      }
    }
  }
`;

const DesktopNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);

  @media (max-width: 768px) {
    display: none;
  }
`;

const DesktopButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(motion.a)<{ $isActive: boolean }>`
  color: ${props => props.$isActive ? 'var(--accent-color)' : '#ffffff'};
  text-decoration: none;
  font-weight: ${props => props.$isActive ? '600' : '400'};
  font-size: 0.95rem;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 6px;
  position: relative;
  transition: all var(--duration-normal) var(--easing-ease-out);
  cursor: pointer;

  &:hover {
    color: var(--accent-color);
    background-color: rgba(138, 43, 226, 0.1);
  }

  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  /* Active indicator */
  ${props => props.$isActive && `
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: var(--accent-color);
      border-radius: 1px;
    }
  `}

  /* Light theme nav link */
  [data-theme='light'] & {
    color: ${props => props.$isActive ? '#8A2BE2' : '#4B0082'};
    
    &:hover {
      color: #8A2BE2;
      background-color: rgba(147, 112, 219, 0.1);
    }
  }

  [data-theme='auto'] & {
    @media (prefers-color-scheme: light) {
      color: ${props => props.$isActive ? '#8A2BE2' : '#4B0082'};
      
      &:hover {
        color: #8A2BE2;
        background-color: rgba(147, 112, 219, 0.1);
      }
    }
  }
`;

const MobileMenuContainer = styled.div`
  display: none;
  align-items: center;
  gap: var(--spacing-sm);

  @media (max-width: 768px) {
    display: flex;
  }
`;

const HamburgerButton = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  position: relative;

  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const HamburgerLine = styled(motion.span)`
  display: block;
  width: 20px;
  height: 2px;
  background-color: #ffffff;
  margin: 2px 0;
  border-radius: 1px;
  transform-origin: center;

  [data-theme='light'] & {
    background-color: #4B0082;
  }

  [data-theme='auto'] & {
    @media (prefers-color-scheme: light) {
      background-color: #4B0082;
    }
  }
`;

const MobileMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: rgba(75, 0, 130, 0.98);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(138, 43, 226, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  [data-theme='light'] & {
    background-color: rgba(221, 160, 221, 0.98);
    border-top: 1px solid rgba(147, 112, 219, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  [data-theme='auto'] & {
    @media (prefers-color-scheme: light) {
      background-color: rgba(221, 160, 221, 0.98);
      border-top: 1px solid rgba(147, 112, 219, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
  }
`;

const MobileNavLink = styled(motion.a)<{ $isActive: boolean }>`
  display: block;
  color: ${props => props.$isActive ? 'var(--accent-color)' : '#ffffff'};
  text-decoration: none;
  font-weight: ${props => props.$isActive ? '600' : '400'};
  padding: var(--spacing-md) var(--spacing-xl);
  border-bottom: 1px solid rgba(138, 43, 226, 0.2);
  transition: all var(--duration-normal) var(--easing-ease-out);
  cursor: pointer;

  &:hover {
    color: var(--accent-color);
    background-color: rgba(138, 43, 226, 0.1);
  }

  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: -2px;
  }

  &:last-child {
    border-bottom: none;
  }

  /* Light theme mobile nav link */
  [data-theme='light'] & {
    color: ${props => props.$isActive ? '#8A2BE2' : '#4B0082'};
    border-bottom: 1px solid rgba(147, 112, 219, 0.2);
    
    &:hover {
      color: #8A2BE2;
      background-color: rgba(147, 112, 219, 0.1);
    }
  }

  [data-theme='auto'] & {
    @media (prefers-color-scheme: light) {
      color: ${props => props.$isActive ? '#8A2BE2' : '#4B0082'};
      border-bottom: 1px solid rgba(147, 112, 219, 0.2);
      
      &:hover {
        color: #8A2BE2;
        background-color: rgba(147, 112, 219, 0.1);
      }
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

interface HeaderProps {
  name: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ name, children }) => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Intersection Observer for active section detection
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -50% 0px', // Less restrictive margins
      threshold: [0.1, 0.3, 0.5], // Multiple thresholds for better detection
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the entry with the highest intersection ratio
      let maxRatio = 0;
      let activeEntryId = '';

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          activeEntryId = entry.target.id;
        }
      });

      if (activeEntryId) {
        setActiveSection(activeEntryId);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    navigationItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Scroll progress tracking and section detection backup
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(progress);

      // Backup section detection based on scroll position
      const headerHeight = 80;
      const sections = navigationItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.id),
      })).filter(section => section.element);

      let currentSection = 'hero';
      
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          const elementTop = rect.top + scrollTop;
          
          if (scrollTop + headerHeight >= elementTop - 100) {
            currentSection = section.id;
          }
        }
      }
      
      // Only update if different from current active section
      setActiveSection(prev => {
        if (prev !== currentSection) {
          return currentSection;
        }
        return prev;
      });
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  // Smooth scroll to section with offset
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Approximate header height
      const elementPosition = element.offsetTop - headerHeight;
      
      // Immediately set active section for better UX
      setActiveSection(sectionId);
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }
    setIsMenuOpen(false);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, sectionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToSection(sectionId);
    }
  }, [scrollToSection]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Hamburger animation variants
  const hamburgerVariants = {
    closed: { rotate: 0 },
    open: { rotate: 45 },
  };

  const hamburgerLineVariants = {
    closed: { opacity: 1, y: 0 },
    open: { opacity: 0, y: 0 },
  };

  const hamburgerBottomVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: -90, y: -6 },
  };

  return (
    <HeaderContainer>
      <ScrollProgressBar
        style={{ scaleX: scrollProgress }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollProgress }}
        transition={{ duration: 0.1 }}
      />
      <Nav>
        <Logo
          onClick={scrollToTop}
          onKeyDown={(e) => handleKeyDown(e, 'about')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          tabIndex={0}
          role="button"
          aria-label="Scroll to top"
        >
          {name}
        </Logo>

        {/* Desktop Navigation and Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
          <DesktopNavigation>
            {navigationItems.map((item) => (
              <NavLink
                key={item.id}
                $isActive={activeSection === item.id}
                onClick={() => scrollToSection(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                tabIndex={0}
                role="button"
                aria-label={`Navigate to ${item.label} section`}
              >
                {item.label}
              </NavLink>
            ))}
          </DesktopNavigation>
          <DesktopButtonContainer>
            {children}
          </DesktopButtonContainer>
        </div>

        {/* Mobile Menu Container */}
        <MobileMenuContainer>
          <ButtonContainer>
            {children}
          </ButtonContainer>
          <HamburgerButton
            onClick={toggleMenu}
            whileTap={{ scale: 0.95 }}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <HamburgerLine
              variants={hamburgerVariants}
              animate={isMenuOpen ? 'open' : 'closed'}
            />
            <HamburgerLine
              variants={hamburgerLineVariants}
              animate={isMenuOpen ? 'open' : 'closed'}
            />
            <HamburgerLine
              variants={hamburgerBottomVariants}
              animate={isMenuOpen ? 'open' : 'closed'}
            />
          </HamburgerButton>
        </MobileMenuContainer>
      </Nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {navigationItems.map((item, index) => (
              <MobileNavLink
                key={item.id}
                $isActive={activeSection === item.id}
                onClick={() => scrollToSection(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                tabIndex={0}
                role="button"
                aria-label={`Navigate to ${item.label} section`}
              >
                {item.label}
              </MobileNavLink>
            ))}
          </MobileMenu>
        )}
      </AnimatePresence>
    </HeaderContainer>
  );
};

export default Header;
