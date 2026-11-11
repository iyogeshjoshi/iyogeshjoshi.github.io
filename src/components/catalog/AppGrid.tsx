import React from 'react';
import { AnimatePresence, LayoutGroup, LazyMotion, m } from 'framer-motion';
import type { FeatureBundle, Transition } from 'framer-motion';

import type { PublicApp } from '@/catalog';
import { AppCard } from './AppCard';
import styles from './AppGrid.module.css';

export interface AppGridProps {
  apps: readonly PublicApp[];
  /**
   * Animate reflow, enter and exit. Pass `false` for reduced motion and for
   * the first client render, so hydration matches the prerendered HTML.
   */
  animate?: boolean;
  /** Cards that load their preview eagerly (first row). */
  priorityCount?: number;
}

const loadFeatures = (): Promise<FeatureBundle> =>
  import('./motionFeatures').then((mod) => mod.default);

const TRANSITION: Transition = {
  duration: 0.3,
  ease: [0.2, 0.8, 0.2, 1],
};

const HIDDEN = { opacity: 0, scale: 0.96 };
const SHOWN = { opacity: 1, scale: 1 };

/** Responsive card grid with animated filtering (framer-motion `layout`). */
export const AppGrid: React.FC<AppGridProps> = ({
  apps,
  animate = true,
  priorityCount = 3,
}) => (
  <LazyMotion features={loadFeatures}>
    <LayoutGroup id="catalog-grid">
      <ul className={styles.grid} role="list">
        <AnimatePresence initial={false} mode="popLayout">
          {apps.map((app, index) => (
            <m.li
              key={app.slug}
              className={styles.item}
              layout={animate ? 'position' : false}
              initial={animate ? HIDDEN : false}
              animate={SHOWN}
              exit={animate ? HIDDEN : undefined}
              transition={animate ? TRANSITION : { duration: 0 }}
            >
              <AppCard app={app} priority={index < priorityCount} />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </LayoutGroup>
  </LazyMotion>
);
