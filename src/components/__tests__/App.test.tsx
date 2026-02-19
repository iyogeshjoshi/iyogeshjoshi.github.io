import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock the yamlLoader to avoid loading actual YAML data
jest.mock('../../utils/yamlLoader', () => ({
  loadPortfolioData: jest.fn(() => Promise.resolve({
    name: 'Test User',
    tagline: 'Test Developer',
    bio: 'Test bio description',
    skills: [
      { name: 'JavaScript', proficiency: 90 },
      { name: 'React', proficiency: 85 }
    ],
    soft_skills: [
      { name: 'Communication', proficiency: 90 }
    ],
    experiences: [
      {
        company: 'Test Company',
        position: 'Developer',
        duration: 'Jan 2020 - Present',
        description: ['Test description'],
        achievements: ['Test achievement'],
        technologies: ['React', 'JavaScript']
      }
    ],
    contact: {
      email: 'test@example.com',
      phone: '+1234567890',
      location: 'Test City'
    }
  }))
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    button: 'button',
    span: 'span',
    a: 'a',
    header: 'header',
    nav: 'nav',
    input: 'input',
    form: 'form',
    img: 'img',
    ul: 'ul',
    li: 'li'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('App Component', () => {
  beforeEach(() => {
    // Mock window.matchMedia for theme detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Mock scrollTo
    window.scrollTo = jest.fn();
  });

  test('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders main content after loading', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Developer')).toBeInTheDocument();
    expect(screen.getByText('Test bio description')).toBeInTheDocument();
  });

  test('renders all main sections', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Check for section IDs
    expect(document.getElementById('about')).toBeInTheDocument();
    expect(document.getElementById('projects')).toBeInTheDocument();
    expect(document.getElementById('skills')).toBeInTheDocument();
    expect(document.getElementById('soft-skills')).toBeInTheDocument();
    expect(document.getElementById('experiences')).toBeInTheDocument();
    expect(document.getElementById('contact')).toBeInTheDocument();
  });

  test('theme toggle functionality works', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Find theme toggle button
    const themeToggle = screen.getByRole('button', { name: /switch theme/i });
    expect(themeToggle).toBeInTheDocument();

    // Click theme toggle
    await user.click(themeToggle);
    
    // Verify theme attribute changes
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
    });
  });

  test('CTA buttons are functional', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Check for CTA buttons
    const viewWorkButton = screen.getByText('View My Work');
    const contactButton = screen.getByText('Contact Me');
    const downloadButton = screen.getByText('Download Resume');

    expect(viewWorkButton).toBeInTheDocument();
    expect(contactButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();

    // Test clicking CTA buttons
    await user.click(viewWorkButton);
    await user.click(contactButton);
  });
});