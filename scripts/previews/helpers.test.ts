// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  applyPreviewFields,
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
