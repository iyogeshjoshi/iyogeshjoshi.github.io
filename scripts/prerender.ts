/**
 * Prerender every route into `dist/` and generate the sitemaps (Phase 8).
 *
 * Run after both builds:
 *   vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr
 *   tsx scripts/prerender.ts
 *
 * Exits non-zero on any error so CI never deploys a half-rendered site.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SITE_ORIGIN = 'https://deviloper.dev';
export const HEAD_PLACEHOLDER = '<!--app-head-->';
export const HTML_PLACEHOLDER = '<!--app-html-->';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const DIST_SSR = resolve(ROOT, 'dist-ssr');
const SERVER_ENTRY = resolve(DIST_SSR, 'entry-server.mjs');

/** Minimal shapes of the server bundle's exports (kept local: no JSX/DOM types here). */
interface ServerRoute {
  path: string;
  meta: { noindex?: boolean };
  app?: { updatedAt?: string };
}

interface ServerApp {
  slug: string;
  status: string;
  sitemap?: string;
}

interface ServerModule {
  render: (path: string) => { html: string; head: string; status: number };
  routes: readonly ServerRoute[];
  apps: readonly ServerApp[];
}

export interface SitemapEntry {
  path: string;
  noindex?: boolean;
  /** `YYYY-MM-DD`; falls back to the build date. */
  lastmod?: string;
}

const XML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => XML_ESCAPES[ch]);
}

/** `/` → `index.html`, `/apps/x/` → `apps/x/index.html`, `/terms.html` → `terms.html`. */
export function outputFileFor(path: string): string {
  if (!path.startsWith('/'))
    throw new Error(`Route path must start with "/": ${path}`);
  const rel = path.slice(1);
  if (rel === '' || rel.endsWith('/')) return `${rel}index.html`;
  if (rel.endsWith('.html')) return rel;
  throw new Error(`Route path must end with "/" or ".html": ${path}`);
}

export function fillTemplate(
  template: string,
  head: string,
  html: string
): string {
  for (const marker of [HEAD_PLACEHOLDER, HTML_PLACEHOLDER]) {
    const count = template.split(marker).length - 1;
    if (count !== 1) {
      throw new Error(
        `Template must contain ${marker} exactly once (found ${count})`
      );
    }
  }
  // Function replacers: `$&`-style patterns in page content must stay literal.
  return template
    .replace(HEAD_PLACEHOLDER, () => head)
    .replace(HTML_PLACEHOLDER, () => html);
}

export function buildSitemapMain(
  entries: readonly SitemapEntry[],
  buildDate: string
): string {
  const urls = entries
    .filter((entry) => !entry.noindex)
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeXml(`${SITE_ORIGIN}${entry.path}`)}</loc>\n    <lastmod>${entry.lastmod ?? buildDate}</lastmod>\n  </url>`
    );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

/**
 * Sitemap index. Only our own sitemap gets `lastmod` (we just built it); the
 * subdomain sitemaps change on their own schedule, so we don't guess.
 */
export function buildSitemapIndex(
  sitemapUrls: readonly string[],
  buildDate: string
): string {
  const own = `${SITE_ORIGIN}/sitemap-main.xml`;
  const unique = Array.from(new Set(sitemapUrls));
  const items = unique.map((url) => {
    const lastmod = url === own ? `\n    <lastmod>${buildDate}</lastmod>` : '';
    return `  <sitemap>\n    <loc>${escapeXml(url)}</loc>${lastmod}\n  </sitemap>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>\n`;
}

const PUBLIC_STATUSES = new Set(['live', 'beta', 'coming-soon']);

/** Root sitemap first, then each public subdomain that serves a real sitemap. */
export function sitemapIndexUrls(apps: readonly ServerApp[]): string[] {
  return [
    `${SITE_ORIGIN}/sitemap-main.xml`,
    ...apps
      .filter((app) => PUBLIC_STATUSES.has(app.status) && app.sitemap)
      .map((app) => app.sitemap as string),
  ];
}

export function sitemapEntries(routes: readonly ServerRoute[]): SitemapEntry[] {
  return routes.map((route) => ({
    path: route.path,
    noindex: route.meta.noindex,
    lastmod: route.app?.updatedAt,
  }));
}

function writeOut(rel: string, content: string): void {
  const file = resolve(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

async function main(): Promise<void> {
  const templateFile = resolve(DIST, 'index.html');
  if (!existsSync(templateFile))
    throw new Error(`Missing ${templateFile}: run "vite build" first`);
  if (!existsSync(SERVER_ENTRY)) {
    throw new Error(
      `Missing ${SERVER_ENTRY}: run "vite build --ssr src/entry-server.tsx --outDir dist-ssr" first`
    );
  }

  const template = readFileSync(templateFile, 'utf8');
  const server = (await import(
    pathToFileURL(SERVER_ENTRY).href
  )) as ServerModule;
  const buildDate = new Date().toISOString().slice(0, 10);

  const seen = new Set<string>();
  for (const route of server.routes) {
    const rel = outputFileFor(route.path);
    if (seen.has(rel)) throw new Error(`Two routes write ${rel}`);
    seen.add(rel);

    const { html, head, status } = server.render(route.path);
    if (!html.trim())
      throw new Error(`Route ${route.path} rendered empty markup`);
    writeOut(rel, fillTemplate(template, head, html));
    console.log(`  ${status} ${route.path} -> dist/${rel}`);
  }

  writeOut(
    'sitemap-main.xml',
    buildSitemapMain(sitemapEntries(server.routes), buildDate)
  );
  writeOut(
    'sitemap.xml',
    buildSitemapIndex(sitemapIndexUrls(server.apps), buildDate)
  );
  console.log(
    `Prerendered ${seen.size} pages, wrote sitemap.xml and sitemap-main.xml`
  );

  rmSync(DIST_SSR, { recursive: true, force: true });
}

const isEntry =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntry) {
  main().catch((error: unknown) => {
    console.error(
      'prerender failed:',
      error instanceof Error ? (error.stack ?? error.message) : error
    );
    process.exit(1);
  });
}
