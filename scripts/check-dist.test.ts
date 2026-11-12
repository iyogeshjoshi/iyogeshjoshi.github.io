// @vitest-environment node
import { describe, expect, it } from 'vitest';

import type { Catalog } from '../src/catalog/schema';
import { checkDist, leakTerms } from './check-dist';

const app = (slug: string, name: string, status: string) => ({
  slug,
  name,
  status,
  url: `https://${slug}.deviloper.dev`,
});

const catalog = {
  site: {},
  apps: [
    app('ruler', 'Online Ruler', 'live'),
    app('secret', 'Hush Box', 'private'),
    app('wip', 'Wip Thing', 'draft'),
  ],
} as unknown as Catalog;

const page = '<html>ca-pub-5076417401305199 G-PCZPZC1H5E</html>';

function goodFiles(): Map<string, string | null> {
  return new Map<string, string | null>([
    ['index.html', page],
    ['404.html', page],
    ['apps/ruler/index.html', page],
    ['sitemap.xml', '<sitemapindex/>'],
    ['sitemap-main.xml', '<urlset/>'],
    ['robots.txt', 'Sitemap: https://deviloper.dev/sitemap.xml'],
    ['CNAME', 'deviloper.dev\n'],
    ['ads.txt', 'google.com, pub-5076417401305199, DIRECT, f08c47fec0942fa0'],
    ['assets/index.js', 'console.log("ok")'],
    ['logo.png', null],
  ]);
}

describe('checkDist', () => {
  it('collects slug, name and host of every non-public entry', () => {
    expect(leakTerms(catalog).map((t) => t.term)).toEqual([
      'secret',
      'hush box',
      'secret.deviloper.dev',
      'wip',
      'wip thing',
      'wip.deviloper.dev',
    ]);
  });

  it('passes a clean dist', () => {
    expect(checkDist(goodFiles(), catalog)).toEqual([]);
  });

  it('flags private names case-insensitively in any text file', () => {
    const files = goodFiles();
    files.set('assets/index.js', 'const x = "HUSH BOX";');
    files.set('assets/index.css', '.secretCard{}');
    const problems = checkDist(files, catalog);
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringContaining('"hush box" found in assets/index.js'),
        expect.stringContaining('"secret" found in assets/index.css'),
      ])
    );
  });

  it('flags missing pages, tags, maps, CNAME and ads.txt problems', () => {
    const files = goodFiles();
    files.delete('apps/ruler/index.html');
    files.delete('404.html');
    files.set('about/index.html', '<html><!--app-head--></html>');
    files.set('assets/index.js.map', '{}');
    files.set('CNAME', 'example.com');
    files.set('ads.txt', 'nothing');
    const problems = checkDist(files, catalog).join('\n');
    expect(problems).toContain('missing required file: apps/ruler/index.html');
    expect(problems).toContain('missing required file: 404.html');
    expect(problems).toContain('about/index.html: missing AdSense client');
    expect(problems).toContain('about/index.html: missing GA4 id');
    expect(problems).toContain(
      'about/index.html: unfilled prerender placeholder'
    );
    expect(problems).toContain('source map shipped: assets/index.js.map');
    expect(problems).toContain('CNAME is "example.com"');
    expect(problems).toContain('ads.txt does not contain pub-5076417401305199');
  });

  it('flags an og:image that is not in dist', () => {
    const files = goodFiles();
    files.set(
      'index.html',
      `${page}<meta property="og:image" content="https://deviloper.dev/previews/x-og.png" />`
    );
    expect(checkDist(files, catalog)).toEqual([
      'index.html: og:image /previews/x-og.png not found in dist/',
    ]);
  });
});
