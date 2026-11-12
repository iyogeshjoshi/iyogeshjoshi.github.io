import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { filterApps } from '@/catalog';
import type { Category, PublicApp } from '@/catalog';
import { trackEvent } from './analytics';
import { readFilterState, writeFilterState } from './urlState';
import type { FilterState } from './urlState';

/** Delay before the URL and the `search` analytics event catch up with typing. */
export const URL_SYNC_DELAY_MS = 250;

export interface CatalogFilters {
  query: string;
  category: Category | null;
  /** Apps matching the query and category, in catalog order. */
  results: PublicApp[];
  /** Matches for the current query per chip (`all` + each category). */
  counts: Record<Category | 'all', number>;
  /** True once the URL has been read after mount (SSR markup never depends on it). */
  hydrated: boolean;
  setQuery: (query: string) => void;
  setCategory: (category: Category | null) => void;
  /** Sets query and category together and pushes one history entry. */
  apply: (next: { query: string; category: Category | null }) => void;
  /** Clears query and category and pushes the URL immediately. */
  reset: () => void;
}

function writeSearch(search: string, mode: 'push' | 'replace'): void {
  const { pathname, hash } = window.location;
  // Never create a duplicate entry (or churn) for an identical URL.
  if (window.location.search === search) return;
  const url = pathname + search + hash;
  if (mode === 'push') window.history.pushState(window.history.state, '', url);
  else window.history.replaceState(window.history.state, '', url);
}

/**
 * Search + category state for the catalog home.
 *
 * The first render is always `{ query: '', category: null }` so prerendered
 * markup and the hydrating client agree; `?q=`/`?category=` are applied in an
 * effect after mount. Typing is synced (debounced) with `replaceState`; chip,
 * clear and suggestion changes `pushState` so Back restores the previous filter.
 */
export function useCatalogFilters(
  apps: readonly PublicApp[],
  categories: readonly Category[]
): CatalogFilters {
  const [query, setQueryState] = useState('');
  const [category, setCategoryState] = useState<Category | null>(null);
  const [hydrated, setHydrated] = useState(false);
  /** Last query reported to analytics, so URL-restored queries are not re-sent. */
  const trackedQuery = useRef('');
  /** Latest filter state, readable from stable callbacks. */
  const latest = useRef<FilterState>({ query: '', category: null });

  // Read the URL after mount, and again on back/forward.
  useEffect(() => {
    const apply = (): void => {
      const state = readFilterState(window.location.search, categories);
      trackedQuery.current = state.query.trim();
      latest.current = state;
      setQueryState(state.query);
      setCategoryState(state.category);
    };
    apply();
    setHydrated(true);
    window.addEventListener('popstate', apply);
    return () => window.removeEventListener('popstate', apply);
  }, [categories]);

  // Debounced URL sync + `search` event.
  useEffect(() => {
    if (!hydrated) return undefined;
    const id = window.setTimeout(() => {
      writeSearch(
        writeFilterState(window.location.search, { query, category }),
        'replace'
      );
      const term = query.trim();
      if (term && term !== trackedQuery.current) {
        trackedQuery.current = term;
        trackEvent('search', { search_term: term });
      }
    }, URL_SYNC_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [hydrated, query, category]);

  const setQuery = useCallback((next: string) => {
    latest.current = { ...latest.current, query: next };
    setQueryState(next);
  }, []);

  const pushState = useCallback((next: FilterState) => {
    latest.current = next;
    writeSearch(writeFilterState(window.location.search, next), 'push');
  }, []);

  const setCategory = useCallback(
    (next: Category | null) => {
      setCategoryState(next);
      pushState({ ...latest.current, category: next });
      trackEvent('filter_category', { category: next ?? 'all' });
    },
    [pushState]
  );

  const apply = useCallback(
    (next: FilterState) => {
      setQueryState(next.query);
      setCategoryState(next.category);
      pushState(next);
    },
    [pushState]
  );

  const reset = useCallback(() => {
    trackedQuery.current = '';
    apply({ query: '', category: null });
  }, [apply]);

  const results = useMemo(
    () => filterApps(apps, { query, category }),
    [apps, query, category]
  );

  const counts = useMemo(() => {
    const byQuery = filterApps(apps, { query });
    const tally = { all: byQuery.length } as Record<Category | 'all', number>;
    for (const key of categories) {
      tally[key] = byQuery.filter((app) => app.category === key).length;
    }
    return tally;
  }, [apps, categories, query]);

  return {
    query,
    category,
    results,
    counts,
    hydrated,
    setQuery,
    setCategory,
    apply,
    reset,
  };
}
