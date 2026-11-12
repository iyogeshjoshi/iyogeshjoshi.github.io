import React, { useCallback } from 'react';

import { CATEGORY_LABELS_SINGULAR } from '@/catalog';
import type { PublicApp, Status } from '@/catalog';
import { trackEvent } from './analytics';
import { AppPreview } from './AppPreview';
import styles from './AppCard.module.css';

export interface AppCardProps {
  app: PublicApp;
  /** Load the preview eagerly (first row). */
  priority?: boolean;
  /** Heading level for the name; defaults to h3 (cards sit under an h2). */
  headingLevel?: 2 | 3 | 4;
}

export const STATUS_LABELS: Readonly<Record<Status, string>> = {
  live: 'Live',
  beta: 'Beta',
  'coming-soon': 'Coming soon',
  draft: 'Draft',
  private: 'Private',
};

export const MAX_CARD_TAGS = 3;

export function appDetailPath(slug: string): string {
  return `/apps/${slug}/`;
}

export function appHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }
}

/** Only a desktop is listed: the app needs a mouse or a big screen. */
export function isDesktopOnly(app: Pick<PublicApp, 'devices'>): boolean {
  return app.devices.length > 0 && app.devices.every((d) => d === 'desktop');
}

const OpenIcon: React.FC = () => (
  <svg
    className={styles.openIcon}
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

const DesktopIcon: React.FC = () => (
  <svg
    className={styles.badgeIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
);

/**
 * Catalog card. The whole card links to the detail page through a stretched
 * link on the name; "Open ↗" is a separate link to the app's subdomain,
 * layered above it. No interactive element is nested inside another.
 */
export const AppCard: React.FC<AppCardProps> = ({
  app,
  priority = false,
  headingLevel = 3,
}) => {
  const Heading = `h${headingLevel}` as 'h3';
  const host = appHost(app.url);
  const linkable = app.status !== 'coming-soon';
  const desktopOnly = isDesktopOnly(app);
  const visibleTags = app.tags.slice(0, MAX_CARD_TAGS);

  const handleSelect = useCallback(
    () =>
      trackEvent('select_content', {
        content_type: 'app',
        content_id: app.slug,
      }),
    [app.slug]
  );

  const handleOpen = useCallback(
    () =>
      trackEvent('outbound_app_open', {
        app_slug: app.slug,
        link_url: app.url,
        placement: 'card',
      }),
    [app.slug, app.url]
  );

  return (
    <article
      className={styles.card}
      data-status={app.status}
      data-slug={app.slug}
    >
      <AppPreview app={app} priority={priority} />

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>
            {CATEGORY_LABELS_SINGULAR[app.category]}
          </span>
          <span className={styles.badges}>
            {desktopOnly && (
              <span className={styles.deviceBadge} title="Best on desktop">
                <DesktopIcon />
                <span aria-hidden="true">Desktop</span>
                <span className="visually-hidden">Best on desktop</span>
              </span>
            )}
            <span className={styles.status} data-status={app.status}>
              {STATUS_LABELS[app.status]}
            </span>
          </span>
        </div>

        <Heading className={styles.name}>
          {linkable ? (
            <a
              className={styles.stretched}
              href={appDetailPath(app.slug)}
              onClick={handleSelect}
            >
              {app.name}
            </a>
          ) : (
            app.name
          )}
        </Heading>

        <p className={styles.tagline}>{app.tagline}</p>

        {visibleTags.length > 0 && (
          <ul className={styles.tags} aria-label="Tags">
            {visibleTags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.footer}>
          <span className={styles.host}>{host}</span>
          {linkable && (
            <a
              className={styles.open}
              href={app.url}
              rel="noopener"
              onClick={handleOpen}
            >
              Open
              <span className={styles.openName}> {app.name}</span>
              <OpenIcon />
              <span className="visually-hidden"> (opens {host})</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
