import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CATEGORY_LABELS, apps, categoriesInUse, site } from '../../catalog';
import { AboutPage, meta } from './AboutPage';

describe('AboutPage', () => {
  it('has the /about/ path', () => {
    expect(meta.path).toBe('/about/');
  });

  it('renders the h1 and key sections', () => {
    render(<AboutPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'About deviloper.dev' })
    ).toBeInTheDocument();
    for (const name of [
      'What this is',
      'How the apps are built',
      "How it's funded",
      'New apps',
      'Current apps',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name })
      ).toBeInTheDocument();
    }
  });

  it('lists every public app under its category', () => {
    render(<AboutPage />);
    for (const category of categoriesInUse()) {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: CATEGORY_LABELS[category],
        })
      ).toBeInTheDocument();
    }
    for (const app of apps) {
      expect(screen.getByRole('link', { name: app.name })).toHaveAttribute(
        'href',
        `/apps/${app.slug}/`
      );
    }
  });

  it('mentions AdSense funding and the contact email', () => {
    const { container } = render(<AboutPage />);
    expect(container.textContent).toMatch(/Google AdSense/);
    expect(screen.getByRole('link', { name: site.email })).toHaveAttribute(
      'href',
      `mailto:${site.email}`
    );
  });

  it('keeps the prose within 250–400 words', () => {
    const { container } = render(<AboutPage />);
    const clone = container.cloneNode(true) as HTMLElement;
    clone.querySelector('[aria-labelledby="current-apps"]')?.remove();
    const words = (clone.textContent ?? '').split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(250);
    expect(words).toBeLessThanOrEqual(400);
  });

  it('never mentions a non-public app', () => {
    const { container } = render(<AboutPage />);
    expect(container.innerHTML).not.toMatch(/verdict/i);
  });
});
