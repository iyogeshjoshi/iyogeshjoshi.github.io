import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { installMatchMedia } from '../test/matchMedia';
import type { MatchMediaMock } from '../test/matchMedia';
import { ThemeToggle } from './ThemeToggle';

const LIGHT = '(prefers-color-scheme: light)';

describe('ThemeToggle', () => {
  let mm: MatchMediaMock;

  beforeEach(() => {
    window.localStorage.clear();
    document.head.innerHTML = '<meta name="theme-color" content="#000000">';
    document.documentElement.dataset.theme = 'light';
    document.documentElement.dataset.themeMode = 'light';
    mm = installMatchMedia();
  });

  afterEach(() => mm.restore());

  it('cycles light -> dark -> auto -> light, updating labels and storage', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-label', 'Theme: Light. Switch to Dark.');
    expect(button).toHaveTextContent('Light');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Theme: Dark. Switch to Auto.');
    expect(button).toHaveTextContent('Dark');
    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Theme: Auto. Switch to Light.');
    expect(window.localStorage.getItem('theme')).toBe('auto');

    fireEvent.click(button);
    expect(button).toHaveTextContent('Light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('hides the text label but keeps aria-label when compact', () => {
    render(<ThemeToggle compact />);
    const button = screen.getByRole('button');
    expect(button).not.toHaveTextContent('Light');
    expect(button).toHaveAttribute('aria-label', 'Theme: Light. Switch to Dark.');
  });

  it('follows system changes while in auto', () => {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.dataset.themeMode = 'auto';
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('Auto');

    act(() => mm.set(LIGHT, true));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.dataset.themeMode).toBe('auto');

    act(() => mm.set(LIGHT, false));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('does not react to system changes when a mode is fixed', () => {
    render(<ThemeToggle />);
    act(() => mm.set(LIGHT, false));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
