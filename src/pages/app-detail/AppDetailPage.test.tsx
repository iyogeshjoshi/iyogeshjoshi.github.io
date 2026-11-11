import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CATEGORY_LABELS, apps, getApp } from '@/catalog';
import { isDesktopOnly } from '@/components/catalog';
import {
  AppDetailPage,
  appDetailPaths,
  formatUpdated,
  getAppDetailMeta,
  splitParagraphs,
} from './AppDetailPage';

const detailApps = apps.filter(
  (a) => a.status === 'live' || a.status === 'beta'
);

describe('appDetailPaths', () => {
  it('lists live/beta apps only, uniquely', () => {
    const paths = appDetailPaths();
    expect(paths).toHaveLength(detailApps.length);
    expect(new Set(paths).size).toBe(paths.length);
    for (const app of apps.filter((a) => a.status === 'coming-soon')) {
      expect(paths).not.toContain(`/apps/${app.slug}/`);
    }
    expect(paths.join(' ').toLowerCase()).not.toContain('verdict');
  });
});

describe('getAppDetailMeta', () => {
  it.each(detailApps.map((a) => a.slug))('%s has bounded meta', (slug) => {
    const meta = getAppDetailMeta(slug);
    expect(meta.title.length).toBeLessThanOrEqual(70);
    expect(meta.title.endsWith('| deviloper.dev')).toBe(true);
    expect(meta.description.length).toBeGreaterThan(0);
    expect(meta.description.length).toBeLessThanOrEqual(160);
    expect(meta.path).toBe(`/apps/${slug}/`);
  });

  it('throws for an unknown slug', () => {
    expect(() => getAppDetailMeta('nope')).toThrow(/nope/);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AppDetailPage slug="nope" />)).toThrow(/nope/);
    spy.mockRestore();
  });
});

describe('formatUpdated', () => {
  it('is deterministic', () => {
    expect(formatUpdated('2026-11-11')).toBe('11 Nov 2026');
    expect(formatUpdated('2026-09-01')).toBe('1 Sep 2026');
    expect(formatUpdated('2026-01-31')).toBe('31 Jan 2026');
  });
});

describe('splitParagraphs', () => {
  it('splits a single paragraph near the middle at a sentence boundary', () => {
    const text = 'One is here. Two is here. Three is here. Four is here.';
    expect(splitParagraphs(text)).toEqual([
      'One is here. Two is here.',
      'Three is here. Four is here.',
    ]);
  });
  it('honours blank lines', () => {
    expect(splitParagraphs('A b.\n\nC d.')).toEqual(['A b.', 'C d.']);
  });
});

describe.each(detailApps.map((a) => [a.slug]))('AppDetailPage %s', (slug) => {
  const app = getApp(slug)!;

  it('renders hero, CTA, breadcrumbs and content counts', () => {
    const { container } = render(<AppDetailPage slug={slug} />);
    expect(
      screen.getByRole('heading', { level: 1, name: app.name })
    ).toBeInTheDocument();

    const cta = screen.getByRole('link', {
      name: new RegExp(`^Open ${app.name}`),
    });
    expect(cta).toHaveAttribute('href', app.url);
    expect(cta).toHaveAttribute('rel', 'noopener');
    expect(
      screen.getByRole('link', { name: 'Back to catalog' })
    ).toHaveAttribute('href', '/');

    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(crumbs).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(
      within(crumbs).getByRole('link', { name: CATEGORY_LABELS[app.category] })
    ).toHaveAttribute(
      'href',
      `/?category=${CATEGORY_LABELS[app.category].toLowerCase()}`
    );
    expect(crumbs.querySelector('[aria-current="page"]')).toHaveTextContent(
      app.name
    );

    const article = container.querySelector('article')!;
    expect(article.querySelectorAll('ul > li')).toHaveLength(
      app.features.length
    );
    expect(article.querySelectorAll('ol > li')).toHaveLength(app.howTo.length);
    expect(container.querySelector('main')).toBeNull();
    expect(container.textContent!.toLowerCase()).not.toContain('verdict');
  });

  it('shows at-a-glance facts', () => {
    render(<AppDetailPage slug={slug} />);
    const aside = screen.getByRole('complementary', { name: 'At a glance' });
    expect(within(aside).getByText('Free, no sign-up')).toBeInTheDocument();
    expect(within(aside).getByText(app.privacy)).toBeInTheDocument();
    if (app.updatedAt) {
      expect(
        within(aside).getByText(formatUpdated(app.updatedAt))
      ).toBeInTheDocument();
    }
    if (app.controls) {
      expect(within(aside).getAllByText(app.controls).length).toBeGreaterThan(
        0
      );
    }
  });

  it('excludes itself from related apps', () => {
    const { container } = render(<AppDetailPage slug={slug} />);
    const cards = container.querySelectorAll('[data-slug]');
    expect(cards.length).toBeLessThanOrEqual(3);
    for (const card of cards) {
      expect(card.getAttribute('data-slug')).not.toBe(slug);
    }
    if (cards.length > 0) {
      expect(
        screen.getByRole('heading', { level: 2, name: 'More from the catalog' })
      ).toBeInTheDocument();
    }
  });

  it('shows the desktop callout only for desktop-only apps', () => {
    render(<AppDetailPage slug={slug} />);
    const callout = screen.queryByTestId('desktop-callout');
    if (isDesktopOnly(app)) expect(callout).toBeInTheDocument();
    else expect(callout).toBeNull();
  });
});

describe('desktop callout expectations', () => {
  it('ping-pong and primordia show it; game-of-life does not', () => {
    for (const slug of ['ping-pong', 'primordia']) {
      const { unmount } = render(<AppDetailPage slug={slug} />);
      expect(screen.getByTestId('desktop-callout')).toBeInTheDocument();
      unmount();
    }
    render(<AppDetailPage slug="game-of-life" />);
    expect(screen.queryByTestId('desktop-callout')).toBeNull();
  });
});
