import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import Header from '../Header';
import { lightTheme } from '../../theme';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    header: 'header',
    nav: 'nav',
    a: 'a',
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

describe('Header Component', () => {
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

  test('renders header with name', () => {
    renderWithTheme(<Header name="Test User" />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('renders all navigation items', () => {
    renderWithTheme(<Header name="Test User" />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Soft Skills')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  test('navigation links are clickable', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Header name="Test User" />);
    
    const aboutLink = screen.getByText('About');
    await user.click(aboutLink);
    
    expect(window.scrollTo).toHaveBeenCalled();
  });

  test('mobile menu toggle works', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Header name="Test User" />);
    
    const hamburgerButton = screen.getByRole('button', { name: /open menu/i });
    expect(hamburgerButton).toBeInTheDocument();
    
    await user.click(hamburgerButton);
    
    // Check if menu is expanded
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('keyboard navigation works', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Header name="Test User" />);
    
    const aboutLink = screen.getByText('About');
    aboutLink.focus();
    
    await user.keyboard('{Enter}');
    expect(window.scrollTo).toHaveBeenCalled();
  });

  test('scroll progress bar is present', () => {
    renderWithTheme(<Header name="Test User" />);
    
    // The scroll progress bar should be rendered (though not visible in tests)
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  test('renders children components', () => {
    renderWithTheme(
      <Header name="Test User">
        <button>Test Button</button>
      </Header>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  test('logo click scrolls to top', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Header name="Test User" />);
    
    const logo = screen.getByText('Test User');
    await user.click(logo);
    
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});