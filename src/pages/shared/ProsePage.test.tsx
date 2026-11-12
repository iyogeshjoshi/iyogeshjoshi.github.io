import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { LEGAL_LAST_UPDATED, formatIsoDate } from './legal';
import { ProsePage, ProseSection, SummaryBox } from './ProsePage';
import { SITE_PAGES } from './sitePages';

describe('formatIsoDate', () => {
  it('formats ISO dates without locale or time-zone drift', () => {
    expect(formatIsoDate('2026-11-11')).toBe('11 November 2026');
    expect(formatIsoDate('2026-01-05')).toBe('5 January 2026');
    expect(formatIsoDate('not a date')).toBe('not a date');
  });

  it('pins the legal date', () => {
    expect(LEGAL_LAST_UPDATED).toBe('2026-11-11');
  });
});

describe('ProsePage', () => {
  it('renders header, toc, sections and summary without a <main>', () => {
    const { container } = render(
      <ProsePage
        eyebrow="Legal"
        title="Title"
        lead="Lead"
        updated="2026-11-11"
        toc={[{ id: 'one', label: 'One' }]}
      >
        <SummaryBox title="Short">
          <p>s</p>
        </SummaryBox>
        <ProseSection id="one" title="One">
          <p>x</p>
        </ProseSection>
      </ProsePage>
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Title' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'One' })
    ).toHaveAttribute('id', 'one');
    expect(screen.getByRole('link', { name: 'One' })).toHaveAttribute(
      'href',
      '#one'
    );
    expect(
      screen.getByRole('complementary', { name: 'Short' })
    ).toBeInTheDocument();
    expect(container.querySelector('time')).toHaveAttribute(
      'datetime',
      '2026-11-11'
    );
    expect(container.querySelector('main')).toBeNull();
  });
});

describe('SITE_PAGES meta', () => {
  it('has unique, non-empty paths, titles and descriptions', () => {
    const metas = SITE_PAGES.map((p) => p.meta);
    expect(new Set(metas.map((m) => m.path)).size).toBe(metas.length);
    expect(new Set(metas.map((m) => m.title)).size).toBe(metas.length);
    for (const m of metas) {
      expect(m.path.startsWith('/')).toBe(true);
      expect(m.title.length).toBeGreaterThan(0);
      expect(m.description.length).toBeGreaterThan(50);
      expect(m.description.length).toBeLessThanOrEqual(170);
    }
    expect(metas.map((m) => m.path).sort()).toEqual(
      [
        '/about/',
        '/contact/',
        '/privacy-policy.html',
        '/sitemap.html',
        '/terms.html',
      ].sort()
    );
  });

  it('never mentions a non-public app in meta', () => {
    for (const { meta } of SITE_PAGES) {
      expect(JSON.stringify(meta)).not.toMatch(/verdict/i);
    }
  });
});
