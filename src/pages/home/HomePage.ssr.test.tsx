// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { apps } from '@/catalog';
import { HomePage } from './HomePage';

describe('HomePage (server render)', () => {
  it('renders to a string without browser globals', () => {
    expect(typeof window).toBe('undefined');
    const html = renderToString(<HomePage />);

    expect(html).toContain('Side projects, small tools &amp; games.');
    for (const app of apps) {
      expect(html).toContain(app.name);
      expect(html).toContain(`href="/apps/${app.slug}/"`);
      expect(html).toContain(`view-transition-name:app-${app.slug}`);
    }
    expect(html).toContain('5 apps');
    expect(html.toLowerCase()).not.toContain('verdict');
  });

  it('is deterministic', () => {
    expect(renderToString(<HomePage />)).toBe(renderToString(<HomePage />));
  });
});
