/**
 * Add-app core (PRD §5.8 R2, R6, R8). Shared by the CLI, the dev-only Studio
 * and the GitHub Actions. Everything here is pure except `probe`, whose
 * `fetch` is injectable so tests never touch the network.
 *
 * YAML edits use the `yaml` Document API to locate nodes and then splice the
 * original text, so comments, folded scalars and line wrapping of untouched
 * entries stay byte-for-byte identical.
 */
import { Document, isMap, isScalar, isSeq, parseDocument, visit } from 'yaml';
import type { YAMLMap, YAMLSeq } from 'yaml';

import { parseCatalog } from '../../src/catalog/load';
import {
  CATEGORIES,
  PUBLIC_DESCRIPTION_MIN_WORDS,
  PUBLIC_LIST_MIN_ITEMS,
  STATUSES,
  TAGLINE_MAX,
  appSchema,
  isPublicStatus,
} from '../../src/catalog/schema';
import type { App, Category, Status } from '../../src/catalog/schema';

export const ROOT_DOMAIN = 'deviloper.dev';
export const ADSENSE_CLIENT = 'ca-pub-5076417401305199';
export const GA4_ID = 'G-PCZPZC1H5E';
export const USER_AGENT = 'deviloper-catalog-bot/1.0 (+https://deviloper.dev)';
export const PROBE_TIMEOUT_MS = 15_000;
export const DEFAULT_ACCENT = '#2DD4BF';
export const READINESS_TOTAL = 9;

export { CATEGORIES, STATUSES, TAGLINE_MAX, PUBLIC_DESCRIPTION_MIN_WORDS };
export { PUBLIC_LIST_MIN_ITEMS };

const LABEL_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export type FetchLike = (
  input: string,
  init?: {
    headers?: Record<string, string>;
    redirect?: 'follow';
    signal?: AbortSignal;
  }
) => Promise<{
  ok: boolean;
  status: number;
  url: string;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
}>;

/** Error carrying one readable message per problem (shown by CLI, Studio, Action). */
export class CatalogEditError extends Error {
  readonly issues: string[];
  constructor(issues: string[]) {
    super(issues.join('\n'));
    this.name = 'CatalogEditError';
    this.issues = issues;
  }
}

// ---------------------------------------------------------------- subdomain

/**
 * Accepts `my-app`, `my-app.deviloper.dev`, `https://my-app.deviloper.dev/x`
 * and returns the validated label `my-app`.
 */
export function normaliseSubdomain(input: string): string {
  let value = input.trim().toLowerCase();
  value = value.replace(/^[a-z]+:\/\//, '');
  value = value.split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.$/, '');
  if (value.endsWith(`.${ROOT_DOMAIN}`)) {
    value = value.slice(0, -(ROOT_DOMAIN.length + 1));
  }
  if (value === '' || value === ROOT_DOMAIN || value === 'www') {
    throw new Error('Enter a subdomain such as "my-new-thing".');
  }
  if (value.includes('.')) {
    throw new Error(
      `"${input}" is not a ${ROOT_DOMAIN} subdomain (expected <sub>.${ROOT_DOMAIN}).`
    );
  }
  if (value.length > 63 || !LABEL_RE.test(value)) {
    throw new Error(
      `"${value}" is not a valid subdomain: use lowercase letters, digits and hyphens (not at the start or end).`
    );
  }
  return value;
}

export function subdomainUrl(sub: string): string {
  return `https://${sub}.${ROOT_DOMAIN}`;
}

/** Catalog slug for a subdomain (kebab-case, single hyphens). */
export function slugFromSub(sub: string): string {
  return sub.replace(/-+/g, '-');
}

// ---------------------------------------------------------------- HTML meta

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  mdash: '—',
  ndash: '–',
  hellip: '…',
};

export function decodeEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (match, code: string) => {
      if (code[0] === '#') {
        const n =
          code[1].toLowerCase() === 'x'
            ? parseInt(code.slice(2), 16)
            : parseInt(code.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : match;
      }
      return ENTITIES[code.toLowerCase()] ?? match;
    }
  );
}

function clean(text: string | undefined): string | null {
  if (text === undefined) return null;
  const value = decodeEntities(text).replace(/\s+/g, ' ').trim();
  return value === '' ? null : value;
}

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag))) {
    attrs[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? '';
  }
  return attrs;
}

export interface PageMeta {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  themeColor: string | null;
  hasViewport: boolean;
}

/** Reads `<title>` and the meta tags we care about (no DOM needed). */
export function extractMeta(html: string, baseUrl: string): PageMeta {
  const head = html.split(/<\/head>/i)[0];
  const title = clean(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1]);
  const metas = (head.match(/<meta\b[^>]*>/gi) ?? []).map(parseAttributes);
  const find = (key: string): string | undefined =>
    metas.find(
      (m) =>
        (m.name ?? m.property ?? '').toLowerCase() === key &&
        m.content !== undefined
    )?.content;

  let ogImage = clean(find('og:image') ?? find('og:image:url'));
  if (ogImage) {
    try {
      ogImage = new URL(ogImage, baseUrl).href;
    } catch {
      ogImage = null;
    }
  }
  const viewport = find('viewport') ?? '';
  return {
    title,
    description: clean(find('description')),
    ogImage,
    themeColor: clean(find('theme-color')),
    hasViewport: /width\s*=\s*device-width/i.test(viewport),
  };
}

export function hasAdsenseTag(html: string): boolean {
  return html.includes(ADSENSE_CLIENT);
}

export function hasGa4Tag(html: string): boolean {
  return html.includes(GA4_ID);
}

export interface CmpProxy {
  detected: boolean;
  /**
   * `fundingchoices`: a Funding Choices script is in the page.
   * `adsense-tag`: only the AdSense tag was found. Google's consent message is
   * served by that tag, so this is a proxy, not proof the message is published.
   */
  via: 'fundingchoices' | 'adsense-tag' | null;
}

export function detectCmp(html: string): CmpProxy {
  if (/fundingchoicesmessages\.google\.com|fundingchoices/i.test(html)) {
    return { detected: true, via: 'fundingchoices' };
  }
  if (/adsbygoogle/i.test(html) && hasAdsenseTag(html)) {
    return { detected: true, via: 'adsense-tag' };
  }
  return { detected: false, via: null };
}

// ---------------------------------------------------------------- probe

export interface SitemapProbe {
  url: string | null;
  valid: boolean;
  detail: string;
}

export interface ProbeResult extends PageMeta {
  sub: string;
  url: string;
  finalUrl: string | null;
  ok: boolean;
  status: number;
  error: string | null;
  html: string;
  sitemap: SitemapProbe;
  adsense: boolean;
  ga4: boolean;
  cmpProxy: CmpProxy;
  probedAt: string;
}

export interface ProbeOptions {
  fetch?: FetchLike;
  timeoutMs?: number;
  /** A sitemap URL already known for the app (tried first). */
  sitemapHint?: string;
  now?: () => Date;
}

async function get(
  fetchFn: FetchLike,
  url: string,
  timeoutMs: number
): ReturnType<FetchLike> {
  return fetchFn(url, {
    headers: { 'user-agent': USER_AGENT, accept: '*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  });
}

export function isRealSitemap(
  contentType: string | null,
  body: string
): boolean {
  return (
    /xml/i.test(contentType ?? '') && /<(urlset|sitemapindex)\b/i.test(body)
  );
}

async function probeSitemap(
  fetchFn: FetchLike,
  origin: string,
  timeoutMs: number,
  hint?: string
): Promise<SitemapProbe> {
  const candidates: string[] = [];
  const add = (url: string): void => {
    if (!candidates.includes(url)) candidates.push(url);
  };
  if (hint) add(hint);
  try {
    const robots = await get(fetchFn, `${origin}/robots.txt`, timeoutMs);
    if (robots.ok) {
      const text = await robots.text();
      for (const m of text.matchAll(/^\s*sitemap:\s*(\S+)/gim)) {
        try {
          const url = new URL(m[1], origin);
          if (url.origin === origin) add(url.href);
        } catch {
          // ignore malformed lines
        }
      }
    }
  } catch {
    // robots.txt is optional
  }
  add(`${origin}/sitemap-index.xml`);
  add(`${origin}/sitemap.xml`);

  const problems: { problem: SitemapProbe; softHtml: boolean }[] = [];
  for (const url of candidates) {
    const path = new URL(url).pathname;
    try {
      const res = await get(fetchFn, url, timeoutMs);
      const body = res.ok ? await res.text() : '';
      const type = res.headers.get('content-type');
      if (res.ok && isRealSitemap(type, body)) {
        return { url, valid: true, detail: `${path} is a real sitemap` };
      }
      const softHtml =
        res.ok && (/html/i.test(type ?? '') || /<html\b/i.test(body));
      problems.push({
        softHtml,
        problem: {
          url,
          valid: false,
          detail: !res.ok
            ? `${path} returns HTTP ${res.status}`
            : softHtml
              ? `${path} returns the app HTML (soft 404)`
              : `${path} is not a sitemap (no <urlset> or <sitemapindex>)`,
        },
      });
    } catch (error) {
      problems.push({
        softHtml: false,
        problem: {
          url,
          valid: false,
          detail: `${path} could not be fetched (${errorMessage(error)})`,
        },
      });
    }
  }
  // A soft 404 is the most useful thing to report.
  const best =
    problems.find((p) => p.softHtml) ?? problems[problems.length - 1];
  return (
    best?.problem ?? { url: null, valid: false, detail: 'No sitemap found' }
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return 'timed out';
    }
    const cause = (error as Error & { cause?: unknown }).cause;
    return cause instanceof Error ? cause.message : error.message;
  }
  return String(error);
}

/** Fetches `https://<sub>.deviloper.dev` and its sitemap and reads every readiness signal. */
export async function probe(
  sub: string,
  options: ProbeOptions = {}
): Promise<ProbeResult> {
  const fetchFn = options.fetch ?? (globalThis.fetch as unknown as FetchLike);
  const timeoutMs = options.timeoutMs ?? PROBE_TIMEOUT_MS;
  const url = subdomainUrl(sub);
  const probedAt = (options.now?.() ?? new Date()).toISOString();

  let status = 0;
  let ok = false;
  let finalUrl: string | null = null;
  let html = '';
  let error: string | null = null;
  try {
    const res = await get(fetchFn, `${url}/`, timeoutMs);
    status = res.status;
    ok = res.ok;
    finalUrl = res.url || `${url}/`;
    html = await res.text();
  } catch (e) {
    error = errorMessage(e);
  }

  const meta = extractMeta(html, finalUrl ?? url);
  const sitemap =
    error === null
      ? await probeSitemap(fetchFn, url, timeoutMs, options.sitemapHint)
      : { url: null, valid: false, detail: 'Skipped: the site is unreachable' };

  return {
    sub,
    url,
    finalUrl,
    ok,
    status,
    error,
    html,
    ...meta,
    sitemap,
    adsense: hasAdsenseTag(html),
    ga4: hasGa4Tag(html),
    cmpProxy: detectCmp(html),
    probedAt,
  };
}

// ---------------------------------------------------------------- readiness

export type Level = 'pass' | 'warn' | 'fail';

export interface Check {
  id:
    | 'https'
    | 'title'
    | 'viewport'
    | 'description'
    | 'ogImage'
    | 'sitemap'
    | 'adsense'
    | 'ga4'
    | 'cmp';
  label: string;
  level: Level;
  detail: string;
}

export interface Readiness {
  checks: Check[];
  /** Number of passing checks, out of `total`. */
  score: number;
  total: number;
}

export interface ReadinessOptions {
  /** Private apps are expected to have no ads; their ad checks become warnings. */
  private?: boolean;
}

/**
 * The 9 readiness checks (docs/subdomains.md). Informational only: listing is
 * never blocked by readiness (R6); only the publish gate blocks.
 */
export function readiness(
  p: ProbeResult,
  options: ReadinessOptions = {}
): Readiness {
  const adLevel: Level = options.private ? 'warn' : 'fail';
  const https: Check = (() => {
    if (p.error) {
      return {
        id: 'https',
        label: 'Reachable over HTTPS',
        level: 'fail',
        detail: `Unreachable: ${p.error}`,
      };
    }
    if (p.finalUrl && !p.finalUrl.startsWith('https://')) {
      return {
        id: 'https',
        label: 'Reachable over HTTPS',
        level: 'fail',
        detail: `Redirects to ${p.finalUrl} (not HTTPS)`,
      };
    }
    if (!p.ok) {
      return {
        id: 'https',
        label: 'Reachable over HTTPS',
        level: 'fail',
        detail: `HTTP ${p.status}`,
      };
    }
    const moved =
      p.finalUrl && new URL(p.finalUrl).host !== new URL(p.url).host;
    return {
      id: 'https',
      label: 'Reachable over HTTPS',
      level: moved ? 'warn' : 'pass',
      detail: moved
        ? `${p.status} OK after redirect to ${p.finalUrl}`
        : `${p.status} OK`,
    };
  })();

  const checks: Check[] = [
    https,
    p.title
      ? {
          id: 'title',
          label: 'Page title',
          level: 'pass',
          detail: `“${p.title}”`,
        }
      : {
          id: 'title',
          label: 'Page title',
          level: 'warn',
          detail: 'Missing <title>',
        },
    p.hasViewport
      ? {
          id: 'viewport',
          label: 'Mobile viewport',
          level: 'pass',
          detail: 'width=device-width set',
        }
      : {
          id: 'viewport',
          label: 'Mobile viewport',
          level: 'warn',
          detail: 'No width=device-width viewport meta',
        },
    p.description
      ? {
          id: 'description',
          label: 'Meta description',
          level: 'pass',
          detail: `${p.description.length} characters`,
        }
      : {
          id: 'description',
          label: 'Meta description',
          level: 'warn',
          detail: 'Missing: search results will show random page text',
        },
    p.ogImage
      ? {
          id: 'ogImage',
          label: 'Open Graph image',
          level: 'pass',
          detail: p.ogImage,
        }
      : {
          id: 'ogImage',
          label: 'Open Graph image',
          level: 'warn',
          detail: 'Missing: the hub will use the captured preview instead',
        },
    {
      id: 'sitemap',
      label: 'Sitemap',
      level: p.sitemap.valid ? 'pass' : 'fail',
      detail: p.sitemap.valid
        ? `${p.sitemap.url} (included in the sitemap index)`
        : `${p.sitemap.detail}; the sitemap index skips this app`,
    },
    {
      id: 'adsense',
      label: 'AdSense tag',
      level: p.adsense ? 'pass' : adLevel,
      detail: p.adsense
        ? `${ADSENSE_CLIENT} found`
        : `${ADSENSE_CLIENT} not found`,
    },
    {
      id: 'ga4',
      label: 'GA4 tag',
      level: p.ga4 ? 'pass' : adLevel,
      detail: p.ga4 ? `${GA4_ID} found` : `${GA4_ID} not found`,
    },
    {
      id: 'cmp',
      label: 'Consent (CMP)',
      level:
        p.cmpProxy.via === 'fundingchoices'
          ? 'pass'
          : p.cmpProxy.detected
            ? 'warn'
            : adLevel,
      detail:
        p.cmpProxy.via === 'fundingchoices'
          ? 'Funding Choices consent script found'
          : p.cmpProxy.via === 'adsense-tag'
            ? 'Proxy: AdSense tag present (it serves the Google consent message); check the message is published in AdSense'
            : 'No AdSense tag or Funding Choices script, so no Google consent message',
    },
  ];
  if (options.private) {
    for (const check of checks) {
      if (
        ['adsense', 'ga4', 'cmp'].includes(check.id) &&
        check.level !== 'pass'
      ) {
        check.detail += ' (expected: private apps run no ads)';
      }
    }
  }
  return {
    checks,
    score: checks.filter((c) => c.level === 'pass').length,
    total: READINESS_TOTAL,
  };
}

const BADGE: Record<Level, string> = {
  pass: 'PASS',
  warn: 'WARN',
  fail: 'FAIL',
};

/** Markdown table for PR bodies and issues. */
export function readinessMarkdown(r: Readiness): string {
  const rows = r.checks.map(
    (c) =>
      `| ${BADGE[c.level]} | ${c.label} | ${c.detail.replace(/\|/g, '\\|')} |`
  );
  return [
    `**Readiness: ${r.score}/${r.total} passing**`,
    '',
    '| Result | Check | Detail |',
    '|---|---|---|',
    ...rows,
  ].join('\n');
}

// ---------------------------------------------------------------- draft entry

export interface DraftInput {
  category?: Category;
  name?: string;
  tagline?: string;
  description?: string;
  features?: string[];
  howTo?: string[];
  tags?: string[];
  privacy?: string;
  accent?: string;
  /** Defaults to today (UTC). */
  today?: string;
}

export const PLACEHOLDER_DESCRIPTION =
  'TODO: write an original description of at least 150 words before publishing.';
export const PLACEHOLDER_PRIVACY =
  'TODO: describe what the app stores or sends, if anything.';

function titleCase(sub: string): string {
  return sub
    .split('-')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

/** "Online Ruler — Actual Size Screen Ruler" → "Online Ruler". */
export function nameFromTitle(title: string | null, sub: string): string {
  const first = title?.split(/\s+[—–|·:-]\s+/)[0].trim();
  return first && first.length <= 60 ? first : titleCase(sub);
}

/** Cuts at a word boundary so the result is at most `max` characters. */
export function truncateWords(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return `${(at > 20 ? cut.slice(0, at) : cut).replace(/[\s,;:.]+$/, '')}…`;
}

export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** A schema-valid `status: draft` entry, prefilled from the probe. */
export function draftEntry(p: ProbeResult, input: DraftInput = {}): App {
  const name = input.name?.trim() || nameFromTitle(p.title, p.sub);
  const category = input.category ?? 'app';
  const tagline =
    input.tagline?.trim() ||
    (p.description
      ? truncateWords(p.description, TAGLINE_MAX)
      : `TODO: tagline for ${name}`);
  const app: App = {
    slug: slugFromSub(p.sub),
    name,
    url: p.url,
    category,
    status: 'draft',
    featured: false,
    tagline,
    description:
      input.description?.trim() || p.description || PLACEHOLDER_DESCRIPTION,
    features: input.features ?? [],
    howTo: input.howTo ?? [],
    tags: input.tags?.length ? input.tags : [category],
    privacy: input.privacy?.trim() || PLACEHOLDER_PRIVACY,
    devices: p.hasViewport ? ['desktop', 'tablet', 'phone'] : ['desktop'],
    accent: input.accent ?? DEFAULT_ACCENT,
    updatedAt: input.today ?? todayIso(),
    requiresAccount: false,
    previewKind: 'generic',
  };
  if (p.sitemap.valid && p.sitemap.url) app.sitemap = p.sitemap.url;
  return app;
}

// ---------------------------------------------------------------- publish gate

function zodIssues(app: unknown): string[] {
  const result = appSchema.safeParse(app);
  if (result.success) return [];
  return result.error.issues.map(
    (i) => `${i.path.length ? i.path.join('.') : '(app)'}: ${i.message}`
  );
}

/**
 * Everything that stops `app` from moving to `status` (R6). Empty means OK.
 * The schema covers tagline/description/features/howTo; live and beta also
 * need at least one captured preview.
 */
export function publishGateErrors(
  app: Partial<App>,
  status: Status = app.status ?? 'draft'
): string[] {
  const candidate = { ...app, status };
  const errors = zodIssues(candidate);
  if (isPublicStatus(status)) {
    if (app.description?.startsWith('TODO')) {
      errors.push(
        'description: replace the TODO placeholder with original copy'
      );
    }
    if (app.tagline?.startsWith('TODO')) {
      errors.push('tagline: replace the TODO placeholder');
    }
    if (app.privacy?.startsWith('TODO')) {
      errors.push('privacy: replace the TODO placeholder');
    }
    if (
      (status === 'live' || status === 'beta') &&
      !app.preview?.light &&
      !app.preview?.dark
    ) {
      errors.push(
        'preview: capture at least one preview before going live (npm run previews / Studio)'
      );
    }
  }
  return Array.from(new Set(errors));
}

// ---------------------------------------------------------------- YAML edits

const KEY_ORDER: readonly (keyof App)[] = [
  'slug',
  'name',
  'url',
  'category',
  'status',
  'featured',
  'requiresAccount',
  'tagline',
  'description',
  'features',
  'howTo',
  'tags',
  'privacy',
  'devices',
  'controls',
  'accent',
  'launchedAt',
  'updatedAt',
  'previewKind',
  'preview',
  'sitemap',
];

/** Renders one app as a `  - slug: …` block in the house style of catalog.yaml. */
export function renderAppBlock(app: App): string {
  const ordered: Record<string, unknown> = {};
  const record = app as unknown as Record<string, unknown>;
  for (const key of [...KEY_ORDER, ...Object.keys(app)]) {
    const value = record[key];
    if (value === undefined || key in ordered) continue;
    if ((key === 'featured' || key === 'requiresAccount') && value === false)
      continue;
    ordered[key] = value;
  }
  const doc = new Document(ordered);
  visit(doc, {
    Pair(_, pair) {
      const key = isScalar(pair.key) ? String(pair.key.value) : '';
      if (key === 'description' && isScalar(pair.value))
        pair.value.type = 'BLOCK_FOLDED';
      if ((key === 'tags' || key === 'devices') && isSeq(pair.value))
        pair.value.flow = true;
      if (
        ['accent', 'updatedAt', 'launchedAt'].includes(key) &&
        isScalar(pair.value)
      ) {
        pair.value.type = 'QUOTE_SINGLE';
      }
    },
  });
  const body = doc
    .toString({
      lineWidth: 88,
      flowCollectionPadding: false,
      minContentWidth: 40,
    })
    .trimEnd();
  return body
    .split('\n')
    .map((line, i) =>
      line === '' ? '' : `${i === 0 ? '  - ' : '    '}${line}`
    )
    .join('\n');
}

interface AppBlock {
  slug: string;
  text: string;
  item: YAMLMap;
  start: number;
}

interface SplitCatalog {
  header: string;
  blocks: AppBlock[];
  tail: string;
}

function lineStart(text: string, offset: number): number {
  return text.lastIndexOf('\n', offset - 1) + 1;
}

function appsSeq(text: string): { doc: Document.Parsed; seq: YAMLSeq } {
  const doc = parseDocument(text);
  if (doc.errors.length > 0) {
    throw new CatalogEditError(doc.errors.map((e) => `YAML: ${e.message}`));
  }
  const seq = doc.get('apps', true);
  if (!isSeq(seq)) throw new CatalogEditError(['apps: expected a list']);
  return { doc, seq };
}

/** Splits catalog text into header / one block per app / tail, using node ranges. */
function splitApps(text: string): SplitCatalog {
  const { seq } = appsSeq(text);
  if (seq.flow || seq.items.length === 0) {
    throw new CatalogEditError(['apps: expected a non-empty block list']);
  }
  const starts = seq.items.map((item) => {
    if (!isMap(item) || !item.range)
      throw new CatalogEditError(['apps: every entry must be a map']);
    let start = lineStart(text, item.range[0]);
    // Keep comment lines directly above an entry with that entry.
    for (;;) {
      if (start === 0) break;
      const prev = lineStart(text, start - 1);
      if (!/^\s*#/.test(text.slice(prev, start))) break;
      start = prev;
    }
    return start;
  });
  const lastItem = seq.items[seq.items.length - 1] as YAMLMap;
  const rawEnd = lastItem.range?.[2] ?? text.length;
  const lastEnd =
    starts[starts.length - 1] +
    text.slice(starts[starts.length - 1], rawEnd).trimEnd().length;
  const blocks = seq.items.map((item, i) => {
    const map = item as YAMLMap;
    const end = i + 1 < starts.length ? starts[i + 1] : lastEnd;
    return {
      slug: String(map.get('slug')),
      text: text.slice(starts[i], end).trimEnd(),
      item: map,
      start: starts[i],
    };
  });
  return {
    header: text.slice(0, starts[0]),
    blocks,
    tail: text.slice(lastEnd),
  };
}

function joinApps(split: {
  header: string;
  blocks: { text: string }[];
  tail: string;
}): string {
  return (
    split.header + split.blocks.map((b) => b.text).join('\n\n') + split.tail
  );
}

/** Validates the whole file; throws readable, slug-annotated errors. */
export function validateCatalogText(text: string): void {
  try {
    parseCatalog(text);
  } catch (error) {
    let slugs: string[] = [];
    try {
      slugs = splitApps(text).blocks.map((b) => b.slug);
    } catch {
      // fall through with raw messages
    }
    const lines = (error instanceof Error ? error.message : String(error))
      .split('\n')
      .filter((l) => l.startsWith('  - '))
      .map((l) =>
        l
          .slice(4)
          .replace(/^apps\[(\d+)\]/, (m, i: string) =>
            slugs[+i] ? `${slugs[+i]}` : m
          )
      );
    throw new CatalogEditError(lines.length ? lines : [String(error)]);
  }
}

export interface UpsertOptions {
  /** When false, an existing slug is an error (CLI/Action add). Default true. */
  allowUpdate?: boolean;
}

/**
 * Inserts `app` at the end of `apps`, or replaces the entry with the same
 * slug. Refuses a slug or URL already used by another entry, and enforces
 * the publish gate when the status is public.
 */
export function upsertApp(
  yamlText: string,
  app: App,
  options: UpsertOptions = {}
): string {
  const { allowUpdate = true } = options;
  const split = splitApps(yamlText);
  const normUrl = (u: unknown): string => String(u).replace(/\/$/, '');
  const index = split.blocks.findIndex((b) => b.slug === app.slug);
  const issues: string[] = [];
  if (index !== -1 && !allowUpdate) {
    issues.push(
      `slug "${app.slug}" is already in the catalog; edit it instead`
    );
  }
  const clash = split.blocks.find(
    (b, i) => i !== index && normUrl(b.item.get('url')) === normUrl(app.url)
  );
  if (clash) issues.push(`url ${app.url} is already used by "${clash.slug}"`);

  const previous =
    index === -1 ? undefined : (split.blocks[index].item.toJSON() as App);
  if (isPublicStatus(app.status) && previous?.status !== app.status) {
    issues.push(...publishGateErrors(app, app.status));
  }
  if (issues.length) throw new CatalogEditError(issues);

  const rendered = renderAppBlock(app);
  const blocks: { text: string }[] = [...split.blocks];
  if (index === -1) {
    blocks.push({ text: rendered });
  } else {
    // Keep comment lines attached above the entry being replaced.
    const leading =
      /^(?:[ \t]*#.*\n)*/.exec(split.blocks[index].text)?.[0] ?? '';
    blocks[index] = { text: leading + rendered };
  }
  const next = joinApps({
    header: split.header,
    blocks,
    tail: split.tail || '\n',
  });
  validateCatalogText(next);
  return next;
}

/** Changes one entry's status in place (only that scalar is rewritten). */
export function setStatus(
  yamlText: string,
  slug: string,
  status: Status
): string {
  if (!(STATUSES as readonly string[]).includes(status)) {
    throw new CatalogEditError([
      `status: must be one of ${STATUSES.join(', ')}`,
    ]);
  }
  const { blocks } = splitApps(yamlText);
  const block = blocks.find((b) => b.slug === slug);
  if (!block) throw new CatalogEditError([`No app with slug "${slug}"`]);
  const node = block.item.get('status', true);
  if (!isScalar(node) || !node.range)
    throw new CatalogEditError([`${slug}: has no status`]);
  if (isPublicStatus(status)) {
    const errors = publishGateErrors(block.item.toJSON() as App, status);
    if (errors.length)
      throw new CatalogEditError(errors.map((e) => `${slug}: ${e}`));
  }
  const next =
    yamlText.slice(0, node.range[0]) + status + yamlText.slice(node.range[1]);
  validateCatalogText(next);
  return next;
}

/** Reorders entries; `slugs` must list every app exactly once. */
export function reorderApps(
  yamlText: string,
  slugs: readonly string[]
): string {
  const split = splitApps(yamlText);
  const current = split.blocks.map((b) => b.slug);
  const missing = current.filter((s) => !slugs.includes(s));
  const unknown = slugs.filter((s) => !current.includes(s));
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  const issues = [
    ...missing.map((s) => `order is missing "${s}"`),
    ...unknown.map((s) => `order has unknown slug "${s}"`),
    ...dupes.map((s) => `order repeats "${s}"`),
  ];
  if (issues.length) throw new CatalogEditError(issues);
  const blocks = slugs.map(
    (s) => split.blocks.find((b) => b.slug === s) as AppBlock
  );
  const next = joinApps({ header: split.header, blocks, tail: split.tail });
  validateCatalogText(next);
  return next;
}
