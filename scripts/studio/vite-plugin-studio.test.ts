// @vitest-environment node
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer, request } from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';

import { parseCatalog } from '../../src/catalog/load';
import type { FetchLike } from '../catalog/core';
import {
  STUDIO_BASE,
  createStudioHandler,
  isLoopbackBinding,
  isLoopbackHost,
  isSameOrigin,
  studioPlugin,
} from './vite-plugin-studio';

const ROOT = resolve(__dirname, '../..');
const words = (n: number): string =>
  Array.from({ length: n }, (_, i) => `w${i}`).join(' ');

const CATALOG = `# keep me
site:
  name: deviloper.dev
  tagline: Side projects.
  description: A collection.
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

  - slug: beta
    name: Beta
    url: https://beta.deviloper.dev
    category: game
    status: draft
    tagline: Beta is a game.
    description: Short.
    features: []
    howTo: []
    tags: [y]
    privacy: Nothing.
    devices: [desktop]
    accent: '#F472B6'
    previewKind: generic
`;

const fakeFetch: FetchLike = async (url) => {
  const home = url.endsWith('.deviloper.dev/');
  return {
    ok: home,
    status: home ? 200 : 404,
    url,
    headers: { get: () => 'text/html' },
    text: async () =>
      home
        ? '<html><head><title>Gamma — Home</title><meta name="viewport" content="width=device-width"></head></html>'
        : '',
  };
};

const dir = mkdtempSync(join(tmpdir(), 'studio-'));
const file = join(dir, 'catalog.yaml');
let server: Server;
let port = 0;
const captured: string[] = [];

beforeAll(async () => {
  const handler = createStudioHandler({
    file,
    fetch: fakeFetch,
    capture: async (slug) => {
      captured.push(slug);
      return { slug, written: [], failures: [], updatedYaml: false };
    },
    now: () => new Date('2026-11-12T10:00:00Z'),
  });
  server = createServer((req, res) =>
    handler(req, res, () => {
      res.statusCode = 404;
      res.end('next');
    })
  );
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  port = (server.address() as AddressInfo).port;
});

beforeEach(() => writeFileSync(file, CATALOG));

afterAll(() => {
  server.close();
  rmSync(dir, { recursive: true, force: true });
});

interface Reply {
  status: number;
  body: string;
  json: () => any;
}

function call(
  method: string,
  path: string,
  {
    body,
    headers = {},
  }: { body?: unknown; headers?: Record<string, string> } = {}
): Promise<Reply> {
  const payload = body === undefined ? undefined : JSON.stringify(body);
  const host = headers.host ?? `localhost:${port}`;
  const defaults: Record<string, string> =
    method === 'POST'
      ? { origin: `http://${host}`, 'content-type': 'application/json' }
      : {};
  return new Promise((done, fail) => {
    const req = request(
      {
        host: '127.0.0.1',
        port,
        method,
        path,
        headers: { ...defaults, ...headers, host },
      },
      (res) => {
        let text = '';
        res.on('data', (c) => (text += c));
        res.on('end', () =>
          done({
            status: res.statusCode ?? 0,
            body: text,
            json: () => JSON.parse(text),
          })
        );
      }
    );
    req.on('error', fail);
    if (payload) req.write(payload);
    req.end();
  });
}

describe('studioPlugin', () => {
  it('only applies to the dev server, never to `vite build`', () => {
    const plugin = studioPlugin();
    expect(plugin.apply).toBe('serve');
    expect(plugin.name).toBe('deviloper:studio');
  });

  it('is not part of the resolved build config', async () => {
    const { resolveConfig } = await import('vite');
    const config = await resolveConfig(
      {
        root: ROOT,
        configFile: resolve(ROOT, 'vite.config.ts'),
        logLevel: 'silent',
      },
      'build',
      'production',
      'production'
    );
    const names = config.plugins.map((p) => p.name);
    expect(names).toContain('deviloper:catalog');
    expect(names).not.toContain('deviloper:studio');
  }, 30_000);

  it('dist/ (when present) contains no Studio code', () => {
    const dist = resolve(ROOT, 'dist');
    if (!existsSync(dist)) return;
    const hits: string[] = [];
    const walk = (d: string): void => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        if (name.includes('__studio')) hits.push(p);
        if (statSync(p).isDirectory()) walk(p);
        else if (
          /\.(html|js|mjs|css|json|xml|txt)$/.test(name) &&
          readFileSync(p, 'utf8').includes('__studio')
        ) {
          hits.push(p);
        }
      }
    };
    walk(dist);
    expect(hits).toEqual([]);
  });

  it('decides loopback binding and hosts correctly', () => {
    expect(isLoopbackBinding(undefined)).toBe(true);
    expect(isLoopbackBinding('localhost')).toBe(true);
    expect(isLoopbackBinding('127.0.0.1')).toBe(true);
    expect(isLoopbackBinding(true)).toBe(false);
    expect(isLoopbackBinding('0.0.0.0')).toBe(false);
    expect(isLoopbackHost('localhost:3000')).toBe(true);
    expect(isLoopbackHost('[::1]:3000')).toBe(true);
    expect(isLoopbackHost('evil.example:3000')).toBe(false);
    expect(isLoopbackHost('localhost.evil.example')).toBe(false);
    expect(isSameOrigin('http://localhost:3000', 'localhost:3000')).toBe(true);
    expect(isSameOrigin('http://evil.example', 'localhost:3000')).toBe(false);
    expect(isSameOrigin(undefined, 'localhost:3000')).toBe(false);
  });
});

describe('Studio API', () => {
  it('passes non-Studio requests through', async () => {
    expect((await call('GET', '/')).body).toBe('next');
  });

  it('serves the UI page on localhost', async () => {
    const res = await call('GET', STUDIO_BASE);
    expect(res.status).toBe(200);
    expect(res.body).toContain('LOCAL DEV ONLY');
  });

  it('rejects a non-localhost Host (DNS rebinding)', async () => {
    const res = await call('GET', `${STUDIO_BASE}/api/catalog`, {
      headers: { host: 'evil.example:3000' },
    });
    expect(res.status).toBe(403);
    const page = await call('GET', STUDIO_BASE, {
      headers: { host: 'evil.example' },
    });
    expect(page.status).toBe(403);
  });

  it('rejects cross-origin or origin-less POSTs and non-JSON bodies', async () => {
    const body = { slug: 'beta', status: 'private' };
    const cross = await call('POST', `${STUDIO_BASE}/api/status`, {
      body,
      headers: { origin: 'http://evil.example' },
    });
    expect(cross.status).toBe(403);
    const form = await call('POST', `${STUDIO_BASE}/api/status`, {
      body,
      headers: { 'content-type': 'text/plain' },
    });
    expect(form.status).toBe(415);
    expect(readFileSync(file, 'utf8')).toBe(CATALOG);
  });

  it('GET catalog lists every entry, including drafts', async () => {
    const res = await call('GET', `${STUDIO_BASE}/api/catalog`);
    expect(res.status).toBe(200);
    const data = res.json();
    expect(data.apps.map((a: { slug: string }) => a.slug)).toEqual([
      'alpha',
      'beta',
    ]);
    expect(data.gate.alpha).toEqual([]);
    expect(data.gate.beta.length).toBeGreaterThan(0);
    expect(data.limits.taglineMax).toBe(90);
  });

  it('probe → save writes a draft to the injected file and keeps comments', async () => {
    const probed = (
      await call('POST', `${STUDIO_BASE}/api/probe`, { body: { sub: 'gamma' } })
    ).json();
    expect(probed.exists).toBeNull();
    expect(probed.readiness.checks).toHaveLength(9);
    expect(probed.draft).toMatchObject({
      slug: 'gamma',
      name: 'Gamma',
      status: 'draft',
    });
    expect(probed.probe.html).toBeUndefined();

    const saved = await call('POST', `${STUDIO_BASE}/api/save`, {
      body: { app: { ...probed.draft, category: 'game' } },
    });
    expect(saved.status).toBe(200);
    const text = readFileSync(file, 'utf8');
    expect(text.startsWith('# keep me')).toBe(true);
    const gamma = parseCatalog(text).apps.find((a) => a.slug === 'gamma');
    expect(gamma).toMatchObject({
      category: 'game',
      status: 'draft',
      updatedAt: '2026-11-12',
    });
  });

  it('returns readable gate errors (422) and leaves the file alone', async () => {
    const res = await call('POST', `${STUDIO_BASE}/api/status`, {
      body: { slug: 'beta', status: 'live' },
    });
    expect(res.status).toBe(422);
    expect(res.json().errors.join('\n')).toMatch(
      /beta: description: must be at least 150 words/
    );
    expect(readFileSync(file, 'utf8')).toBe(CATALOG);
  });

  it('status, reorder and previews endpoints work', async () => {
    expect(
      (
        await call('POST', `${STUDIO_BASE}/api/status`, {
          body: { slug: 'beta', status: 'private' },
        })
      ).status
    ).toBe(200);
    expect(
      (
        await call('POST', `${STUDIO_BASE}/api/reorder`, {
          body: { slugs: ['beta', 'alpha'] },
        })
      ).status
    ).toBe(200);
    const apps = parseCatalog(readFileSync(file, 'utf8')).apps;
    expect(apps.map((a) => [a.slug, a.status])).toEqual([
      ['beta', 'private'],
      ['alpha', 'live'],
    ]);
    expect(
      (
        await call('POST', `${STUDIO_BASE}/api/previews`, {
          body: { slug: 'alpha' },
        })
      ).status
    ).toBe(200);
    expect(captured).toContain('alpha');
    expect(
      (
        await call('POST', `${STUDIO_BASE}/api/previews`, {
          body: { slug: 'nope' },
        })
      ).status
    ).toBe(404);
  });
});

describe('workflows', () => {
  const load = (name: string): any =>
    parseYaml(readFileSync(resolve(ROOT, '.github/workflows', name), 'utf8'));

  it('add-app.yml is a manual workflow that opens a PR and never deploys', () => {
    const wf = load('add-app.yml');
    const inputs = wf.on.workflow_dispatch.inputs;
    expect(inputs.subdomain.required).toBe(true);
    expect(inputs.category.type).toBe('choice');
    expect(inputs.category.options).toEqual([
      'tool',
      'game',
      'simulation',
      'app',
    ]);
    expect(inputs.capture_previews).toMatchObject({
      type: 'boolean',
      default: true,
    });
    expect(wf.permissions).toEqual({
      contents: 'write',
      'pull-requests': 'write',
    });
    const steps = Object.values(wf.jobs).flatMap((job: any) => job.steps);
    const uses = steps.map((s: any) => s.uses).filter(Boolean);
    expect(uses).toContain('peter-evans/create-pull-request@v6');
    expect(
      uses.some((u: string) => /deploy-pages|upload-pages-artifact/.test(u))
    ).toBe(false);
    const runs = steps.map((s: any) => s.run ?? '').join('\n');
    expect(runs).toContain('--yes');
    expect(runs).toContain('npm test');
    expect(runs).toContain('npm run build');
  });

  it('health-check.yml runs weekly and on dispatch, reporting through one issue', () => {
    const wf = load('health-check.yml');
    expect(wf.on.schedule[0].cron).toMatch(/^\S+ \S+ \* \* \d$/);
    expect(wf.on).toHaveProperty('workflow_dispatch');
    expect(wf.permissions.issues).toBe('write');
    const steps = Object.values(wf.jobs).flatMap((job: any) => job.steps);
    expect(steps.map((s: any) => s.uses).filter(Boolean)).toContain(
      'actions/github-script@v7'
    );
    expect(steps.map((s: any) => s.run ?? '').join('\n')).toMatch(
      /cli\.ts check --json/
    );
  });
});
