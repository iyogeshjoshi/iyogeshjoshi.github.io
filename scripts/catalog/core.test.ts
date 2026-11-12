// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseCatalog } from '../../src/catalog/load';
import type { App } from '../../src/catalog/schema';
import {
  ADSENSE_CLIENT,
  CatalogEditError,
  GA4_ID,
  USER_AGENT,
  detectCmp,
  draftEntry,
  extractMeta,
  normaliseSubdomain,
  probe,
  publishGateErrors,
  readiness,
  readinessMarkdown,
  reorderApps,
  setStatus,
  upsertApp,
} from './core';
import type { FetchLike, ProbeResult } from './core';

// ------------------------------------------------------------ fixtures

const words = (n: number): string =>
  Array.from({ length: n }, (_, i) => `word${i}`).join(' ');

/** Recorded-style homepage of a fully set-up subdomain. */
const READY_HTML = `<!doctype html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Example Tool &mdash; Does a Thing</title>
<meta content="Example Tool does a thing in your browser." name="description">
<meta property="og:image" content="/og-image.png">
<meta name="theme-color" content="#1a1a2e">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
</head><body><h1>Example</h1></body></html>`;

const BARE_HTML = `<!doctype html><html><head><title>Bare</title></head><body><canvas></canvas></body></html>`;

interface Route {
  status?: number;
  type?: string;
  body: string;
}

function mockFetch(
  routes: Record<string, Route>,
  seen: { url: string; ua?: string }[] = []
): FetchLike {
  return async (url, init) => {
    seen.push({ url, ua: init?.headers?.['user-agent'] });
    const route = routes[url] ?? {
      status: 404,
      type: 'text/plain',
      body: 'not found',
    };
    const status = route.status ?? 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      url,
      headers: {
        get: (n: string) =>
          n.toLowerCase() === 'content-type'
            ? (route.type ?? 'text/html')
            : null,
      },
      text: async () => route.body,
    };
  };
}

const CATALOG = `# top comment: must survive edits
site:
  name: deviloper.dev
  tagline: Side projects.
  description: >-
    A collection.
  url: https://deviloper.dev
  email: hello@deviloper.dev

apps:
  - slug: alpha
    name: Alpha
    url: https://alpha.deviloper.dev
    category: tool
    status: live
    tagline: Alpha does things.
    description: >-
      ${words(160)}
    features: [a, b, c]
    howTo: [a, b, c]
    tags: [x]
    privacy: Nothing leaves your browser.
    devices: [desktop]
    accent: '#2DD4BF'
    previewKind: generic
    preview:
      light: /previews/alpha-light.webp

  # comment about beta: travels with beta
  - slug: beta
    name: Beta
    url: https://beta.deviloper.dev
    category: game
    status: draft
    tagline: Beta is a game.
    description: Short is fine for drafts.
    features: []
    howTo: []
    tags: [y]
    privacy: Nothing.
    devices: [desktop]
    accent: '#F472B6'
    previewKind: generic
`;

function probeOf(over: Partial<ProbeResult> = {}): ProbeResult {
  return {
    sub: 'new-thing',
    url: 'https://new-thing.deviloper.dev',
    finalUrl: 'https://new-thing.deviloper.dev/',
    ok: true,
    status: 200,
    error: null,
    html: '',
    title: 'New Thing | Home',
    description: 'A new thing.',
    ogImage: null,
    themeColor: null,
    hasViewport: true,
    sitemap: {
      url: null,
      valid: false,
      detail: '/sitemap.xml returns HTTP 404',
    },
    adsense: false,
    ga4: false,
    cmpProxy: { detected: false, via: null },
    probedAt: '2026-11-12T00:00:00.000Z',
    ...over,
  };
}

// ------------------------------------------------------------ tests

describe('normaliseSubdomain', () => {
  it.each([
    ['my-app', 'my-app'],
    ['  My-App ', 'my-app'],
    ['my-app.deviloper.dev', 'my-app'],
    ['https://my-app.deviloper.dev/some/path?q=1', 'my-app'],
    ['http://onlineruler.deviloper.dev:443/', 'onlineruler'],
  ])('%s → %s', (input, expected) => {
    expect(normaliseSubdomain(input)).toBe(expected);
  });

  it.each([
    '',
    'deviloper.dev',
    '-bad',
    'bad-',
    'under_score',
    'a.b.deviloper.dev',
    'example.com',
  ])('rejects %j', (input) => {
    expect(() => normaliseSubdomain(input)).toThrow();
  });
});

describe('extractMeta / detectCmp', () => {
  it('reads title, description, OG image (absolute), theme-color and viewport', () => {
    const meta = extractMeta(READY_HTML, 'https://example.deviloper.dev/');
    expect(meta).toEqual({
      title: 'Example Tool — Does a Thing',
      description: 'Example Tool does a thing in your browser.',
      ogImage: 'https://example.deviloper.dev/og-image.png',
      themeColor: '#1a1a2e',
      hasViewport: true,
    });
  });

  it('labels the AdSense tag as a CMP proxy, and Funding Choices as a direct hit', () => {
    expect(detectCmp(READY_HTML)).toEqual({
      detected: true,
      via: 'adsense-tag',
    });
    expect(
      detectCmp(
        '<script src="https://fundingchoicesmessages.google.com/i/x"></script>'
      ).via
    ).toBe('fundingchoices');
    expect(detectCmp(BARE_HTML)).toEqual({ detected: false, via: null });
  });
});

describe('probe', () => {
  it('detects every signal on a ready site and a real sitemap from robots.txt', async () => {
    const seen: { url: string; ua?: string }[] = [];
    const fetch = mockFetch(
      {
        'https://ready.deviloper.dev/': { body: READY_HTML },
        'https://ready.deviloper.dev/robots.txt': {
          type: 'text/plain',
          body: 'User-agent: *\nSitemap: https://ready.deviloper.dev/sitemap-index.xml\n',
        },
        'https://ready.deviloper.dev/sitemap-index.xml': {
          type: 'application/xml',
          body: '<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>',
        },
      },
      seen
    );
    const p = await probe('ready', { fetch });
    expect(p).toMatchObject({
      ok: true,
      status: 200,
      title: 'Example Tool — Does a Thing',
      adsense: true,
      ga4: true,
      cmpProxy: { detected: true, via: 'adsense-tag' },
      sitemap: {
        url: 'https://ready.deviloper.dev/sitemap-index.xml',
        valid: true,
      },
    });
    expect(seen.every((s) => s.ua === USER_AGENT)).toBe(true);
    const r = readiness(p);
    expect(r.score).toBe(8);
    expect(r.checks.find((c) => c.id === 'cmp')).toMatchObject({
      level: 'warn',
    });
    expect(r.checks.find((c) => c.id === 'cmp')?.detail).toMatch(
      /Proxy: AdSense tag present/
    );
  });

  it('treats a 200 text/html sitemap as a soft 404', async () => {
    const fetch = mockFetch({
      'https://bare.deviloper.dev/': { body: BARE_HTML },
      'https://bare.deviloper.dev/sitemap-index.xml': { body: BARE_HTML },
      'https://bare.deviloper.dev/sitemap.xml': { body: BARE_HTML },
    });
    const p = await probe('bare', { fetch });
    expect(p.sitemap.valid).toBe(false);
    expect(p.sitemap.detail).toMatch(/soft 404/);
    // XML content type but no <urlset> is still not a sitemap.
    const p2 = await probe('bare', {
      fetch: mockFetch({
        'https://bare.deviloper.dev/': { body: BARE_HTML },
        'https://bare.deviloper.dev/sitemap.xml': {
          type: 'application/xml',
          body: '<foo/>',
        },
      }),
    });
    expect(p2.sitemap.valid).toBe(false);
  });

  it('reports unreachable sites without throwing', async () => {
    const fetch: FetchLike = async () => {
      throw Object.assign(new Error('fetch failed'), {
        cause: new Error('getaddrinfo ENOTFOUND'),
      });
    };
    const p = await probe('gone', { fetch });
    expect(p.ok).toBe(false);
    expect(p.error).toMatch(/ENOTFOUND/);
    expect(readiness(p).checks[0]).toMatchObject({
      id: 'https',
      level: 'fail',
    });
  });
});

describe('readiness', () => {
  it('returns 9 checks with pass/warn/fail levels', () => {
    const r = readiness(probeOf());
    expect(r.checks).toHaveLength(9);
    expect(r.total).toBe(9);
    const level = Object.fromEntries(r.checks.map((c) => [c.id, c.level]));
    expect(level).toEqual({
      https: 'pass',
      title: 'pass',
      viewport: 'pass',
      description: 'pass',
      ogImage: 'warn',
      sitemap: 'fail',
      adsense: 'fail',
      ga4: 'fail',
      cmp: 'fail',
    });
    expect(r.score).toBe(4);
    expect(readinessMarkdown(r)).toContain('| FAIL | AdSense tag |');
  });

  it('downgrades ad checks to warnings for private apps', () => {
    const r = readiness(probeOf(), { private: true });
    expect(
      r.checks
        .filter((c) => ['adsense', 'ga4', 'cmp'].includes(c.id))
        .map((c) => c.level)
    ).toEqual(['warn', 'warn', 'warn']);
  });
});

describe('draftEntry', () => {
  it('builds a schema-valid draft and only sets sitemap when it is real', () => {
    const app = draftEntry(probeOf(), {
      category: 'game',
      today: '2026-11-12',
    });
    expect(app).toMatchObject({
      slug: 'new-thing',
      name: 'New Thing',
      url: 'https://new-thing.deviloper.dev',
      category: 'game',
      status: 'draft',
      accent: '#2DD4BF',
      previewKind: 'generic',
      updatedAt: '2026-11-12',
      tags: ['game'],
    });
    expect(app.sitemap).toBeUndefined();
    expect(publishGateErrors(app)).toEqual([]);

    const withMap = draftEntry(
      probeOf({
        sitemap: {
          url: 'https://new-thing.deviloper.dev/sitemap.xml',
          valid: true,
          detail: '',
        },
      })
    );
    expect(withMap.sitemap).toBe('https://new-thing.deviloper.dev/sitemap.xml');
  });
});

describe('YAML edits', () => {
  const newApp = (over: Partial<App> = {}): App => ({
    ...draftEntry(probeOf(), { category: 'tool', today: '2026-11-12' }),
    ...over,
  });

  it('upsert appends a draft and preserves comments and other entries byte-for-byte', () => {
    const next = upsertApp(CATALOG, newApp());
    expect(next.startsWith(CATALOG.trimEnd())).toBe(true);
    expect(next).toContain('# top comment: must survive edits');
    expect(next).toContain('# comment about beta: travels with beta');
    expect(next).toContain('  - slug: new-thing\n    name: New Thing\n');
    expect(next).toContain('    tags: [tool]\n');
    expect(next.endsWith('\n')).toBe(true);
    expect(parseCatalog(next).apps.map((a) => a.slug)).toEqual([
      'alpha',
      'beta',
      'new-thing',
    ]);
  });

  it('upsert updates an existing slug in place', () => {
    const next = upsertApp(CATALOG, {
      ...parseCatalog(CATALOG).apps[1],
      tagline: 'Beta, updated.',
    });
    expect(parseCatalog(next).apps[1].tagline).toBe('Beta, updated.');
    expect(next).toContain('# comment about beta: travels with beta');
    expect(next.slice(0, next.indexOf('  # comment about beta'))).toBe(
      CATALOG.slice(0, CATALOG.indexOf('  # comment about beta'))
    );
  });

  it('refuses duplicate slugs (on insert) and duplicate URLs', () => {
    expect(() =>
      upsertApp(CATALOG, newApp({ slug: 'alpha' }), { allowUpdate: false })
    ).toThrow(/already in the catalog/);
    expect(() =>
      upsertApp(CATALOG, newApp({ url: 'https://alpha.deviloper.dev' }))
    ).toThrow(/already used by "alpha"/);
  });

  it('enforces the publish gate with readable errors', () => {
    let error: unknown;
    try {
      setStatus(CATALOG, 'beta', 'live');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(CatalogEditError);
    const issues = (error as CatalogEditError).issues;
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^beta: description: must be at least 150 words/),
        expect.stringMatching(/^beta: features: needs at least 3 items/),
        expect.stringMatching(/^beta: preview: capture at least one preview/),
      ])
    );
    expect(() =>
      upsertApp(CATALOG, newApp({ status: 'live', tagline: 'x'.repeat(91) }))
    ).toThrow(/tagline: must be at most 90 characters/);
  });

  it('setStatus rewrites only the status scalar', () => {
    const next = setStatus(CATALOG, 'alpha', 'private');
    const diff = next
      .split('\n')
      .filter((line, i) => line !== CATALOG.split('\n')[i]);
    expect(diff).toEqual(['    status: private']);
    expect(() => setStatus(CATALOG, 'nope', 'draft')).toThrow(
      /No app with slug/
    );
  });

  it('reorders entries, keeps comments with their entry and round-trips exactly', () => {
    const swapped = reorderApps(CATALOG, ['beta', 'alpha']);
    expect(parseCatalog(swapped).apps.map((a) => a.slug)).toEqual([
      'beta',
      'alpha',
    ]);
    expect(swapped.indexOf('# comment about beta')).toBeLessThan(
      swapped.indexOf('- slug: beta')
    );
    expect(swapped.indexOf('- slug: beta')).toBeLessThan(
      swapped.indexOf('- slug: alpha')
    );
    expect(reorderApps(swapped, ['alpha', 'beta'])).toBe(CATALOG);
    expect(() => reorderApps(CATALOG, ['alpha'])).toThrow(/missing "beta"/);
    expect(() => reorderApps(CATALOG, ['alpha', 'beta', 'zeta'])).toThrow(
      /unknown slug "zeta"/
    );
  });

  it('round-trips the real catalog unchanged through reorder', () => {
    const real = readFileSync(
      resolve(__dirname, '../../src/data/catalog.yaml'),
      'utf8'
    );
    const slugs = parseCatalog(real).apps.map((a) => a.slug);
    expect(reorderApps(real, slugs)).toBe(real);
  });
});
