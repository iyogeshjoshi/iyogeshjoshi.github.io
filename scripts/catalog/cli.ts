/**
 * Catalog CLI (PRD §5.8 R3).
 *
 *   npm run catalog:add -- <sub> [--category tool|game|simulation|app] [--name ..]
 *                          [--tagline ..] [--no-previews] [--yes] [--json]
 *                          [--report-md <file>] [--file <catalog.yaml>]
 *   npm run catalog:check [-- --json] [--file <catalog.yaml>]
 *
 * `add` prompts for missing fields when stdin is a TTY and `--yes` is absent.
 * `check` always exits 0: it is a report, not a gate.
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { parseCatalog } from '../../src/catalog/load';
import type { App, Category } from '../../src/catalog/schema';
import {
  CATEGORIES,
  CatalogEditError,
  TAGLINE_MAX,
  draftEntry,
  normaliseSubdomain,
  probe,
  readiness,
  readinessMarkdown,
  slugFromSub,
  subdomainUrl,
  upsertApp,
} from './core';
import type { Check, Readiness } from './core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_FILE = resolve(ROOT, 'src/data/catalog.yaml');
const PUBLIC_DIR = resolve(ROOT, 'public');

interface Args {
  positional: string[];
  flags: Map<string, string | true>;
}

export function parseArgs(argv: readonly string[]): Args {
  const positional: string[] = [];
  const flags = new Map<string, string | true>();
  const valued = new Set(['category', 'name', 'tagline', 'file', 'report-md']);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const [key, inline] = arg.slice(2).split(/=(.*)/s, 2);
    if (inline !== undefined) flags.set(key, inline);
    else if (valued.has(key) && i + 1 < argv.length) flags.set(key, argv[++i]);
    else flags.set(key, true);
  }
  return { positional, flags };
}

function flag(args: Args, key: string): string | undefined {
  const value = args.flags.get(key);
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined;
}

const SYMBOL: Record<Check['level'], string> = {
  pass: 'PASS',
  warn: 'WARN',
  fail: 'FAIL',
};

function printReadiness(r: Readiness): void {
  console.log(`Readiness: ${r.score}/${r.total} passing`);
  for (const c of r.checks) {
    console.log(`  ${SYMBOL[c.level]}  ${c.label.padEnd(20)} ${c.detail}`);
  }
  console.log('  (Warnings never block listing; only the publish gate does.)');
}

function setActionOutput(values: Record<string, string>): void {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  appendFileSync(
    file,
    Object.entries(values)
      .map(([k, v]) => `${k}=${v}\n`)
      .join('')
  );
}

async function ask(
  question: string,
  fallback?: string
): Promise<string | undefined> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (
      await rl.question(`${question}${fallback ? ` [${fallback}]` : ''}: `)
    ).trim();
    return answer || fallback;
  } finally {
    rl.close();
  }
}

export function prBody(app: App, r: Readiness, previews: string): string {
  return [
    `Adds **${app.name}** (${app.url}) to the catalog as \`status: draft\`.`,
    '',
    readinessMarkdown(r),
    '',
    'Warnings and failures above never block listing (PRD R6). Ads only run on the subdomain once its own tags are fixed, and the sitemap index skips it until it serves a real sitemap.',
    '',
    `Previews: ${previews}`,
    '',
    '### Before publishing',
    '',
    `- [ ] Write an original description of 150+ words (\`apps/${app.slug}.description\`)`,
    `- [ ] Check the tagline (at most ${TAGLINE_MAX} characters), category and tags`,
    '- [ ] Add at least 3 features and 3 howTo steps',
    '- [ ] Fill in `privacy` and `devices`',
    '- [ ] Previews captured (`npm run previews` or Studio)',
    '- [ ] Set `status: live` (or `beta` / `coming-soon`)',
    '',
    'This PR does not deploy. Merging to `master` does.',
  ].join('\n');
}

async function add(args: Args): Promise<number> {
  const file = flag(args, 'file')
    ? resolve(flag(args, 'file') as string)
    : DEFAULT_FILE;
  const json = args.flags.has('json');
  const interactive = process.stdin.isTTY && !args.flags.has('yes') && !json;
  const raw =
    args.positional[0] ?? (interactive ? await ask('Subdomain') : undefined);
  if (!raw) {
    console.error(
      'Usage: npm run catalog:add -- <subdomain> [--category tool] [--yes]'
    );
    return 1;
  }
  const sub = normaliseSubdomain(raw);
  const slug = slugFromSub(sub);
  const yamlText = readFileSync(file, 'utf8');
  const existing = parseCatalog(yamlText).apps.find(
    (a) => a.slug === slug || a.url.replace(/\/$/, '') === subdomainUrl(sub)
  );
  if (existing) {
    console.error(
      `"${sub}" is already in the catalog as "${existing.slug}". Edit it instead.`
    );
    return 1;
  }

  const log = json ? () => undefined : console.log;
  log(`Probing ${subdomainUrl(sub)} …`);
  const result = await probe(sub);
  const report = readiness(result);
  if (!json) printReadiness(report);
  if (result.error || !result.ok) {
    log('Warning: the site is not reachable; drafting the entry anyway.');
  }

  let category = flag(args, 'category') as Category | undefined;
  if (category && !CATEGORIES.includes(category)) {
    console.error(`--category must be one of ${CATEGORIES.join(', ')}`);
    return 1;
  }
  let name = flag(args, 'name');
  let tagline = flag(args, 'tagline');
  const prefilled = draftEntry(result);
  if (interactive) {
    while (!category) {
      const answer = await ask(`Category (${CATEGORIES.join('/')})`, 'app');
      if (answer && (CATEGORIES as readonly string[]).includes(answer))
        category = answer as Category;
    }
    name ??= await ask('Name', prefilled.name);
    while (!tagline || tagline.length > TAGLINE_MAX) {
      tagline = await ask(
        `Tagline (max ${TAGLINE_MAX} chars)`,
        prefilled.tagline
      );
    }
  }

  const app = draftEntry(result, { category, name, tagline });
  let next: string;
  try {
    next = upsertApp(yamlText, app, { allowUpdate: false });
  } catch (error) {
    if (error instanceof CatalogEditError) {
      console.error(
        `Could not add "${slug}":\n${error.issues.map((i) => `  - ${i}`).join('\n')}`
      );
      return 1;
    }
    throw error;
  }
  writeFileSync(file, next);
  log(`\nAdded "${app.slug}" to ${file} as status: draft.`);

  let previews = 'skipped (--no-previews)';
  if (!args.flags.has('no-previews')) {
    try {
      const { capturePreviews } = await import('./previews');
      const shots = await capturePreviews(app.slug, {
        catalogFile: file,
        publicDir: PUBLIC_DIR,
        log,
      });
      previews = shots.failures.length
        ? `partial (${shots.failures.length} failed: ${shots.failures.join('; ')})`
        : `captured ${shots.written.length} files`;
    } catch (error) {
      previews = `failed (${error instanceof Error ? error.message.split('\n')[0] : String(error)})`;
    }
    log(`Previews: ${previews}`);
  }

  const reportMd = flag(args, 'report-md');
  if (reportMd) writeFileSync(reportMd, `${prBody(app, report, previews)}\n`);
  setActionOutput({ sub, slug: app.slug, score: String(report.score) });

  if (json) {
    console.log(
      JSON.stringify(
        { sub, slug: app.slug, app, readiness: report, previews },
        null,
        2
      )
    );
  } else {
    console.log(
      [
        '',
        'Next steps:',
        `  1. Write an original 150+ word description, 3+ features and 3+ howTo steps for "${app.slug}" in src/data/catalog.yaml (or in Studio: npm run dev → /__studio).`,
        '  2. Set status: live (the publish gate checks the copy and previews).',
        '  3. Commit and open a PR; merging to master deploys.',
      ].join('\n')
    );
  }
  return 0;
}

export interface CheckRow {
  slug: string;
  name: string;
  status: App['status'];
  url: string;
  ok: boolean;
  httpStatus: number;
  adsense: boolean;
  ga4: boolean;
  sitemapValid: boolean;
  score: number;
  total: number;
  checks: Check[];
}

async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    })
  );
  return out;
}

async function check(args: Args): Promise<number> {
  const file = flag(args, 'file')
    ? resolve(flag(args, 'file') as string)
    : DEFAULT_FILE;
  const { apps } = parseCatalog(readFileSync(file, 'utf8'));
  const rows = await mapLimit(apps, 3, async (app): Promise<CheckRow> => {
    const result = await probe(normaliseSubdomain(app.url), {
      sitemapHint: app.sitemap,
    });
    const r = readiness(result, { private: app.status === 'private' });
    return {
      slug: app.slug,
      name: app.name,
      status: app.status,
      url: app.url,
      ok: result.ok,
      httpStatus: result.status,
      adsense: result.adsense,
      ga4: result.ga4,
      sitemapValid: result.sitemap.valid,
      score: r.score,
      total: r.total,
      checks: r.checks,
    };
  });

  if (args.flags.has('json')) {
    console.log(
      JSON.stringify(
        { checkedAt: new Date().toISOString(), apps: rows },
        null,
        2
      )
    );
    return 0;
  }
  const ids = rows[0]?.checks.map((c) => c.id) ?? [];
  const head = ['slug', 'status', 'score', ...ids];
  const body = rows.map((r) => [
    r.slug,
    r.status,
    `${r.score}/${r.total}`,
    ...r.checks.map((c) => SYMBOL[c.level].toLowerCase()),
  ]);
  const widths = head.map((h, i) =>
    Math.max(h.length, ...body.map((row) => row[i].length))
  );
  const line = (cells: string[]): string =>
    cells
      .map((c, i) => c.padEnd(widths[i]))
      .join('  ')
      .trimEnd();
  console.log(line(head));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of body) console.log(line(row));
  return 0;
}

export async function main(argv: readonly string[]): Promise<number> {
  const [command, ...rest] = argv;
  const args = parseArgs(rest);
  if (command === 'add') return add(args);
  if (command === 'check') return check(args);
  console.error('Usage: tsx scripts/catalog/cli.ts <add|check> [...]');
  return 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  );
}
