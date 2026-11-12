/**
 * Post-build guard for `dist/` (Phase 8 leak guard, PRD §5.6/§5.9).
 *
 *   tsx scripts/check-dist.ts
 *
 * Fails (exit 1) if any private/draft catalog entry leaks into the output, or
 * if a required page, ad or analytics tag is missing.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCatalog } from '../src/catalog/load';
import { isPublicStatus } from '../src/catalog/schema';
import type { Catalog } from '../src/catalog/schema';
import { DEFAULT_CATALOG_FILE } from './vite-plugin-catalog';

export const ADSENSE_CLIENT = 'ca-pub-5076417401305199';
export const ADS_TXT_PUBLISHER = 'pub-5076417401305199';
export const GA4_ID = 'G-PCZPZC1H5E';
export const CNAME_HOST = 'deviloper.dev';

export const TEXT_EXTENSIONS: ReadonlySet<string> = new Set([
  '.html',
  '.js',
  '.mjs',
  '.css',
  '.xml',
  '.json',
  '.txt',
  '.webmanifest',
  '.svg',
]);

/** Relative POSIX path → file text (text files) or `null` (binary, presence only). */
export type DistFiles = ReadonlyMap<string, string | null>;

interface LeakTerm {
  term: string;
  source: string;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function leakTerms(catalog: Catalog): LeakTerm[] {
  const terms: LeakTerm[] = [];
  for (const app of catalog.apps) {
    if (isPublicStatus(app.status)) continue;
    const source = `${app.slug} (${app.status})`;
    for (const term of [app.slug, app.name, hostOf(app.url)]) {
      if (term.trim()) terms.push({ term: term.toLowerCase(), source });
    }
  }
  return terms;
}

export function checkDist(files: DistFiles, catalog: Catalog): string[] {
  const problems: string[] = [];
  const terms = leakTerms(catalog);

  for (const [path, text] of files) {
    if (path.endsWith('.map')) problems.push(`source map shipped: ${path}`);
    if (text === null) continue;
    const lower = text.toLowerCase();
    for (const { term, source } of terms) {
      if (lower.includes(term)) {
        problems.push(
          `private entry ${source} leaked: "${term}" found in ${path}`
        );
      }
    }
    if (path.endsWith('.html')) {
      if (!text.includes(ADSENSE_CLIENT))
        problems.push(`${path}: missing AdSense client ${ADSENSE_CLIENT}`);
      if (!text.includes(GA4_ID))
        problems.push(`${path}: missing GA4 id ${GA4_ID}`);
      for (const match of text.matchAll(
        /<meta property="og:image" content="https:\/\/deviloper\.dev\/([^"?#]+)"/g
      )) {
        if (!files.has(match[1]))
          problems.push(`${path}: og:image /${match[1]} not found in dist/`);
      }
      if (
        text.includes('<!--app-head-->') ||
        text.includes('<!--app-html-->')
      ) {
        problems.push(`${path}: unfilled prerender placeholder`);
      }
    }
  }

  const required = [
    'index.html',
    '404.html',
    'sitemap.xml',
    'sitemap-main.xml',
    'robots.txt',
  ];
  for (const app of catalog.apps) {
    if (app.status === 'live' || app.status === 'beta')
      required.push(`apps/${app.slug}/index.html`);
  }
  for (const path of required) {
    if (!files.has(path)) problems.push(`missing required file: ${path}`);
  }

  const cname = files.get('CNAME');
  if (cname === undefined || cname === null) {
    problems.push('missing CNAME');
  } else if (cname.trim() !== CNAME_HOST) {
    problems.push(`CNAME is "${cname.trim()}", expected "${CNAME_HOST}"`);
  }

  const ads = files.get('ads.txt');
  if (ads === undefined || ads === null) {
    problems.push('missing ads.txt');
  } else if (!ads.includes(ADS_TXT_PUBLISHER)) {
    problems.push(`ads.txt does not contain ${ADS_TXT_PUBLISHER}`);
  }

  return problems;
}

function isText(path: string): boolean {
  return TEXT_EXTENSIONS.has(extname(path).toLowerCase()) || path === 'CNAME';
}

export function readDist(dir: string): Map<string, string | null> {
  const files = new Map<string, string | null>();
  const walk = (current: string): void => {
    for (const name of readdirSync(current)) {
      const full = resolve(current, name);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      const rel = relative(dir, full).split(sep).join('/');
      files.set(rel, isText(rel) ? readFileSync(full, 'utf8') : null);
    }
  };
  walk(dir);
  return files;
}

function main(): void {
  const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
  const catalog = parseCatalog(readFileSync(DEFAULT_CATALOG_FILE, 'utf8'));
  const files = readDist(dist);
  const problems = checkDist(files, catalog);
  if (problems.length > 0) {
    console.error(`check-dist: ${problems.length} problem(s) in dist/:`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  const scanned = [...files.values()].filter((v) => v !== null).length;
  console.log(
    `check-dist: OK (${files.size} files, ${scanned} text files scanned, ${leakTerms(catalog).length} private terms)`
  );
}

const isEntry =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntry) {
  try {
    main();
  } catch (error) {
    console.error(
      'check-dist failed:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}
