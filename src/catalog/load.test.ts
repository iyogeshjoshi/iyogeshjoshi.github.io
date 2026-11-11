// @vitest-environment node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { renderCatalogModule } from '../../scripts/vite-plugin-catalog';
import {
  formatIssuePath,
  parseCatalog,
  PUBLIC_STATUSES,
  toPublicCatalog,
} from './load';
import { countWords } from './schema';

const CATALOG_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../data/catalog.yaml'
);
const realYaml = readFileSync(CATALOG_PATH, 'utf8');

const words = (n: number): string =>
  Array.from({ length: n }, (_, i) => `word${i}`).join(' ');

function makeApp(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    slug: 'sample-app',
    name: 'Sample App',
    url: 'https://sample.deviloper.dev',
    category: 'tool',
    status: 'live',
    tagline: 'A sample app used in tests.',
    description: words(160),
    features: ['One', 'Two', 'Three'],
    howTo: ['First', 'Second', 'Third'],
    tags: ['sample'],
    privacy: 'Runs in your browser.',
    devices: ['desktop'],
    accent: '#2DD4BF',
    previewKind: 'generic',
    ...overrides,
  };
}

function makeCatalogYaml(apps: Record<string, unknown>[]): string {
  return stringify({
    site: {
      name: 'deviloper.dev',
      tagline: 'Side projects, small tools & games.',
      description: 'A collection.',
      url: 'https://deviloper.dev',
      email: 'hello@deviloper.dev',
    },
    apps,
  });
}

function parseError(apps: Record<string, unknown>[]): string {
  try {
    parseCatalog(makeCatalogYaml(apps));
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error('expected parseCatalog to throw');
}

describe('parseCatalog: real catalog', () => {
  const catalog = parseCatalog(realYaml);

  it('parses src/data/catalog.yaml', () => {
    expect(catalog.site.url).toBe('https://deviloper.dev');
    expect(catalog.apps).toHaveLength(6);
  });

  it('keeps public descriptions within the 150-400 word range', () => {
    for (const app of toPublicCatalog(catalog).apps) {
      const count = countWords(app.description);
      expect(count, app.slug).toBeGreaterThanOrEqual(150);
      expect(count, app.slug).toBeLessThanOrEqual(400);
    }
  });

  it('keeps Verdict private and account-only', () => {
    const verdict = catalog.apps.find((app) => app.slug === 'verdict');
    expect(verdict?.status).toBe('private');
    expect(verdict?.requiresAccount).toBe(true);
  });

  it('applies defaults', () => {
    const ruler = catalog.apps.find((app) => app.slug === 'online-ruler');
    expect(ruler?.requiresAccount).toBe(false);
    const life = catalog.apps.find((app) => app.slug === 'game-of-life');
    expect(life?.featured).toBe(false);
  });
});

describe('parseCatalog: validation', () => {
  it('accepts a minimal valid catalog', () => {
    expect(parseCatalog(makeCatalogYaml([makeApp()])).apps[0].slug).toBe(
      'sample-app'
    );
  });

  it('accepts a trailing slash on the app URL', () => {
    expect(() =>
      parseCatalog(
        makeCatalogYaml([makeApp({ url: 'https://sample.deviloper.dev/' })])
      )
    ).not.toThrow();
  });

  it.each([
    ['Sample'],
    ['sample_app'],
    ['-sample'],
    ['sample--app'],
    ['sample-'],
  ])('rejects bad slug %j', (slug) => {
    expect(parseError([makeApp({ slug })])).toContain('apps[0].slug:');
  });

  it('rejects duplicate slugs and reports the second occurrence', () => {
    const message = parseError([
      makeApp(),
      makeApp({ url: 'https://other.deviloper.dev' }),
    ]);
    expect(message).toContain('apps[1].slug: duplicate slug "sample-app"');
  });

  it('rejects duplicate urls, ignoring a trailing slash', () => {
    const message = parseError([
      makeApp(),
      makeApp({ slug: 'other', url: 'https://sample.deviloper.dev/' }),
    ]);
    expect(message).toContain('apps[1].url: duplicate url');
  });

  it.each([
    ['https://sample.example.com'],
    ['https://deviloper.dev'],
    ['https://sample.deviloper.dev.evil.com'],
    ['https://sample.deviloper.dev/path'],
  ])('rejects non-deviloper or non-subdomain url %j', (url) => {
    expect(parseError([makeApp({ url })])).toContain('apps[0].url:');
  });

  it('rejects http URLs', () => {
    expect(
      parseError([makeApp({ url: 'http://sample.deviloper.dev' })])
    ).toContain('apps[0].url:');
  });

  it('rejects a tagline longer than 90 characters', () => {
    expect(parseError([makeApp({ tagline: 'x'.repeat(91) })])).toContain(
      'apps[0].tagline:'
    );
    expect(() =>
      parseCatalog(makeCatalogYaml([makeApp({ tagline: 'x'.repeat(90) })]))
    ).not.toThrow();
  });

  it.each(PUBLIC_STATUSES)(
    'rejects a %s entry with fewer than 150 words',
    (status) => {
      const message = parseError([
        makeApp({ status, description: words(149) }),
      ]);
      expect(message).toContain(
        'apps[0].description: must be at least 150 words'
      );
      expect(message).toContain('(has 149)');
    }
  );

  it('rejects public entries with fewer than 3 features or howTo steps', () => {
    const message = parseError([
      makeApp({ features: ['One'], howTo: ['One', 'Two'] }),
    ]);
    expect(message).toContain('apps[0].features:');
    expect(message).toContain('apps[0].howTo:');
  });

  it.each(['private', 'draft'])(
    'allows a %s entry with short copy',
    (status) => {
      const yaml = makeCatalogYaml([
        makeApp({ status, description: 'Short.', features: [], howTo: [] }),
      ]);
      expect(() => parseCatalog(yaml)).not.toThrow();
    }
  );

  it('rejects bad enums, colors, dates, tags and unknown keys', () => {
    const message = parseError([
      makeApp({
        category: 'widget',
        status: 'archived',
        accent: 'teal',
        updatedAt: '2026-02-30',
        tags: [],
        devices: ['watch'],
        previewKind: 'other',
        surprise: true,
      }),
    ]);
    for (const path of [
      'category',
      'status',
      'accent',
      'updatedAt',
      'tags',
      'devices[0]',
      'previewKind',
    ]) {
      expect(message).toContain(`apps[0].${path}:`);
    }
    expect(message).toMatch(/apps\[0\]: Unrecognized key/);
  });

  it('rejects more than 5 tags', () => {
    expect(
      parseError([makeApp({ tags: ['a', 'b', 'c', 'd', 'e', 'f'] })])
    ).toContain('apps[0].tags:');
  });

  it('rejects an http sitemap', () => {
    expect(
      parseError([
        makeApp({ sitemap: 'http://sample.deviloper.dev/sitemap.xml' }),
      ])
    ).toContain('apps[0].sitemap:');
  });

  it('lists every issue in one error', () => {
    const message = parseError([
      makeApp({ slug: 'Bad', tagline: 'x'.repeat(91) }),
      makeApp({ slug: 'x', url: 'http://x' }),
    ]);
    expect(message).toMatch(/^Invalid catalog \(3 issues\):/);
    expect(message).toContain('apps[0].slug:');
    expect(message).toContain('apps[0].tagline:');
    expect(message).toContain('apps[1].url:');
  });

  it('reports malformed YAML readably', () => {
    expect(() => parseCatalog('site: [unclosed')).toThrow(
      /^Invalid catalog YAML:/
    );
  });

  it('reports a missing site block', () => {
    expect(() => parseCatalog('apps: []')).toThrow(/site: Required/);
  });
});

describe('formatIssuePath', () => {
  it('formats nested paths', () => {
    expect(formatIssuePath(['apps', 2, 'description'])).toBe(
      'apps[2].description'
    );
    expect(formatIssuePath(['apps', 0, 'devices', 1])).toBe(
      'apps[0].devices[1]'
    );
    expect(formatIssuePath([])).toBe('(root)');
  });
});

describe('toPublicCatalog', () => {
  it('excludes private and draft entries and keeps public ones intact', () => {
    const catalog = parseCatalog(
      makeCatalogYaml([
        makeApp({
          slug: 'live-app',
          url: 'https://live.deviloper.dev',
          status: 'live',
        }),
        makeApp({
          slug: 'beta-app',
          url: 'https://beta.deviloper.dev',
          status: 'beta',
        }),
        makeApp({
          slug: 'soon-app',
          url: 'https://soon.deviloper.dev',
          status: 'coming-soon',
        }),
        makeApp({
          slug: 'draft-app',
          url: 'https://draft.deviloper.dev',
          status: 'draft',
        }),
        makeApp({
          slug: 'private-app',
          url: 'https://private.deviloper.dev',
          status: 'private',
        }),
      ])
    );
    const result = toPublicCatalog(catalog);
    expect(result.apps.map((app) => app.slug)).toEqual([
      'live-app',
      'beta-app',
      'soon-app',
    ]);
    expect(result.site).toEqual(catalog.site);
    expect(result.apps[0]).toEqual(catalog.apps[0]);
  });

  it('never leaks Verdict into the virtual module generated from the real catalog', () => {
    const moduleSource = renderCatalogModule(realYaml);
    expect(moduleSource.toLowerCase()).not.toContain('verdict');
    expect(moduleSource).not.toContain('"private"');
    expect(moduleSource).not.toContain('"draft"');
  });
});
