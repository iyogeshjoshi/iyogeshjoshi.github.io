import type React from 'react';

import { AboutPage, meta as aboutMeta } from '../about';
import { ContactPage, meta as contactMeta } from '../contact';
import { PrivacyPolicyPage, meta as privacyMeta } from '../privacy';
import { SitemapPage, meta as sitemapMeta } from '../sitemap';
import { TermsPage, meta as termsMeta } from '../terms';
import type { PageMeta } from './types';

export interface SitePage {
  Component: React.FC;
  meta: PageMeta;
}

/** Static site pages (Phase 7), for the prerender and sitemap steps. */
export const SITE_PAGES: readonly SitePage[] = [
  { Component: AboutPage, meta: aboutMeta },
  { Component: ContactPage, meta: contactMeta },
  { Component: PrivacyPolicyPage, meta: privacyMeta },
  { Component: TermsPage, meta: termsMeta },
  { Component: SitemapPage, meta: sitemapMeta },
];
