// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { NOT_FOUND_PATH, routes } from './routes';
import { render } from './entry-server';

function jsonLd(head: string): Record<string, unknown>[] {
  return [
    ...head.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    ),
  ].map((m) => JSON.parse(m[1]) as Record<string, unknown>);
}

describe('render()', () => {
  it.each(routes.map((r) => [r.path] as const))('%s', (path) => {
    const { html, head, status } = render(path);
    const route = routes.find((r) => r.path === path);
    expect(route).toBeDefined();
    const is404 = path === NOT_FOUND_PATH;

    expect(status).toBe(is404 ? 404 : 200);
    expect(html).toContain('<main');
    expect(html).toContain('<h1');
    expect(head).toContain('<title>');
    expect(head).toMatch(/<meta name="description" content="[^"]+"/);
    expect(head).toContain('<meta property="og:title"');
    expect(head).toMatch(
      /<meta property="og:image" content="https:\/\/deviloper\.dev\//
    );
    expect(head).toMatch(
      /<meta name="twitter:card" content="summary(_large_image)?"/
    );
    if (is404) {
      expect(head).not.toContain('rel="canonical"');
      expect(head).toContain('<meta name="robots" content="noindex" />');
    } else {
      expect(head).toContain(
        `<link rel="canonical" href="https://deviloper.dev${path}" />`
      );
      expect(head).not.toContain('noindex');
    }
    for (const data of jsonLd(head))
      expect(data['@context']).toBe('https://schema.org');
    expect(`${head}${html}`.toLowerCase()).not.toContain('verdict');
  });

  it('home has WebSite + SearchAction and an ItemList of detail pages', () => {
    const [site, list] = jsonLd(render('/').head);
    expect(site['@type']).toBe('WebSite');
    expect(JSON.stringify(site)).toContain(
      'https://deviloper.dev/?q={search_term_string}'
    );
    expect(list['@type']).toBe('ItemList');
    const items = list.itemListElement as { url: string }[];
    expect(items.length).toBe(routes.filter((r) => r.app).length);
    expect(items[0].url).toMatch(
      /^https:\/\/deviloper\.dev\/apps\/[a-z0-9-]+\/$/
    );
  });

  it('detail pages have WebApplication + BreadcrumbList', () => {
    const detail = routes.find((r) => r.app);
    expect(detail?.app).toBeDefined();
    if (!detail?.app) return;
    const [app, crumbs] = jsonLd(render(detail.path).head);
    expect(app).toMatchObject({
      '@type': 'WebApplication',
      name: detail.app.name,
      url: detail.app.url,
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      offers: { price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Person', name: 'Yogesh Joshi' },
    });
    expect(crumbs['@type']).toBe('BreadcrumbList');
  });

  it('unknown paths render the 404 page', () => {
    expect(render('/does-not-exist/').status).toBe(404);
  });
});
