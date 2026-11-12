import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { apps } from '../../catalog';
import { SitemapPage, meta } from './SitemapPage';

describe('SitemapPage', () => {
  it('has the legacy path', () => {
    expect(meta.path).toBe('/sitemap.html');
  });

  it('renders the h1 and sections', () => {
    render(<SitemapPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sitemap' })
    ).toBeInTheDocument();
    for (const name of ['Home', 'Apps', 'Site pages', 'For search engines']) {
      expect(
        screen.getByRole('heading', { level: 2, name })
      ).toBeInTheDocument();
    }
  });

  it('lists every public app detail URL and live site', () => {
    const { container } = render(<SitemapPage />);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href')
    );
    for (const app of apps) {
      expect(hrefs).toContain(`/apps/${app.slug}/`);
      expect(hrefs).toContain(app.url);
    }
  });

  it('links home, the site pages and the XML sitemap', () => {
    const { container } = render(<SitemapPage />);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href')
    );
    for (const href of [
      '/',
      '/about/',
      '/contact/',
      '/privacy-policy.html',
      '/terms.html',
      '/sitemap.xml',
    ]) {
      expect(hrefs).toContain(href);
    }
  });

  it('never mentions a non-public app', () => {
    const { container } = render(<SitemapPage />);
    expect(container.innerHTML).not.toMatch(/verdict/i);
  });
});
