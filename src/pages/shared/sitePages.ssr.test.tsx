// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';

import { site } from '../../catalog';
import { SITE_PAGES } from './sitePages';

describe('site pages SSR', () => {
  it.each(SITE_PAGES.map((p) => [p.meta.path, p] as const))(
    '%s renders to a string without browser globals',
    (_path, { Component }) => {
      const html = renderToString(<Component />);
      expect(html).toContain('<h1');
      expect(html).not.toContain('<main');
      expect(html).not.toMatch(/verdict/i);
    }
  );

  it('renders the copy button hidden and disabled on the server', () => {
    const contact = SITE_PAGES.find((p) => p.meta.path === '/contact/');
    const html = renderToString(contact ? <contact.Component /> : null);
    expect(html).toMatch(/<button[^>]*hidden=""[^>]*disabled=""/);
    expect(html).toContain(`mailto:${site.email}`);
  });
});
