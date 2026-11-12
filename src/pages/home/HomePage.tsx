import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

import {
  apps,
  categoriesInUse,
  CATEGORY_LABELS,
  liveCount,
  site,
} from '@/catalog';
import type { Category } from '@/catalog';
import {
  AppGrid,
  CategoryChips,
  EmptyState,
  SearchBox,
  useCatalogFilters,
} from '@/components/catalog';
import styles from './HomePage.module.css';

/** Stable for the lifetime of the bundle (the catalog is static). */
const CATEGORIES: readonly Category[] = categoriesInUse();

/** Empty-state suggestions: one tag per app, so each is known to match. */
const SUGGESTIONS: readonly string[] = Array.from(
  new Set(apps.map((app) => app.tags[0]).filter(Boolean))
).slice(0, 3);

interface Benefit {
  title: string;
  body: string;
}

const BENEFITS: readonly Benefit[] = [
  {
    title: 'No sign-up, ever',
    body: 'Open a tool or game and use it. No accounts, no paywalls, no email capture.',
  },
  {
    title: 'Private by default',
    body: 'Everything runs in your browser — what you type or measure stays on your device.',
  },
  {
    title: 'Fast on any screen',
    body: 'Lightweight pages that load quickly on phones, tablets and desktops alike.',
  },
];

function resultsTitle(query: string, category: Category | null): string {
  const term = query.trim();
  if (term) {
    const scope = category ? ` in ${CATEGORY_LABELS[category]}` : '';
    return `Results for “${term}”${scope}`;
  }
  return category ? CATEGORY_LABELS[category] : 'Everything';
}

function countLabel(count: number): string {
  return `${count} ${count === 1 ? 'app' : 'apps'}`;
}

/**
 * Catalog home content: hero + search/filters, results grid and the
 * "Built to get out of your way" section. The page shell (`<main>`, header,
 * footer) comes from `<Layout>`.
 */
export const HomePage: React.FC = () => {
  const searchRef = useRef<HTMLInputElement>(null);
  const {
    query,
    category,
    results,
    counts,
    hydrated,
    setQuery,
    setCategory,
    apply,
    reset,
  } = useCatalogFilters(apps, CATEGORIES);

  // Animate only after the URL state has been applied, so neither hydration
  // nor a restored `?q=` plays a reflow, and never under reduced motion.
  const prefersReducedMotion = useReducedMotion();
  const [motionReady, setMotionReady] = useState(false);
  useEffect(() => {
    if (hydrated) setMotionReady(true);
  }, [hydrated]);
  const animate = motionReady && !prefersReducedMotion;

  const handleClear = useCallback(() => {
    reset();
    searchRef.current?.focus();
  }, [reset]);

  const handleSuggestion = useCallback(
    (term: string) => {
      apply({ query: term, category: null });
      searchRef.current?.focus();
    },
    [apply]
  );

  const isEmpty = results.length === 0;

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <p className={styles.eyebrow}>
          <span className={styles.liveDot} aria-hidden="true" />
          <span>
            {liveCount} live on *.deviloper.dev
            <span className={styles.eyebrowMore}> · more on the way</span>
          </span>
        </p>
        <h1 id="home-title" className={styles.title}>
          {site.tagline}
        </h1>
        <p className={styles.lede}>{site.description}</p>

        <div className={styles.controls}>
          <SearchBox ref={searchRef} value={query} onChange={setQuery} />
          <CategoryChips
            categories={CATEGORIES}
            selected={category}
            counts={counts}
            onSelect={setCategory}
          />
        </div>
      </section>

      <section
        id="catalog"
        className={styles.results}
        aria-labelledby="results-heading"
      >
        <div className={styles.resultsHeader}>
          <h2 id="results-heading" className={styles.resultsTitle}>
            {resultsTitle(query, category)}
          </h2>
          <p className={styles.count} aria-live="polite" aria-atomic="true">
            {countLabel(results.length)}
          </p>
        </div>

        {isEmpty ? (
          <EmptyState
            query={query}
            categoryLabel={category ? CATEGORY_LABELS[category] : undefined}
            suggestions={SUGGESTIONS}
            onSuggestion={handleSuggestion}
            onClear={handleClear}
          />
        ) : (
          <AppGrid apps={results} animate={animate} />
        )}
      </section>

      <section className={styles.why} aria-labelledby="why-heading">
        <h2 id="why-heading" className={styles.whyTitle}>
          Built to get out of your way
        </h2>
        <ul className={styles.benefits} role="list">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className={styles.benefit}>
              <h3 className={styles.benefitTitle}>{benefit.title}</h3>
              <p className={styles.benefitBody}>{benefit.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default HomePage;
