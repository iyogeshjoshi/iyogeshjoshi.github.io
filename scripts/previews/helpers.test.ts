// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  agnosticPath,
  applyPreviewFields,
  isThemeAgnostic,
  meanAbsDiff,
  isBlockedUrl,
  ogPath,
  previewPath,
  selectCapturable,
} from './helpers';

describe('isBlockedUrl', () => {
  it.each([
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
    'https://ad.doubleclick.net/x',
    'https://www.googletagmanager.com/gtag/js?id=G-1',
    'https://www.google-analytics.com/g/collect',
    'https://www.googleadservices.com/pagead',
    'https://adservice.google.com/x',
    'https://fundingchoicesmessages.google.com/i/pub',
    'https://x.adtrafficquality.google/ivt',
    'https://static.cloudflareinsights.com/beacon.min.js',
  ])('blocks %s', (url) => {
    expect(isBlockedUrl(url)).toBe(true);
  });

  it('allows app and font requests', () => {
    expect(isBlockedUrl('https://onlineruler.deviloper.dev/assets/a.js')).toBe(
      false
    );
    expect(isBlockedUrl('https://fonts.gstatic.com/s/inter.woff2')).toBe(false);
  });
});

describe('output naming', () => {
  it('names desktop, mobile and og files', () => {
    expect(previewPath('charcap', 'light')).toBe(
      '/previews/charcap-light.webp'
    );
    expect(previewPath('charcap', 'dark', 'mobile')).toBe(
      '/previews/charcap-dark-mobile.webp'
    );
    expect(ogPath('charcap')).toBe('/previews/charcap-og.png');
  });
});

describe('selectCapturable', () => {
  const apps = [
    { slug: 'a', status: 'live' as const },
    { slug: 'b', status: 'beta' as const },
    { slug: 'c', status: 'private' as const },
    { slug: 'd', status: 'draft' as const },
    { slug: 'e', status: 'coming-soon' as const },
  ];
  it('keeps only live and beta', () => {
    expect(selectCapturable(apps).map((a) => a.slug)).toEqual(['a', 'b']);
  });
  it('filters by slug but never admits private apps', () => {
    expect(selectCapturable(apps, ['b', 'c']).map((a) => a.slug)).toEqual([
      'b',
    ]);
  });
});

describe('applyPreviewFields', () => {
  const src = [
    '# keep me',
    'apps:',
    '  - slug: a',
    '    description: >-',
    '      folded',
    '      text',
    '    previewKind: ruler',
    '    sitemap: https://a.deviloper.dev/s.xml',
    '',
    '  - slug: b',
    '    previewKind: life',
    '',
  ].join('\n');

  it('inserts after previewKind, leaves others and comments alone', () => {
    const out = applyPreviewFields(src, ['a']);
    expect(out).toContain(
      '    previewKind: ruler\n    preview:\n      light: /previews/a-light.webp\n      dark: /previews/a-dark.webp\n      og: /previews/a-og.png\n    sitemap:'
    );
    expect(out).toContain('# keep me');
    expect(out).toContain('      folded\n      text');
    expect(out).not.toContain('b-light');
  });

  it('is idempotent', () => {
    const once = applyPreviewFields(src, ['a', 'b']);
    expect(applyPreviewFields(once, ['a', 'b'])).toBe(once);
  });
});

describe('theme dedupe', () => {
  const flat = (v: number) => new Uint8Array(64 * 40).fill(v);

  it('measures mean absolute difference', () => {
    expect(meanAbsDiff(flat(10), flat(10))).toBe(0);
    expect(meanAbsDiff(flat(0), flat(255))).toBe(255);
    expect(meanAbsDiff(flat(0), new Uint8Array(3))).toBe(Infinity);
  });

  it('treats near-identical images as theme-agnostic', () => {
    const a = flat(100);
    const b = flat(100);
    b[0] = 140; // single noisy pixel
    expect(isThemeAgnostic(a, b)).toBe(true);
  });

  it('treats light vs dark images as different', () => {
    expect(isThemeAgnostic(flat(245), flat(20))).toBe(false);
  });

  it('builds agnostic paths and yaml without dark', () => {
    expect(agnosticPath('x')).toBe('/previews/x.webp');
    expect(agnosticPath('x', 'mobile')).toBe('/previews/x-mobile.webp');
    const yaml = [
      '  - slug: x',
      '    previewKind: ruler',
      '    sitemap: s',
      '',
    ].join('\n');
    const out = applyPreviewFields(yaml, ['x'], new Set(['x']));
    expect(out).toContain('      light: /previews/x.webp');
    expect(out).not.toContain('dark:');
    expect(out).toContain('      og: /previews/x-og.png');
  });
});
