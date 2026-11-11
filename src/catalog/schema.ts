import { z } from 'zod';

/**
 * Catalog schema (PRD §7, publish gate R6).
 *
 * Node-safe: imported by the Vite plugin at build time and by tests.
 * Client code must only `import type` from here so zod stays out of the bundle.
 */

export const CATEGORIES = ['tool', 'game', 'simulation', 'app'] as const;
export const STATUSES = [
  'live',
  'beta',
  'coming-soon',
  'draft',
  'private',
] as const;
export const DEVICES = ['desktop', 'tablet', 'phone'] as const;
export const PREVIEW_KINDS = [
  'ruler',
  'counter',
  'life',
  'pong',
  'prim',
  'verdict',
  'generic',
] as const;

/** Statuses that are built into public pages, search and sitemaps. */
export const PUBLIC_STATUSES = ['live', 'beta', 'coming-soon'] as const;

export const TAGLINE_MAX = 90;
export const PUBLIC_DESCRIPTION_MIN_WORDS = 150;
export const PUBLIC_LIST_MIN_ITEMS = 3;

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** `https://<sub>.deviloper.dev` with an optional trailing slash and nothing else. */
const APP_URL_RE = /^https:\/\/[a-z0-9]+(-[a-z0-9]+)*\.deviloper\.dev\/?$/;
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

export function isPublicStatus(status: Status): status is PublicStatus {
  return (PUBLIC_STATUSES as readonly string[]).includes(status);
}

const nonEmpty = z.string().trim().min(1, 'must not be empty');

const isoDate = z
  .string()
  .regex(ISO_DATE_RE, 'must be an ISO date (YYYY-MM-DD)')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, 'must be a real calendar date');

const httpsUrl = z
  .string()
  .url('must be a valid URL')
  .refine((value) => value.startsWith('https://'), 'must use https://');

export const categorySchema = z.enum(CATEGORIES);
export const statusSchema = z.enum(STATUSES);
export const deviceSchema = z.enum(DEVICES);
export const previewKindSchema = z.enum(PREVIEW_KINDS);

export const siteSchema = z
  .object({
    name: nonEmpty,
    tagline: nonEmpty,
    description: nonEmpty,
    url: z.literal('https://deviloper.dev'),
    email: z.literal('hello@deviloper.dev'),
  })
  .strict();

export const appSchema = z
  .object({
    slug: z
      .string()
      .regex(
        SLUG_RE,
        'must be lowercase kebab-case (a-z, 0-9, single hyphens)'
      ),
    name: nonEmpty,
    url: z
      .string()
      .regex(APP_URL_RE, 'must be https://<subdomain>.deviloper.dev'),
    category: categorySchema,
    status: statusSchema,
    featured: z.boolean().default(false),
    tagline: nonEmpty.max(
      TAGLINE_MAX,
      `must be at most ${TAGLINE_MAX} characters`
    ),
    description: nonEmpty,
    features: z.array(nonEmpty),
    howTo: z.array(nonEmpty),
    tags: z
      .array(nonEmpty)
      .min(1, 'needs at least 1 tag')
      .max(5, 'allows at most 5 tags'),
    privacy: nonEmpty,
    devices: z
      .array(deviceSchema)
      .min(1, 'needs at least 1 device')
      .refine(
        (list) => new Set(list).size === list.length,
        'must not repeat a device'
      ),
    controls: nonEmpty.optional(),
    accent: z.string().regex(HEX_COLOR_RE, 'must be a hex colour like #2DD4BF'),
    launchedAt: isoDate.optional(),
    updatedAt: isoDate.optional(),
    requiresAccount: z.boolean().default(false),
    previewKind: previewKindSchema,
    preview: z
      .object({
        light: nonEmpty.optional(),
        dark: nonEmpty.optional(),
      })
      .strict()
      .optional(),
    sitemap: httpsUrl.optional(),
  })
  .strict()
  .superRefine((app, ctx) => {
    if (!isPublicStatus(app.status)) return;

    const words = countWords(app.description);
    if (words < PUBLIC_DESCRIPTION_MIN_WORDS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['description'],
        message: `must be at least ${PUBLIC_DESCRIPTION_MIN_WORDS} words for status "${app.status}" (has ${words})`,
      });
    }
    for (const key of ['features', 'howTo'] as const) {
      if (app[key].length < PUBLIC_LIST_MIN_ITEMS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `needs at least ${PUBLIC_LIST_MIN_ITEMS} items for status "${app.status}" (has ${app[key].length})`,
        });
      }
    }
  });

function addDuplicateIssues(
  apps: readonly { slug: string; url: string }[],
  key: 'slug' | 'url',
  ctx: z.RefinementCtx
): void {
  const seen = new Map<string, number>();
  apps.forEach((app, index) => {
    const value = key === 'url' ? app.url.replace(/\/$/, '') : app.slug;
    const first = seen.get(value);
    if (first === undefined) {
      seen.set(value, index);
      return;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['apps', index, key],
      message: `duplicate ${key} "${value}" (already used by apps[${first}])`,
    });
  });
}

export const catalogSchema = z
  .object({
    site: siteSchema,
    apps: z.array(appSchema),
  })
  .strict()
  .superRefine((catalog, ctx) => {
    addDuplicateIssues(catalog.apps, 'slug', ctx);
    addDuplicateIssues(catalog.apps, 'url', ctx);
  });

export type Category = z.infer<typeof categorySchema>;
export type Status = z.infer<typeof statusSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type PreviewKind = z.infer<typeof previewKindSchema>;
export type PublicStatus = (typeof PUBLIC_STATUSES)[number];
export type Site = z.infer<typeof siteSchema>;
export type App = z.infer<typeof appSchema>;
export type Catalog = z.infer<typeof catalogSchema>;

/** An app that is allowed to ship to the client. */
export type PublicApp = App & { status: PublicStatus };

/** Shape of the `virtual:catalog` module (only public apps). */
export interface PublicCatalog {
  site: Site;
  apps: PublicApp[];
}
