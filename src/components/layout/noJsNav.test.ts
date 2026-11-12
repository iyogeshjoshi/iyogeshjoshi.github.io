// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');

describe('no-JS phone nav', () => {
  it('the inline head script marks <html data-js>', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8');
    expect(html).toContain("d.setAttribute('data-js', '');");
  });

  it('without data-js the menu button is hidden and links shown inline', () => {
    const css = readFileSync(resolve(__dirname, 'Header.module.css'), 'utf8');
    expect(css).toMatch(
      /:global\(html:not\(\[data-js\]\)\) \.menuButton \{\s*display: none;/
    );
    expect(css).toMatch(
      /:global\(html:not\(\[data-js\]\)\) \.list \{\s*display: flex;\s*flex-wrap: wrap;/
    );
  });
});
