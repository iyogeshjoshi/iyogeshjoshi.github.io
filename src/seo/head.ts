/**
 * Per-route <head> markup for the prerender step (PRD §5.9).
 * Pure string building: safe to run in Node and in tests.
 */

export const SITE_ORIGIN = 'https://deviloper.dev';
export const SITE_NAME = 'deviloper.dev';
export const DEFAULT_OG_IMAGE = '/images/android-chrome-512x512.png';

export type JsonLd = Record<string, unknown>;

export interface RouteMeta {
  /** Full document title, already suffixed with the site name. */
  title: string;
  description: string;
  /** Canonical path, e.g. `/apps/online-ruler/`. */
  path: string;
  /** Root-relative or absolute URL of a large preview image. */
  ogImage?: string;
  jsonLd?: JsonLd[];
  /** `noindex` pages get no canonical and are left out of sitemaps. */
  noindex?: boolean;
}

const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text for HTML element content and quoted attribute values. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/** Serialises JSON-LD so it can never close the surrounding <script>. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_ORIGIN}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export function renderHead(meta: RouteMeta): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(absoluteUrl(meta.path));
  const image = escapeHtml(absoluteUrl(meta.ogImage ?? DEFAULT_OG_IMAGE));
  const card = meta.ogImage ? 'summary_large_image' : 'summary';

  const tags: string[] = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
  ];
  if (meta.noindex) {
    tags.push('<meta name="robots" content="noindex" />');
  } else {
    tags.push(`<link rel="canonical" href="${url}" />`);
  }
  tags.push(
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${image}" />`
  );
  if (!meta.noindex) {
    tags.push(`<meta property="og:url" content="${url}" />`);
  }
  tags.push(
    `<meta name="twitter:card" content="${card}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`
  );
  for (const data of meta.jsonLd ?? []) {
    tags.push(
      `<script type="application/ld+json">${serializeJsonLd(data)}</script>`
    );
  }
  return tags.join('\n    ');
}
