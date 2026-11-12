import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const count = (needle: string): number => html.split(needle).length - 1;

describe('index.html consent mode', () => {
  it('sets consent defaults before gtag.js and adsbygoogle.js', () => {
    const consent = html.indexOf("gtag('consent', 'default'");
    expect(consent).toBeGreaterThan(-1);
    expect(consent).toBeLessThan(
      html.indexOf('src="https://www.googletagmanager.com/gtag/js')
    );
    expect(consent).toBeLessThan(
      html.indexOf('src="https://pagead2.googlesyndication.com')
    );
  });

  it('denies by default in EEA, UK and Switzerland', () => {
    const m = /region: \[([^\]]+)\]/.exec(html);
    expect(m).not.toBeNull();
    const codes = (m?.[1] ?? '').match(/[A-Z]{2}/g) ?? [];
    for (const c of ['GB', 'CH', 'DE', 'FR']) expect(codes).toContain(c);
    expect(html).toContain("ad_user_data: 'denied'");
    expect(html).toContain("gtag('set', 'ads_data_redaction', true)");
  });

  it('keeps the ids exactly where expected', () => {
    expect(count('id=G-PCZPZC1H5E')).toBe(1);
    expect(count("gtag('config', 'G-PCZPZC1H5E')")).toBe(1);
    expect(count('client=ca-pub-5076417401305199')).toBe(1);
    expect(count('content="ca-pub-5076417401305199"')).toBe(1);
  });
});

describe('index.html font loading', () => {
  const link =
    /<link[^>]*rel="preload"[^>]*as="style"[^>]*fonts\.googleapis\.com[^>]*>/.exec(
      html
    )?.[0] ?? '';

  it('loads the Google Fonts stylesheet non-blocking', () => {
    expect(link).not.toBe('');
    expect(link).toContain('onload="this.onload=null;this.rel=\'stylesheet\'"');
    expect(html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '')).not.toMatch(
      /<link\s+rel="stylesheet"\s+href="https:\/\/fonts\.googleapis/
    );
  });

  it('has a noscript stylesheet fallback', () => {
    expect(html).toMatch(
      /<noscript>\s*<link\s+rel="stylesheet"\s+href="https:\/\/fonts\.googleapis\.com[^"]+"\s*\/>\s*<\/noscript>/
    );
  });

  it('keeps ordering: theme script, then fonts, then consent, then ad/gtag tags', () => {
    const theme = html.indexOf("setAttribute('data-theme'");
    const fonts = html.indexOf('rel="preload"');
    const consent = html.indexOf("gtag('consent', 'default'");
    expect(theme).toBeGreaterThan(-1);
    expect(theme).toBeLessThan(fonts);
    expect(fonts).toBeLessThan(consent);
    expect(consent).toBeLessThan(
      html.indexOf('src="https://www.googletagmanager.com/gtag/js')
    );
    expect(consent).toBeLessThan(
      html.indexOf('src="https://pagead2.googlesyndication.com')
    );
  });
});
