import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Header from '../Header';
import Hero from '../Hero';
import { lightTheme } from '../../theme';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
    header: 'header',
    nav: 'nav',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    button: 'button',
    span: 'span',
    a: 'a'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      {component}
    </ThemeProvider>
  );
};

// Helper function to simulate different viewport sizes
const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

describe('Responsive Layout Tests', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock scrollTo
    window.scrollTo = jest.fn();

    // Mock getElementById
    document.getElementById = jest.fn().mockImplementation((id) => ({
      id,
      offsetTop: 100,
      scrollIntoView: jest.fn(),
      getBoundingClientRect: () => ({
        top: 100,
        left: 0,
        right: 0,
        bottom: 200,
        width: 100,
        height: 100,
      }),
    }));
  });

  describe('Header Responsive Behavior', () => {
    test('renders desktop navigation on large screens', () => {
      setViewport(1024, 768);
      
      renderWithTheme(<Header name="Test User" />);
      
      // Desktop navigation should be visible
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    test('renders mobile menu button on small screens', () => {
      setViewport(480, 800);
      
      renderWithTheme(<Header name="Test User" />);
      
      // Mobile hamburger menu should be present
      const hamburgerButton = screen.getByLabelText(/open menu/i);
      expect(hamburgerButton).toBeInTheDocument();
    });

    test('header adapts to different screen sizes', () => {
      // Test tablet size
      setViewport(768, 1024);
      
      const { rerender } = renderWithTheme(<Header name="Test User" />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
      
      // Test mobile size
      setViewport(375, 667);
      rerender(
        <ThemeProvider theme={lightTheme}>
          <Header name="Test User" />
        </ThemeProvider>
      );
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  describe('Hero Responsive Behavior', () => {
    const mockCTAButtons = [
      {
        label: 'View My Work',
        action: 'scroll' as const,
        target: 'experiences',
        variant: 'primary' as const
      }
    ];

    test('hero content adapts to mobile screens', () => {
      setViewport(375, 667);
      
      renderWithTheme(
        <Hero
          name="Test User"
          tagline="Test Developer"
          bio="Test bio description"
          ctaButtons={mockCTAButtons}
          onCTAClick={jest.fn()}
        />
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('hero content adapts to tablet screens', () => {
      setViewport(768, 1024);
      
      renderWithTheme(
        <Hero
          name="Test User"
          tagline="Test Developer"
          bio="Test bio description"
          ctaButtons={mockCTAButtons}
          onCTAClick={jest.fn()}
        />
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('hero content adapts to desktop screens', () => {
      setViewport(1920, 1080);
      
      renderWithTheme(
        <Hero
          name="Test User"
          tagline="Test Developer"
          bio="Test bio description"
          ctaButtons={mockCTAButtons}
          onCTAClick={jest.fn()}
        />
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  describe('Cross-Device Compatibility', () => {
    const commonViewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Large Desktop', width: 2560, height: 1440 },
    ];

    test.each(commonViewports)('components render correctly on $name ($width x $height)', ({ width, height }) => {
      setViewport(width, height);
      
      renderWithTheme(<Header name="Test User" />);
      
      // Basic rendering test
      expect(screen.getByText('Test User')).toBeInTheDocument();
      
      // Navigation should always be accessible in some form
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
    });
  });

  describe('Accessibility on Different Screen Sizes', () => {
    test('maintains keyboard navigation on mobile', () => {
      setViewport(375, 667);
      
      renderWithTheme(<Header name="Test User" />);
      
      const hamburgerButton = screen.getByLabelText(/open menu/i);
      expect(hamburgerButton).toHaveAttribute('aria-expanded');
      expect(hamburgerButton).toHaveAttribute('aria-label');
    });

    test('maintains focus indicators across screen sizes', () => {
      const viewports = [375, 768, 1024, 1920];
      
      viewports.forEach(width => {
        setViewport(width, 800);
        
        const { rerender } = renderWithTheme(<Header name="Test User" />);
        
        // Logo should always be focusable
        const logo = screen.getByLabelText('Scroll to top');
        expect(logo).toHaveAttribute('tabIndex', '0');
        
        rerender(
          <ThemeProvider theme={lightTheme}>
            <Header name="Test User" />
          </ThemeProvider>
        );
      });
    });
  });
});