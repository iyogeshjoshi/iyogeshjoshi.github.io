import type { App, Category } from './schema';

/**
 * Pure, client-safe catalog helpers. Every function takes the apps array so it
 * can be tested without the virtual module.
 */

/** Display order of categories (chips, footer, sitemap). */
export const CATEGORY_ORDER: readonly Category[] = [
  'tool',
  'game',
  'simulation',
  'app',
];

export const CATEGORY_LABELS: Readonly<Record<Category, string>> = {
  tool: 'Tools',
  game: 'Games',
  simulation: 'Simulations',
  app: 'Apps',
};

export const CATEGORY_LABELS_SINGULAR: Readonly<Record<Category, string>> = {
  tool: 'Tool',
  game: 'Game',
  simulation: 'Simulation',
  app: 'App',
};

export interface AppFilter {
  query?: string;
  category?: Category | null;
}

const collator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
});

/** Featured first, then name A–Z. Returns a new array. */
export function sortApps<T extends App>(apps: readonly T[]): T[] {
  return [...apps].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return collator.compare(a.name, b.name) || a.slug.localeCompare(b.slug);
  });
}

function searchHaystack(app: App): string {
  return [
    app.name,
    app.tagline,
    ...app.tags,
    CATEGORY_LABELS[app.category],
    CATEGORY_LABELS_SINGULAR[app.category],
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * Case-insensitive AND search: every whitespace-separated word must appear in
 * the name, tagline, tags or category label. An empty query returns all apps.
 */
export function searchApps<T extends App>(
  apps: readonly T[],
  query: string
): T[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...apps];
  return apps.filter((app) => {
    const haystack = searchHaystack(app);
    return words.every((word) => haystack.includes(word));
  });
}

/** Applies the optional category, then the search query. Preserves input order. */
export function filterApps<T extends App>(
  apps: readonly T[],
  { query = '', category = null }: AppFilter = {}
): T[] {
  const inCategory = category
    ? apps.filter((app) => app.category === category)
    : apps;
  return searchApps(inCategory, query);
}

/** Categories with at least one app, in `CATEGORY_ORDER`. */
export function categoriesInUse(apps: readonly App[]): Category[] {
  const used = new Set(apps.map((app) => app.category));
  return CATEGORY_ORDER.filter((category) => used.has(category));
}

export function findApp<T extends App>(
  apps: readonly T[],
  slug: string
): T | undefined {
  return apps.find((app) => app.slug === slug);
}

/**
 * Up to `n` apps related to `slug`: same category first, then by number of
 * shared tags, then the input order. Never includes the app itself; apps with
 * neither a shared category nor a shared tag are left out.
 */
export function relatedApps<T extends App>(
  apps: readonly T[],
  slug: string,
  n = 3
): T[] {
  const target = findApp(apps, slug);
  if (!target || n <= 0) return [];
  const targetTags = new Set(target.tags);

  return apps
    .map((app, index) => ({
      app,
      index,
      sameCategory: app.category === target.category ? 1 : 0,
      sharedTags: app.tags.filter((tag) => targetTags.has(tag)).length,
    }))
    .filter(
      ({ app, sameCategory, sharedTags }) =>
        app.slug !== slug && (sameCategory > 0 || sharedTags > 0)
    )
    .sort(
      (a, b) =>
        b.sameCategory - a.sameCategory ||
        b.sharedTags - a.sharedTags ||
        a.index - b.index
    )
    .slice(0, n)
    .map(({ app }) => app);
}

/** Number of apps with status `live`. */
export function countLive(apps: readonly App[]): number {
  return apps.filter((app) => app.status === 'live').length;
}
