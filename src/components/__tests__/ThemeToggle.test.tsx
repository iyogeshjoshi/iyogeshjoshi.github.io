import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import ThemeToggle from '../ThemeToggle';
import { lightTheme } from '../../theme';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
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

describe('ThemeToggle Component', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  test('renders with light theme', () => {
    renderWithTheme(
      <ThemeToggle theme="light" onToggle={mockOnToggle} />
    );

    expect(screen.getByText('☀️')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  test('renders with dark theme', () => {
    renderWithTheme(
      <ThemeToggle theme="dark" onToggle={mockOnToggle} />
    );

    expect(screen.getByText('🌙')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  test('renders with auto theme', () => {
    renderWithTheme(
      <ThemeToggle theme="auto" onToggle={mockOnToggle} />
    );

    expect(screen.getByText('🔄')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
  });

  test('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <ThemeToggle theme="light" onToggle={mockOnToggle} />
    );

    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  test('has correct accessibility attributes', () => {
    renderWithTheme(
      <ThemeToggle theme="light" onToggle={mockOnToggle} />
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-label');
    expect(toggleButton).toHaveAttribute('title');
  });

  test('shows correct next theme in aria-label', () => {
    renderWithTheme(
      <ThemeToggle theme="light" onToggle={mockOnToggle} />
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch theme from Light to Dark');
  });

  test('keyboard navigation works', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <ThemeToggle theme="light" onToggle={mockOnToggle} />
    );

    const toggleButton = screen.getByRole('button');
    toggleButton.focus();
    
    await user.keyboard('{Enter}');
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  test('theme cycle works correctly', () => {
    const { rerender } = renderWithTheme(
      <ThemeToggle theme="light" onToggle={mockOnToggle} />
    );

    // Light theme should show "Switch to Dark"
    expect(screen.getByLabelText(/switch theme from light to dark/i)).toBeInTheDocument();

    // Rerender with dark theme
    rerender(
      <ThemeProvider theme={lightTheme}>
        <ThemeToggle theme="dark" onToggle={mockOnToggle} />
      </ThemeProvider>
    );

    // Dark theme should show "Switch to Auto"
    expect(screen.getByLabelText(/switch theme from dark to auto/i)).toBeInTheDocument();

    // Rerender with auto theme
    rerender(
      <ThemeProvider theme={lightTheme}>
        <ThemeToggle theme="auto" onToggle={mockOnToggle} />
      </ThemeProvider>
    );

    // Auto theme should show "Switch to Light"
    expect(screen.getByLabelText(/switch theme from auto to light/i)).toBeInTheDocument();
  });
});