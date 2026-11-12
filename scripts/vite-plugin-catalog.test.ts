// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { stringify } from 'yaml';
import {
  catalogPlugin,
  DEFAULT_CATALOG_FILE,
  VIRTUAL_CATALOG_ID,
} from './vite-plugin-catalog';

const RESOLVED_ID = `\0${VIRTUAL_CATALOG_ID}`;
const tempDir = mkdtempSync(join(tmpdir(), 'catalog-plugin-'));

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

const words = (n: number): string =>
  Array.from({ length: n }, (_, i) => `word${i}`).join(' ');

function app(
  slug: string,
  status: string,
  description = words(160)
): Record<string, unknown> {
  return {
    slug,
    name: slug,
    url: `https://${slug}.deviloper.dev`,
    category: 'tool',
    status,
    tagline: 'Tagline',
    description,
    features: ['a', 'b', 'c'],
    howTo: ['a', 'b', 'c'],
    tags: ['t'],
    privacy: 'p',
    devices: ['desktop'],
    accent: '#ffffff',
    previewKind: 'generic',
  };
}

function writeCatalog(name: string, apps: Record<string, unknown>[]): string {
  const file = join(tempDir, name);
  writeFileSync(
    file,
    stringify({
      site: {
        name: 'deviloper.dev',
        tagline: 't',
        description: 'd',
        url: 'https://deviloper.dev',
        email: 'hello@deviloper.dev',
      },
      apps,
    })
  );
  return file;
}

/** Minimal Rollup plugin context: `error` throws like the real one does. */
function createContext() {
  return {
    addWatchFile: vi.fn(),
    error: vi.fn((message: string): never => {
      throw new Error(message);
    }),
  };
}

type Hook = (this: unknown, ...args: unknown[]) => unknown;

function callHook(
  plugin: ReturnType<typeof catalogPlugin>,
  name: 'resolveId' | 'load',
  ctx: unknown,
  id: string
) {
  const hook = plugin[name];
  const fn = (
    typeof hook === 'function' ? hook : (hook as { handler: Hook }).handler
  ) as Hook;
  return fn.call(ctx, id, undefined, {});
}

describe('catalogPlugin', () => {
  it('defaults to src/data/catalog.yaml', () => {
    expect(DEFAULT_CATALOG_FILE.replace(/\\/g, '/')).toMatch(
      /\/src\/data\/catalog\.yaml$/
    );
  });

  it('resolves only the virtual id', () => {
    const plugin = catalogPlugin();
    expect(
      callHook(plugin, 'resolveId', createContext(), VIRTUAL_CATALOG_ID)
    ).toBe(RESOLVED_ID);
    expect(
      callHook(plugin, 'resolveId', createContext(), './other')
    ).toBeNull();
  });

  it('ignores other modules on load', () => {
    expect(
      callHook(catalogPlugin(), 'load', createContext(), '/src/main.ts')
    ).toBeNull();
  });

  it('loads the public catalog as a default export and watches the file', () => {
    const file = writeCatalog('valid.yaml', [
      app('shown', 'live'),
      app('hidden-draft', 'draft', 'short'),
      app('hidden-private', 'private', 'short'),
    ]);
    const ctx = createContext();
    const code = callHook(
      catalogPlugin({ file }),
      'load',
      ctx,
      RESOLVED_ID
    ) as string;

    expect(ctx.addWatchFile).toHaveBeenCalledWith(file);
    expect(code.startsWith('export default ')).toBe(true);
    const data = JSON.parse(
      code.replace(/^export default /, '').replace(/;\s*$/, '')
    );
    expect(data.apps.map((a: { slug: string }) => a.slug)).toEqual(['shown']);
    expect(data.site.url).toBe('https://deviloper.dev');
    expect(code).not.toContain('hidden');
  });

  it('loads the real catalog without Verdict', () => {
    const code = callHook(
      catalogPlugin(),
      'load',
      createContext(),
      RESOLVED_ID
    ) as string;
    expect(code).toContain('online-ruler');
    expect(code.toLowerCase()).not.toContain('verdict');
  });

  it('fails the build with a readable message for invalid data', () => {
    const file = writeCatalog('invalid.yaml', [
      app('ok', 'live'),
      app('Bad Slug', 'live', 'too short'),
    ]);
    const ctx = createContext();
    expect(() =>
      callHook(catalogPlugin({ file }), 'load', ctx, RESOLVED_ID)
    ).toThrow(/apps\[1\]\.slug:/);
    const message = ctx.error.mock.calls[0][0];
    expect(message).toContain(file);
    expect(message).toContain(
      'apps[1].description: must be at least 150 words'
    );
  });

  it('fails the build for malformed YAML', () => {
    const file = join(tempDir, 'malformed.yaml');
    writeFileSync(file, 'site: [unclosed');
    expect(() =>
      callHook(catalogPlugin({ file }), 'load', createContext(), RESOLVED_ID)
    ).toThrow(/Invalid catalog YAML/);
  });

  it('fails the build when the file is missing', () => {
    const file = join(tempDir, 'missing.yaml');
    expect(() =>
      callHook(catalogPlugin({ file }), 'load', createContext(), RESOLVED_ID)
    ).toThrow(/Could not read catalog file/);
  });
});
