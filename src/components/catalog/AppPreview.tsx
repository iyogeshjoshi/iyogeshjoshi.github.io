import React from 'react';

import type { PreviewKind, PublicApp } from '@/catalog';
import styles from './AppPreview.module.css';

/** Intrinsic size of captured screenshots (PRD P1, desktop 1280×800). */
export const PREVIEW_WIDTH = 1280;
export const PREVIEW_HEIGHT = 800;

export interface AppPreviewProps {
  app: Pick<PublicApp, 'slug' | 'name' | 'accent' | 'previewKind' | 'preview'>;
  /** Above-the-fold cards load eagerly with high fetch priority (PRD P6). */
  priority?: boolean;
  className?: string;
}

/* ---------- CSS illustrations (ported from design/project/Main.dc.html) ---------- */

/** Glider, blinker, block, etc. as [column, row] on a 14px grid. Fixed: no randomness. */
const LIFE_CELLS: readonly (readonly [number, number])[] = [
  [3, 1],
  [4, 2],
  [2, 3],
  [3, 3],
  [4, 3],
  [10, 2],
  [11, 2],
  [12, 2],
  [17, 4],
  [18, 4],
  [17, 5],
  [18, 5],
  [7, 7],
  [8, 7],
  [8, 8],
  [9, 8],
  [7, 9],
  [22, 1],
  [23, 2],
  [21, 3],
  [22, 3],
  [23, 3],
  [14, 9],
  [15, 9],
  [16, 9],
  [20, 8],
  [21, 9],
  [20, 10],
  [1, 8],
  [2, 9],
  [25, 6],
  [26, 6],
  [25, 7],
];

/** Organism hues (fixed art colours). */
const PRIM_HUES = ['#2DD4BF', '#F472B6', '#A78BFA', '#FBBF24', '#60A5FA'];

/** [left, top, size, hue index]. */
const PRIM_ORGS: readonly (readonly [number, number, number, number])[] = [
  [30, 40, 16, 0],
  [70, 120, 10, 1],
  [110, 70, 22, 2],
  [160, 130, 8, 3],
  [200, 50, 12, 0],
  [240, 110, 18, 4],
  [280, 60, 9, 1],
  [320, 140, 14, 2],
  [60, 160, 6, 3],
  [140, 30, 7, 4],
  [260, 160, 7, 0],
  [350, 80, 11, 3],
  [190, 95, 5, 1],
  [95, 95, 6, 4],
];

const RulerArt: React.FC = () => (
  <div className={styles.ruler}>
    <div className={styles.rulerBody} />
    <div className={styles.rulerGuide} />
    <span className={styles.rulerReading}>12.4 cm</span>
    <span className={styles.rulerMeta}>PPI 109 · calibrated</span>
  </div>
);

const CounterArt: React.FC = () => (
  <div className={styles.counter}>
    <div className={styles.counterEditor}>
      <div className={styles.line} style={{ width: '92%' }} />
      <div className={styles.line} style={{ width: '80%' }} />
      <div
        className={`${styles.line} ${styles.wideOnly}`}
        style={{ width: '86%' }}
      />
      <div className={styles.line} style={{ width: '48%' }} />
      <span className={styles.counterTotal}>214</span>
    </div>
    <div className={styles.counterLimits}>
      <div>
        <div className={styles.limitRow}>
          <span>X</span>
          <span>214/280</span>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: '76%' }} />
        </div>
      </div>
      <div className={styles.wideOnly}>
        <div className={styles.limitRow}>
          <span>Instagram</span>
          <span>214/2200</span>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: '10%' }} />
        </div>
      </div>
      <div>
        <div className={styles.limitRow}>
          <span>SMS</span>
          <span className={styles.over}>214/160</span>
        </div>
        <div className={`${styles.bar} ${styles.barOver}`} />
      </div>
    </div>
  </div>
);

const LifeArt: React.FC = () => (
  <div className={styles.life}>
    {LIFE_CELLS.map(([x, y]) => (
      <div
        key={`${x}-${y}`}
        className={styles.cell}
        style={{ left: x * 14 + 1, top: y * 14 + 1 }}
      />
    ))}
    <span className={styles.lifeGeneration}>Generation 128</span>
  </div>
);

const PongArt: React.FC = () => (
  <div className={styles.pong}>
    <div className={styles.pongNet} />
    <div className={`${styles.paddle} ${styles.paddleLeft}`} />
    <div className={`${styles.paddle} ${styles.paddleRight}`} />
    <div className={styles.ball} />
    <span className={styles.pongScore}>3 2</span>
  </div>
);

const PrimArt: React.FC = () => (
  <div className={styles.prim}>
    {PRIM_ORGS.map(([left, top, size, hue]) => {
      const color = PRIM_HUES[hue];
      return (
        <div
          key={`${left}-${top}`}
          className={styles.org}
          style={{
            left,
            top,
            width: size,
            height: size,
            background: color,
            boxShadow: `0 0 ${size + 6}px ${color}66`,
          }}
        />
      );
    })}
    <span className={styles.primMeta}>gen 42 · pop 318 · seed 7</span>
  </div>
);

/** P5 fallback: accent-tinted tile with the app's monogram. */
const GenericArt: React.FC<{ name: string }> = ({ name }) => (
  <div className={styles.generic}>
    <span className={styles.monogram}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  </div>
);

/** Kinds without an entry here (generic, or anything unillustrated) use GenericArt. */
const ART: Partial<Record<PreviewKind, React.FC>> = {
  ruler: RulerArt,
  counter: CounterArt,
  life: LifeArt,
  pong: PongArt,
  prim: PrimArt,
};

/* ---------- Screenshots ---------- */

interface ShotProps {
  src: string;
  variant?: 'light' | 'dark';
  priority: boolean;
}

const Shot: React.FC<ShotProps> = ({ src, variant, priority }) => (
  <picture className={`${styles.picture} ${variant ? styles[variant] : ''}`}>
    <img
      className={styles.img}
      src={src}
      alt=""
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      // React 18 only knows the lowercase DOM attribute.
      {...{ fetchpriority: priority ? 'high' : 'auto' }}
    />
  </picture>
);

/**
 * Card / hero preview. Uses the captured screenshots when the catalog has
 * them (both themes are rendered and CSS shows the one matching
 * `[data-theme]`, so a manual theme override is respected); otherwise draws
 * the app's CSS illustration. Decorative either way: the card names the app.
 */
export const AppPreview: React.FC<AppPreviewProps> = ({
  app,
  priority = false,
  className,
}) => {
  const { light, dark } = app.preview ?? {};
  const Art = ART[app.previewKind] ?? null;

  return (
    <div
      className={className ? `${styles.preview} ${className}` : styles.preview}
      style={
        {
          viewTransitionName: `app-${app.slug}`,
          '--app-accent': app.accent,
        } as React.CSSProperties
      }
      aria-hidden="true"
      data-preview={light || dark ? 'image' : Art ? app.previewKind : 'generic'}
    >
      {light && dark ? (
        <>
          <Shot src={light} variant="light" priority={priority} />
          <Shot src={dark} variant="dark" priority={priority} />
        </>
      ) : light || dark ? (
        <Shot src={(light ?? dark) as string} priority={priority} />
      ) : Art ? (
        <Art />
      ) : (
        <GenericArt name={app.name} />
      )}
    </div>
  );
};
