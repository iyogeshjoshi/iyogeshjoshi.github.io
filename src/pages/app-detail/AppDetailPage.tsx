import React, { useCallback } from 'react';

import {
  CATEGORY_LABELS,
  CATEGORY_LABELS_SINGULAR,
  apps,
  getApp,
  relatedApps,
} from '@/catalog';
import type { Device, PublicApp } from '@/catalog';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
  AppCard,
  AppPreview,
  STATUS_LABELS,
  appDetailPath,
  appHost,
  isDesktopOnly,
  trackEvent,
} from '@/components/catalog';
import { Container } from '@/components/layout';
import styles from './AppDetailPage.module.css';

export interface AppDetailPageProps {
  slug: string;
}

export interface AppDetailMeta {
  title: string;
  description: string;
  path: string;
}

const SITE_SUFFIX = ' | deviloper.dev';
const TITLE_MAX = 70;
const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 50;

/** Detail pages exist for live and beta apps only; coming-soon has none (D6). */
function hasDetailPage(app: PublicApp): boolean {
  return app.status === 'live' || app.status === 'beta';
}

export function appDetailPaths(): string[] {
  return apps.filter(hasDetailPage).map((app) => appDetailPath(app.slug));
}

function requireApp(slug: string): PublicApp {
  const app = getApp(slug);
  if (!app || !hasDetailPage(app)) {
    throw new Error(`AppDetailPage: no public detail page for slug "${slug}"`);
  }
  return app;
}

function sentences(text: string): string[] {
  return text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

/**
 * Description -> paragraphs. Blank lines win; a single folded paragraph is
 * split at the sentence boundary that makes the two halves closest in length.
 */
export function splitParagraphs(description: string): string[] {
  const blocks = description
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (blocks.length > 1) return blocks;

  const single = blocks[0] ?? '';
  const parts = sentences(single);
  if (parts.length < 2) return single ? [single] : [];

  const total = single.length;
  let best = 1;
  let bestDiff = Infinity;
  let running = 0;
  for (let i = 0; i < parts.length - 1; i += 1) {
    running += parts[i].length + 1;
    const diff = Math.abs(running - total / 2);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i + 1;
    }
  }
  return [parts.slice(0, best).join(' '), parts.slice(best).join(' ')];
}

export function getAppDetailMeta(slug: string): AppDetailMeta {
  const app = requireApp(slug);
  const full = `${app.name} — ${app.tagline}${SITE_SUFFIX}`;
  const title = full.length <= TITLE_MAX ? full : `${app.name}${SITE_SUFFIX}`;

  const first = sentences(app.description)[0] ?? '';
  const description =
    first.length >= DESCRIPTION_MIN && first.length <= DESCRIPTION_MAX
      ? first
      : app.tagline.length <= DESCRIPTION_MAX
        ? app.tagline
        : `${app.tagline.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…`;

  return { title, description, path: appDetailPath(slug) };
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** `2026-11-11` -> `11 Nov 2026`, independent of the host locale and zone. */
export function formatUpdated(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`)).replace(
    'Sept',
    'Sep'
  );
}

const DEVICE_LABELS: Readonly<Record<Device, string>> = {
  desktop: 'Desktop',
  tablet: 'tablet',
  phone: 'phone',
};

function formatDevices(devices: readonly Device[]): string {
  return devices.map((d) => DEVICE_LABELS[d]).join(', ');
}

const OpenIcon: React.FC = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

export const AppDetailPage: React.FC<AppDetailPageProps> = ({ slug }) => {
  const app = requireApp(slug);
  const host = appHost(app.url);
  const paragraphs = splitParagraphs(app.description);
  const related = relatedApps(slug, 3);
  const hasScreenshot = Boolean(app.preview?.light || app.preview?.dark);
  const categoryParam = CATEGORY_LABELS[app.category].toLowerCase();

  const handleOpen = useCallback(
    () =>
      trackEvent('outbound_app_open', {
        app_slug: app.slug,
        location: 'detail_hero',
      }),
    [app.slug]
  );

  return (
    <div
      className={styles.page}
      style={{ '--app-accent': app.accent } as React.CSSProperties}
    >
      <Container>
        <div className={styles.crumbs}>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              {
                label: CATEGORY_LABELS[app.category],
                href: `/?category=${categoryParam}`,
              },
              { label: app.name },
            ]}
          />
        </div>

        <section className={styles.hero} aria-labelledby="app-title">
          <div className={styles.heroText}>
            <div className={styles.eyebrow}>
              <span className={styles.accentDot} aria-hidden="true" />
              <span className={styles.category}>
                {CATEGORY_LABELS_SINGULAR[app.category]}
              </span>
              <span className={styles.status} data-status={app.status}>
                {STATUS_LABELS[app.status]}
              </span>
            </div>
            <h1 id="app-title" className={styles.title}>
              {app.name}
            </h1>
            <p className={styles.tagline}>{app.tagline}</p>
            <div className={styles.actions}>
              <a
                className={styles.primary}
                href={app.url}
                rel="noopener"
                onClick={handleOpen}
              >
                Open {app.name}
                <OpenIcon />
              </a>
              <a className={styles.secondary} href="/">
                Back to catalog
              </a>
            </div>
            <p className={styles.host}>{host}</p>
          </div>

          <figure className={styles.figure}>
            <div className={styles.frame}>
              <AppPreview app={app} priority />
            </div>
            {hasScreenshot && (
              <figcaption className={styles.caption}>
                Screenshot of {app.name}
              </figcaption>
            )}
          </figure>
        </section>

        <div className={styles.content}>
          <article className={styles.article}>
            <h2 className={styles.h2}>About {app.name}</h2>
            {paragraphs.map((text) => (
              <p key={text} className={styles.prose}>
                {text}
              </p>
            ))}

            <h3 className={styles.h3}>What you can do</h3>
            <ul className={styles.features}>
              {app.features.map((feature) => (
                <li key={feature} className={styles.feature}>
                  {feature}
                </li>
              ))}
            </ul>

            <h3 className={styles.h3}>How to use it</h3>
            <ol className={styles.steps}>
              {app.howTo.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            {app.controls && (
              <p className={styles.controls}>
                <strong>Controls:</strong> {app.controls}
              </p>
            )}
          </article>

          <aside className={styles.aside} aria-label="At a glance">
            <h2 className={styles.asideTitle}>At a glance</h2>
            <dl className={styles.facts}>
              <dt>Category</dt>
              <dd>{CATEGORY_LABELS_SINGULAR[app.category]}</dd>
              <dt>Works on</dt>
              <dd>{formatDevices(app.devices)}</dd>
              {app.controls && (
                <>
                  <dt>Controls</dt>
                  <dd>{app.controls}</dd>
                </>
              )}
              <dt>Price</dt>
              <dd>Free, no sign-up</dd>
              {app.updatedAt && (
                <>
                  <dt>Updated</dt>
                  <dd>{formatUpdated(app.updatedAt)}</dd>
                </>
              )}
            </dl>
            {isDesktopOnly(app) && (
              <p className={styles.callout} data-testid="desktop-callout">
                Best on a desktop or laptop — this one is designed for a mouse.
              </p>
            )}
            <div className={styles.privacy}>
              <p className={styles.privacyTitle}>Privacy</p>
              <p className={styles.privacyText}>{app.privacy}</p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="related-heading">
            <h2 id="related-heading" className={styles.h2}>
              More from the catalog
            </h2>
            <div className={styles.grid}>
              {related.map((item) => (
                <AppCard key={item.slug} app={item} headingLevel={3} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
};

export default AppDetailPage;
