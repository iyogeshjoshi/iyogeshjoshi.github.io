import { describe, expect, it } from 'vitest';

import { apps } from '@/catalog';
import { appDetailPaths } from '@/pages/app-detail';
import { SITE_PAGES } from '@/pages/shared/sitePages';
import {
  HOME_TITLE,
  NOT_FOUND_PATH,
  normalizePath,
  resolveRoute,
  routes,
  withSiteSuffix,
} from './routes';

describe('route registry', () => {
  const paths = routes.map((r) => r.path);

  it('covers home, every detail page, every site page and 404', () => {
    expect(paths).toContain('/');
    for (const p of appDetailPaths()) expect(paths).toContain(p);
    for (const { meta } of SITE_PAGES) expect(paths).toContain(meta.path);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/privacy-policy.html',
        '/terms.html',
        '/about/',
        '/contact/',
        '/sitemap.html',
        NOT_FOUND_PATH,
      ])
    );
    expect(paths).toHaveLength(
      1 + appDetailPaths().length + SITE_PAGES.length + 1
    );
  });

  it('has unique paths whose meta.path matches', () => {
    expect(new Set(paths).size).toBe(paths.length);
    for (const route of routes) expect(route.meta.path).toBe(route.path);
  });

  it('only marks 404 as noindex', () => {
    expect(routes.filter((r) => r.meta.noindex).map((r) => r.path)).toEqual([
      NOT_FOUND_PATH,
    ]);
  });

  it('titles: home is the brand line, others are suffixed exactly once', () => {
    expect(resolveRoute('/').meta.title).toBe(HOME_TITLE);
    for (const route of routes.filter((r) => r.path !== '/')) {
      expect(route.meta.title.endsWith(' | deviloper.dev')).toBe(true);
      expect(route.meta.title.split(' | deviloper.dev')).toHaveLength(2);
    }
    expect(withSiteSuffix('About | deviloper.dev')).toBe(
      'About | deviloper.dev'
    );
  });

  it('never exposes private apps', () => {
    for (const app of apps) expect(app.status).not.toBe('private');
    expect(paths.join(' ')).not.toMatch(/verdict/i);
  });
});

describe('normalizePath / resolveRoute', () => {
  it.each([
    ['/', '/'],
    ['/index.html', '/'],
    ['/apps/online-ruler', '/apps/online-ruler/'],
    ['/apps/online-ruler/index.html', '/apps/online-ruler/'],
    ['/about', '/about/'],
    ['/about/?x=1#top', '/about/'],
    ['//about//', '/about/'],
    ['/terms.html', '/terms.html'],
    ['', '/'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizePath(input)).toBe(expected);
  });

  it('resolves known paths and falls back to 404', () => {
    expect(resolveRoute('/apps/online-ruler').path).toBe('/apps/online-ruler/');
    expect(resolveRoute('/index.html').path).toBe('/');
    expect(resolveRoute('/nope/').path).toBe(NOT_FOUND_PATH);
    expect(resolveRoute('/apps/verdict/').path).toBe(NOT_FOUND_PATH);
  });
});
