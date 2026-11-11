import { CATEGORY_LABELS } from '@/catalog';
import type { Category } from '@/catalog';

/**
 * `?q=` and `?category=` <-> filter state. Categories are written as the plural
 * lowercase label (`?category=games`, PRD F3); the singular key is accepted too.
 */

export interface FilterState {
  query: string;
  category: Category | null;
}

export const QUERY_PARAM = 'q';
export const CATEGORY_PARAM = 'category';

export function categoryToParam(category: Category): string {
  return CATEGORY_LABELS[category].toLowerCase();
}

export function paramToCategory(
  value: string | null,
  allowed: readonly Category[]
): Category | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return (
    allowed.find(
      (category) =>
        category === normalized || categoryToParam(category) === normalized
    ) ?? null
  );
}

export function readFilterState(
  search: string,
  allowed: readonly Category[]
): FilterState {
  const params = new URLSearchParams(search);
  return {
    query: params.get(QUERY_PARAM) ?? '',
    category: paramToCategory(params.get(CATEGORY_PARAM), allowed),
  };
}

/** Returns `search` with q/category set or removed; other params are kept. */
export function writeFilterState(search: string, state: FilterState): string {
  const params = new URLSearchParams(search);
  const query = state.query.trim();
  if (query) params.set(QUERY_PARAM, query);
  else params.delete(QUERY_PARAM);
  if (state.category) {
    params.set(CATEGORY_PARAM, categoryToParam(state.category));
  } else {
    params.delete(CATEGORY_PARAM);
  }
  const next = params.toString();
  return next ? `?${next}` : '';
}
