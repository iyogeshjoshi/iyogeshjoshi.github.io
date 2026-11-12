import { CATEGORY_LABELS } from '@/catalog';
import type { Category, PublicApp, Site } from '@/catalog';
import { SITE_ORIGIN, absoluteUrl } from './head';
import type { JsonLd } from './head';

/** schema.org structured data builders (PRD §5.9 H5). */

const PERSON: JsonLd = {
  '@type': 'Person',
  name: 'Yogesh Joshi',
  url: `${SITE_ORIGIN}/about/`,
};

const APPLICATION_CATEGORY: Readonly<Record<Category, string>> = {
  tool: 'UtilitiesApplication',
  game: 'GameApplication',
  simulation: 'EducationalApplication',
  app: 'WebApplication',
};

export function websiteJsonLd(site: Site): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: `${SITE_ORIGIN}/`,
    description: site.description,
    author: PERSON,
    publisher: PERSON,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_ORIGIN}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function itemListJsonLd(
  items: readonly { name: string; path: string }[]
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export function webApplicationJsonLd(
  app: PublicApp,
  description: string,
  image?: string
): JsonLd {
  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: app.name,
    description,
    url: app.url,
    applicationCategory: APPLICATION_CATEGORY[app.category],
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: PERSON,
    publisher: PERSON,
  };
  if (image) data.image = absoluteUrl(image);
  if (app.launchedAt) data.datePublished = app.launchedAt;
  if (app.updatedAt) data.dateModified = app.updatedAt;
  return data;
}

/** Mirrors the visible breadcrumbs on the detail page. */
export function appBreadcrumbJsonLd(app: PublicApp, path: string): JsonLd {
  const label = CATEGORY_LABELS[app.category];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_ORIGIN}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: label,
        item: `${SITE_ORIGIN}/?category=${label.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: app.name,
        item: absoluteUrl(path),
      },
    ],
  };
}
