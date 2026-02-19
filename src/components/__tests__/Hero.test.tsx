import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import Hero from '../Hero';
import { lightTheme } from '../../theme';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    section: 'section',
    div: 'div',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    button: 'button',
    span: 'span'
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

const mockCTAButtons = [
  {
    label: 'View My Work',
    action: 'scroll' as const,
    target: 'experiences',
    variant: 'primary' as const
  },
  {
    label: 'Contact Me',
    action: 'contact' as const,
    variant: 'secondary' as const
  },
  {
    label: 'Download Resume',
    action: 'download' as const,
    variant: 'outline' as const
  }
];

describe('Hero Component', () => {
  const mockOnCTAClick = jest.fn();

  beforeEach(() => {
    mockOnCTAClick.mockClear();
    
    // Mock getElementById
    document.getElementById = jest.fn().mockImplementation((id) => ({
      id,
      scrollIntoView: jest.fn(),
    }));
  });

  test('renders hero with name and tagline', async () => {
    renderWithTheme(
      <Hero
        name="Test User"
        tagline="Test Developer"
        bio="Test bio description"
        ctaButtons={mockCTAButtons}
        onCTAClick={mockOnCTAClick}
      />
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    
    // Wait for typing effect to complete
    await waitFor(() => {
      expect(screen.getByText('Test Developer')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('renders bio after typing effect completes', async () => {
    renderWithTheme(
      <Hero
        name="Test User"
        tagline="Test Developer"
        bio="Test bio description"
        ctaButtons={mockCTAButtons}
        onCTAClick={mockOnCTAClick}
      />
    );

    // Wait for typing effect and bio to appear
    await waitFor(() => {
      expect(screen.getByText('Test bio description')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  test('renders all CTA buttons', async () => {
    renderWithTheme(
      <Hero
        name="Test User"
        tagline="Test Developer"
        bio="Test bio description"
        ctaButtons={mockCTAButtons}
        onCTAClick={mockOnCTAClick}
      />
    );

    // Wait for CTA buttons to appear
    await waitFor(() => {
      expect(screen.getByText('View My Work')).toBeInTheDocument();
      expect(screen.getByText('Contact Me')).toBeInTheDocument();
      expect(screen.getByText('Download Resume')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  test('CTA buttons trigger correct actions', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Hero
        name="Test User"
        tagline="Test Developer"
        bio="Test bio description"
        ctaButtons={mockCTAButtons}
        onCTAClick={mockOnCTAClick}
      />
    );

    // Wait for CTA buttons to appear
    await waitFor(() => {
      expect(screen.getByText('View My Work')).toBeInTheDocument();
    }, { timeout: 4000 });

    const viewWorkButton = screen.getByText('View My Work');
    await user.click(viewWorkButton);

    expect(mockOnCTAClick).toHaveBeenCalledWith('scroll', 'experiences');
  });

  test('scroll indicator is present and functional', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Hero
        name="Test User"
        tagline="Test Developer"
        bio="Test bio description"
        ctaButtons={mockCTAButtons}
        onCTAClick={mockOnCTAClick}
      />
    );

    const scrollIndicator = screen.getByText('Scroll');
    expect(scrollIndicator).toBeInTheDocument();

    await user.click(scrollIndicator);
    expect(document.getElementById).toHaveBeenCalledWith('about');
  });

  test('geometric background animation renders', () => {
    renderWithTheme(
      <Hero
        name="Test User"
        tagline="Test Developer"
        bio="Test bio description"
        ctaButtons={mockCTAButtons}
        backgroundAnimation="geometric"
        onCTAClick={mockOnCTAClick}
      />
    );

    // The geometric background should be rendered (check for hero section)
    const heroSection = document.querySelector('#hero');
    expect(heroSection).toBeInTheDocument();
  });

  test('keyboard navigation works for scroll indicator', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Hero
        name="Test User"
        tagline="Test Developer"
        bio="Test bio description"
        ctaButtons={mockCTAButtons}
        onCTAClick={mockOnCTAClick}
      />
    );

    const scrollIndicator = screen.getByRole('button', { name: /scroll to next section/i });
    scrollIndicator.focus();
    
    await user.keyboard('{Enter}');
    expect(document.getElementById).toHaveBeenCalledWith('about');
  });

  test('typing effect works correctly', async () => {
    renderWithTheme(
      <Hero
        name="Test User"
        tagline="Short"
        bio="Test bio description"
        ctaButtons={mockCTAButtons}
        onCTAClick={mockOnCTAClick}
      />
    );

    // Initially tagline should not be visible
    expect(screen.queryByText('Short')).not.toBeInTheDocument();

    // Wait for typing effect to complete
    await waitFor(() => {
      expect(screen.getByText('Short')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});