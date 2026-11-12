/**
 * Studio (PRD §5.8 R4): a dev-only admin page at `/__studio` plus JSON
 * endpoints under `/__studio/api/*` that call the add-app core and write
 * `src/data/catalog.yaml`.
 *
 * `apply: 'serve'` keeps it out of `vite build` entirely, and the UI lives in
 * `scripts/studio/ui/` (outside `src/`) so it can never be bundled.
 *
 * Security (it can write files):
 * - not mounted at all unless the dev server binds to loopback only;
 * - every request must carry a loopback `Host` (defeats DNS rebinding);
 * - every POST must carry a same-origin `Origin` and a JSON content type
 *   (defeats cross-site form posts and simple-request CSRF).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

import { parseCatalog } from '../../src/catalog/load';
import { STATUSES } from '../../src/catalog/schema';
import type { App, Status } from '../../src/catalog/schema';
import {
  CatalogEditError,
  PUBLIC_DESCRIPTION_MIN_WORDS,
  PUBLIC_LIST_MIN_ITEMS,
  TAGLINE_MAX,
  draftEntry,
  normaliseSubdomain,
  probe,
  publishGateErrors,
  readiness,
  reorderApps,
  setStatus,
  slugFromSub,
  todayIso,
  upsertApp,
} from '../catalog/core';
import type { FetchLike, ProbeResult, Readiness } from '../catalog/core';
import type { CaptureResult } from '../catalog/previews';

export const STUDIO_BASE = '/__studio';
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const MAX_BODY_BYTES = 1024 * 1024;
const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

export interface StudioOptions {
  /** catalog.yaml to read and write. Defaults to `src/data/catalog.yaml`. */
  file?: string;
  /** Directory holding `previews/`. Defaults to `public/`. */
  publicDir?: string;
  /** Injected for tests. */
  fetch?: FetchLike;
  capture?: (slug: string) => Promise<CaptureResult>;
  now?: () => Date;
}

type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void;

/** True when Vite's `server.host` binds to loopback only (the default). */
export function isLoopbackBinding(host: string | boolean | undefined): boolean {
  if (host === undefined || host === false) return true;
  if (host === true) return false;
  return LOOPBACK_HOSTNAMES.has(host);
}

/** Hostname part of a `Host` header (`localhost:3000` → `localhost`). */
export function hostnameOf(hostHeader: string | undefined): string | null {
  if (!hostHeader) return null;
  const m = /^(\[[^\]]+\]|[^:]+)(?::\d+)?$/.exec(
    hostHeader.trim().toLowerCase()
  );
  return m ? m[1] : null;
}

export function isLoopbackHost(hostHeader: string | undefined): boolean {
  const name = hostnameOf(hostHeader);
  return name !== null && LOOPBACK_HOSTNAMES.has(name);
}

export function isSameOrigin(
  origin: string | undefined,
  hostHeader: string | undefined
): boolean {
  if (!origin || !hostHeader) return false;
  try {
    const url = new URL(origin);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.host === hostHeader.toLowerCase()
    );
  } catch {
    return false;
  }
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors: string[] = [message]
  ) {
    super(message);
  }
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}

async function readJson(
  req: IncomingMessage
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf =
      typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer);
    size += buf.length;
    if (size > MAX_BODY_BYTES)
      throw new HttpError(413, 'Request body too large');
    chunks.push(buf);
  }
  try {
    const value: unknown = JSON.parse(
      Buffer.concat(chunks).toString('utf8') || '{}'
    );
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('not an object');
    return value as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'Body must be a JSON object');
  }
}

function stripHtml(p: ProbeResult): Omit<ProbeResult, 'html'> {
  const rest: Partial<ProbeResult> = { ...p };
  delete rest.html;
  return rest as Omit<ProbeResult, 'html'>;
}

interface CachedReadiness extends Readiness {
  probedAt: string;
}

/** The connect middleware behind `/__studio`. Exported for tests. */
export function createStudioHandler(options: StudioOptions = {}): Middleware {
  const file = options.file ?? resolve(ROOT, 'src/data/catalog.yaml');
  const publicDir = options.publicDir ?? resolve(ROOT, 'public');
  const cache = new Map<string, CachedReadiness>();
  const read = (): string => readFileSync(file, 'utf8');
  const capture =
    options.capture ??
    (async (slug: string) => {
      const { capturePreviews } = await import('../catalog/previews');
      return capturePreviews(slug, { catalogFile: file, publicDir });
    });

  async function runProbe(
    sub: string,
    app?: App
  ): Promise<{ result: ProbeResult; report: Readiness }> {
    const result = await probe(sub, {
      fetch: options.fetch,
      sitemapHint: app?.sitemap,
      now: options.now,
    });
    const report = readiness(result, { private: app?.status === 'private' });
    cache.set(slugFromSub(sub), { ...report, probedAt: result.probedAt });
    return { result, report };
  }

  const routes: Record<
    string,
    (body: Record<string, unknown>) => Promise<unknown>
  > = {
    'GET catalog': async () => {
      const { apps } = parseCatalog(read());
      return {
        file: relative(ROOT, file) || file,
        apps,
        readiness: Object.fromEntries(
          apps.map((a) => [a.slug, cache.get(a.slug) ?? null])
        ),
        gate: Object.fromEntries(
          apps.map((a) => [a.slug, publishGateErrors(a, 'live')])
        ),
        limits: {
          taglineMax: TAGLINE_MAX,
          descriptionMinWords: PUBLIC_DESCRIPTION_MIN_WORDS,
          listMinItems: PUBLIC_LIST_MIN_ITEMS,
        },
        statuses: STATUSES,
      };
    },
    'POST probe': async (body) => {
      let sub: string;
      try {
        sub = normaliseSubdomain(String(body.sub ?? ''));
      } catch (error) {
        throw new HttpError(400, (error as Error).message);
      }
      const { apps } = parseCatalog(read());
      const existing = apps.find(
        (a) => a.slug === slugFromSub(sub) || normaliseSubdomain(a.url) === sub
      );
      const { result, report } = await runProbe(sub, existing);
      return {
        sub,
        exists: existing?.slug ?? null,
        probe: stripHtml(result),
        readiness: report,
        draft: draftEntry(result, { today: todayIso(options.now?.()) }),
      };
    },
    'POST save': async (body) => {
      const app = body.app as App | undefined;
      if (!app || typeof app !== 'object' || typeof app.slug !== 'string') {
        throw new HttpError(400, 'Body must be { app: {...} }');
      }
      const next = upsertApp(read(), {
        ...app,
        updatedAt: todayIso(options.now?.()),
      });
      writeFileSync(file, next);
      return { ok: true, slug: app.slug };
    },
    'POST status': async (body) => {
      const slug = String(body.slug ?? '');
      const status = String(body.status ?? '') as Status;
      writeFileSync(file, setStatus(read(), slug, status));
      return { ok: true, slug, status };
    },
    'POST reorder': async (body) => {
      if (
        !Array.isArray(body.slugs) ||
        !body.slugs.every((s) => typeof s === 'string')
      ) {
        throw new HttpError(400, 'Body must be { slugs: string[] }');
      }
      writeFileSync(file, reorderApps(read(), body.slugs as string[]));
      return { ok: true };
    },
    'POST previews': async (body) => {
      const slug = String(body.slug ?? '');
      if (!parseCatalog(read()).apps.some((a) => a.slug === slug)) {
        throw new HttpError(404, `No app with slug "${slug}"; save it first`);
      }
      return capture(slug);
    },
  };

  return (req, res, next) => {
    const path = (req.url ?? '').split('?')[0];
    if (path !== STUDIO_BASE && !path.startsWith(`${STUDIO_BASE}/`)) {
      next();
      return;
    }
    if (!isLoopbackHost(req.headers.host)) {
      send(res, 403, { errors: ['Studio only answers on localhost'] });
      return;
    }
    const method = (req.method ?? 'GET').toUpperCase();

    if (path === STUDIO_BASE || path === `${STUDIO_BASE}/`) {
      if (method !== 'GET') {
        send(res, 405, { errors: ['Method not allowed'] });
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"
      );
      res.end(readFileSync(resolve(HERE, 'ui/index.html'), 'utf8'));
      return;
    }

    const name = path.slice(`${STUDIO_BASE}/api/`.length);
    const route = path.startsWith(`${STUDIO_BASE}/api/`)
      ? routes[`${method} ${name}`]
      : undefined;
    if (!route) {
      send(res, 404, { errors: [`No route ${method} ${path}`] });
      return;
    }
    if (method !== 'GET') {
      if (!isSameOrigin(req.headers.origin, req.headers.host)) {
        send(res, 403, { errors: ['Cross-origin requests are refused'] });
        return;
      }
      if (!/^application\/json\b/i.test(req.headers['content-type'] ?? '')) {
        send(res, 415, { errors: ['Content-Type must be application/json'] });
        return;
      }
    }

    (async () => {
      const body = method === 'GET' ? {} : await readJson(req);
      return route(body);
    })().then(
      (result) => send(res, 200, result),
      (error: unknown) => {
        if (error instanceof HttpError)
          send(res, error.status, { errors: error.errors });
        else if (error instanceof CatalogEditError)
          send(res, 422, { errors: error.issues });
        else
          send(res, 500, {
            errors: [error instanceof Error ? error.message : String(error)],
          });
      }
    );
  };
}

/** Registers `/__studio` on the dev server only. */
export function studioPlugin(options: StudioOptions = {}): Plugin {
  return {
    name: 'deviloper:studio',
    apply: 'serve',
    configureServer(server) {
      const host = server.config.server.host;
      if (!isLoopbackBinding(host)) {
        server.config.logger.warn(
          `[studio] disabled: the dev server is exposed on "${String(host)}". Run without --host to use /__studio.`
        );
        return;
      }
      server.middlewares.use(createStudioHandler(options));
    },
  };
}
