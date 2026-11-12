import { readFileSync } from 'node:fs';
import { resolve as pathResolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(pathResolve(__dirname, 'tokens.css'), 'utf8');

const block = (selector: string): Record<string, string> => {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`Missing block ${selector}`);
  const body = css.slice(start, css.indexOf('}', start));
  const vars: Record<string, string> = {};
  for (const m of body.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6});/gi)) vars[m[1]] = m[2];
  return vars;
};

const lum = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const ratio = (a: string, b: string): number => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const themes: Record<string, Record<string, string>> = {
  dark: block(":root,\n:root[data-theme='dark']"),
  light: block(":root[data-theme='light']"),
  'light (no-JS fallback)': block(':root:not([data-theme])'),
};

describe('WCAG AA contrast (>= 4.5)', () => {
  for (const [name, c] of Object.entries(themes)) {
    const pairs: Array<[string, string, string]> = [
      ['text', 'bg', ''],
      ['text', 'surface', ''],
      ['muted', 'bg', ''],
      ['muted', 'surface', ''],
      ['accent-text', 'bg', ''],
      ['accent-text', 'surface', ''],
      ['on-accent', 'accent', ''],
      ['live', 'chip-bg', ''],
      ['warn', 'chip-bg', ''],
    ];
    for (const [fg, bg] of pairs) {
      it(`${name}: ${fg} on ${bg}`, () => {
        expect(c[fg], `${fg} defined`).toBeDefined();
        expect(ratio(c[fg], c[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('no-JS light fallback matches the light theme', () => {
    expect(themes['light (no-JS fallback)']).toEqual(themes.light);
  });
});
