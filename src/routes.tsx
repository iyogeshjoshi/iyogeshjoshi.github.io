import type { ReactElement } from 'react';

import { apps, site } from '@/catalog';
import type { PublicApp } from '@/catalog';
import { appDetailPath } from '@/components/catalog';
import { Layout } from '@/components/layout';
import {
  AppDetailPage,
  appDetailPaths,
  getAppDetailMeta,
} from '@/pages/app-detail';
import { HomePage } from '@/pages/home/HomePage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { SITE_PAGES } from '@/pages/shared/sitePages';
import { SITE_NAME } from '@/seo/head';
import type { RouteMeta } from '@/seo/head';
import {
  appBreadcrumbJsonLd,
  itemListJsonLd,
  webApplicationJsonLd,
  websiteJsonLd,
} from '@/seo/jsonLd';

/**
 * Single route registry (D2: MPA). The prerender writes one HTML file per
 * route; the client resolves the same route from `location.pathname` and
 * hydrates it. Pages are static imports so the server markup and the first
 * client render are identical (no lazy boundary to suspend during hydration).
 */

export type { RouteMeta };

export interface Route {
  path: string;
  meta: RouteMeta;
  render: () => ReactElement;
  /** The catalog app a detail route belongs to. */
  app?: PublicApp;
}

export const HOME_TITLE = `${SITE_NAME} — Side projects, small tools & games`;
export const NOT_FOUND_PATH = '/404.html';

const SUFFIX = ` | ${SITE_NAME}`;

export function withSiteSuffix(title: string): string {
  return title.endsWith(SUFFIX) ? title : `${title}${SUFFIX}`;
}

/** Large preview for OG: a dedicated `og` crop if present, else the light shot. */
export function appOgImage(app: PublicApp): string | undefined {
  return app.preview?.og ?? app.preview?.light;
}

function page(path: string, meta: RouteMeta, body: ReactElement): Route {
  return {
    path,
    meta,
    render: () => <Layout currentPath={path}>{body}</Layout>,
  };
}

function detailApps(): PublicApp[] {
  const paths = new Set(appDetailPaths());
  return apps.filter((app) => paths.has(appDetailPath(app.slug)));
}

function buildRoutes(): Route[] {
  const detail = detailApps();

  const home = page(
    '/',
    {
      title: HOME_TITLE,
      description: site.description,
      path: '/',
      jsonLd: [
        websiteJsonLd(site),
        itemListJsonLd(
          detail.map((app) => ({
            name: app.name,
            path: appDetailPath(app.slug),
          }))
        ),
      ],
    },
    <HomePage />
  );

  const appRoutes = detail.map((app): Route => {
    const meta = getAppDetailMeta(app.slug);
    const ogImage = appOgImage(app);
    return {
      ...page(
        meta.path,
        {
          title: withSiteSuffix(meta.title),
          description: meta.description,
          path: meta.path,
          ogImage,
          jsonLd: [
            webApplicationJsonLd(app, meta.description, ogImage),
            appBreadcrumbJsonLd(app, meta.path),
          ],
        },
        <AppDetailPage slug={app.slug} />
      ),
      app,
    };
  });

  const siteRoutes = SITE_PAGES.map(({ Component, meta }) =>
    page(
      meta.path,
      {
        title: withSiteSuffix(meta.title),
        description: meta.description,
        path: meta.path,
      },
      <Component />
    )
  );

  const notFound = page(
    NOT_FOUND_PATH,
    {
      title: withSiteSuffix('Page not found'),
      description: 'This page does not exist. Search the catalog instead.',
      path: NOT_FOUND_PATH,
      noindex: true,
    },
    <NotFoundPage />
  );

  return [home, ...appRoutes, ...siteRoutes, notFound];
}

export const routes: readonly Route[] = Object.freeze(buildRoutes());

const BY_PATH = new Map(routes.map((route) => [route.path, route]));

/** `/apps/x` → `/apps/x/`, `/index.html` → `/`, strips query and hash. */
export function normalizePath(pathname: string): string {
  let path = pathname.split(/[?#]/)[0] || '/';
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/{2,}/g, '/');
  if (path.endsWith('/index.html')) path = path.slice(0, -'index.html'.length);
  if (!path.endsWith('/') && !path.endsWith('.html')) path = `${path}/`;
  return path;
}

export function resolveRoute(pathname: string): Route {
  return (
    BY_PATH.get(normalizePath(pathname)) ??
    (BY_PATH.get(NOT_FOUND_PATH) as Route)
  );
}
