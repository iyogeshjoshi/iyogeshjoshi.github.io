// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  buildSitemapIndex,
  buildSitemapMain,
  fillTemplate,
  outputFileFor,
  sitemapEntries,
  sitemapIndexUrls,
} from './prerender';

describe('outputFileFor', () => {
  it.each([
    ['/', 'index.html'],
    ['/apps/online-ruler/', 'apps/online-ruler/index.html'],
    ['/about/', 'about/index.html'],
    ['/privacy-policy.html', 'privacy-policy.html'],
    ['/404.html', '404.html'],
  ])('%s -> %s', (path, file) => expect(outputFileFor(path)).toBe(file));

  it('rejects ambiguous paths', () => {
    expect(() => outputFileFor('/about')).toThrow();
    expect(() => outputFileFor('about/')).toThrow();
  });
});

describe('fillTemplate', () => {
  const tpl =
    '<head><!--app-head--></head><div id="root"><!--app-html--></div>';

  it('replaces both placeholders literally', () => {
    expect(fillTemplate(tpl, '<title>$&</title>', '<p>$1</p>')).toBe(
      '<head><title>$&</title></head><div id="root"><p>$1</p></div>'
    );
  });

  it('throws when a placeholder is missing or repeated', () => {
    expect(() => fillTemplate('<!--app-html-->', '', '')).toThrow(/app-head/);
    expect(() => fillTemplate(`${tpl}<!--app-html-->`, '', '')).toThrow(
      /found 2/
    );
  });
});

describe('sitemaps', () => {
  const routes = [
    { path: '/', meta: {} },
    { path: '/apps/a/', meta: {}, app: { updatedAt: '2026-01-02' } },
    { path: '/about/', meta: {} },
    { path: '/404.html', meta: { noindex: true } },
  ];

  it('sitemap-main lists indexable routes with lastmod', () => {
    const xml = buildSitemapMain(sitemapEntries(routes), '2026-11-12');
    expect(xml).toMatch(
      /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/
    );
    expect(xml).toContain(
      '<loc>https://deviloper.dev/</loc>\n    <lastmod>2026-11-12</lastmod>'
    );
    expect(xml).toContain(
      '<loc>https://deviloper.dev/apps/a/</loc>\n    <lastmod>2026-01-02</lastmod>'
    );
    expect(xml).toContain('<loc>https://deviloper.dev/about/</loc>');
    expect(xml).not.toContain('404');
    expect(xml.match(/<url>/g)).toHaveLength(3);
  });

  it('sitemap index: own sitemap first, then public subdomain sitemaps only', () => {
    const urls = sitemapIndexUrls([
      {
        slug: 'a',
        status: 'live',
        sitemap: 'https://a.deviloper.dev/sitemap-index.xml',
      },
      { slug: 'b', status: 'live' },
      {
        slug: 'c',
        status: 'private',
        sitemap: 'https://c.deviloper.dev/sitemap.xml',
      },
    ]);
    expect(urls).toEqual([
      'https://deviloper.dev/sitemap-main.xml',
      'https://a.deviloper.dev/sitemap-index.xml',
    ]);
    const xml = buildSitemapIndex([...urls, urls[1]], '2026-11-12');
    expect(xml).toContain(
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    expect(xml.match(/<sitemap>/g)).toHaveLength(2);
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
    expect(xml).not.toContain('c.deviloper.dev');
  });

  it('escapes XML in URLs', () => {
    expect(
      buildSitemapIndex(['https://x.deviloper.dev/s.xml?a=1&b=2'], '2026-11-12')
    ).toContain('a=1&amp;b=2');
  });
});
