import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, 'tokens.css'), 'utf8');

const cases: Array<[string, string, string, string]> = [
  ['Inter Fallback', '--font-sans', "'Inter', 'Inter Fallback'", 'Arial'],
  [
    'Space Grotesk Fallback',
    '--font-display',
    "'Space Grotesk', 'Space Grotesk Fallback'",
    'Arial',
  ],
  [
    'JetBrains Mono Fallback',
    '--font-mono',
    "'JetBrains Mono', 'JetBrains Mono Fallback'",
    'Courier New',
  ],
];

describe('metric-matched fallback fonts', () => {
  it.each(cases)(
    '%s is defined and used in %s',
    (face, variable, stack, local) => {
      const block =
        new RegExp(`@font-face\\s*{[^}]*font-family:\\s*'${face}'[^}]*}`).exec(
          css
        )?.[0] ?? '';
      expect(block).toContain(`local('${local}')`);
      for (const prop of [
        'size-adjust',
        'ascent-override',
        'descent-override',
        'line-gap-override',
      ]) {
        expect(block).toContain(prop);
      }
      expect(css).toMatch(new RegExp(`${variable}:\\s*${stack}`));
    }
  );
});
