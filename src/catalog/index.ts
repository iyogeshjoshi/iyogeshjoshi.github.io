import catalog from 'virtual:catalog';
import {
  categoriesInUse as categoriesIn,
  countLive,
  findApp,
  relatedApps as relatedIn,
  sortApps,
} from './query';
import type { Category, PublicApp, Site } from './schema';

/**
 * Client-safe catalog API. Data comes from `virtual:catalog`, which the build
 * has already validated and filtered to public apps. Only types are imported
 * from the schema, so zod never reaches the bundle.
 */

export {
  CATEGORY_LABELS,
  CATEGORY_LABELS_SINGULAR,
  CATEGORY_ORDER,
  filterApps,
  searchApps,
  sortApps,
} from './query';
export type { AppFilter } from './query';
export type {
  App,
  Catalog,
  Category,
  Device,
  PreviewKind,
  PublicApp,
  PublicCatalog,
  Site,
  Status,
} from './schema';

export const site: Site = catalog.site;

/** Public apps: featured first, then name A–Z. */
export const apps: readonly PublicApp[] = Object.freeze(sortApps(catalog.apps));

export const liveCount: number = countLive(apps);

export function getApp(slug: string): PublicApp | undefined {
  return findApp(apps, slug);
}

/** Categories with at least one public app, in display order. */
export function categoriesInUse(): Category[] {
  return categoriesIn(apps);
}

export function relatedApps(slug: string, n = 3): PublicApp[] {
  return relatedIn(apps, slug, n);
}
