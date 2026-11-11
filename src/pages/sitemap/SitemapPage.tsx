import React from 'react';

import { CATEGORY_LABELS, apps, categoriesInUse, site } from '../../catalog';
import { ProsePage, ProseSection } from '../shared';
import type { PageMeta } from '../shared';

export const meta: PageMeta = {
  title: 'Sitemap',
  description:
    'Every page on deviloper.dev in one place: the catalog home, a page for each tool, game and simulation with a link to the live app, and the site pages.',
  path: '/sitemap.html',
};

const siteHost = new URL(site.url).host;

const SITE_PAGES = [
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
  { href: '/privacy-policy.html', label: 'Privacy policy' },
  { href: '/terms.html', label: 'Terms of use' },
] as const;

export const SitemapPage: React.FC = () => (
  <ProsePage
    eyebrow="Sitemap"
    title="Sitemap"
    lead={`Every page on ${siteHost}, generated from the catalog.`}
  >
    <ProseSection id="home" title="Home">
      <ul>
        <li>
          <a href="/">Catalog home</a>: all apps, with search and category
          filters
        </li>
      </ul>
    </ProseSection>

    <ProseSection id="apps" title="Apps">
      {categoriesInUse().map((category) => (
        <React.Fragment key={category}>
          <h3>{CATEGORY_LABELS[category]}</h3>
          <ul>
            {apps
              .filter((app) => app.category === category)
              .map((app) => (
                <li key={app.slug}>
                  <a href={`/apps/${app.slug}/`}>{app.name}</a>: {app.tagline} (
                  <a href={app.url}>open {new URL(app.url).host}</a>)
                </li>
              ))}
          </ul>
        </React.Fragment>
      ))}
    </ProseSection>

    <ProseSection id="site-pages" title="Site pages">
      <ul>
        {SITE_PAGES.map((page) => (
          <li key={page.href}>
            <a href={page.href}>{page.label}</a>
          </li>
        ))}
      </ul>
    </ProseSection>

    <ProseSection id="for-search-engines" title="For search engines">
      <p>
        A machine-readable version is available as an{' '}
        <a href="/sitemap.xml">XML sitemap</a>.
      </p>
    </ProseSection>
  </ProsePage>
);

export default SitemapPage;
