/** Per-route metadata consumed by the prerender/SEO step. */
export interface PageMeta {
  /** Page title without the site-name suffix. */
  title: string;
  /** Meta description (≤ ~160 characters). */
  description: string;
  /** Canonical path, e.g. `/about/` or `/privacy-policy.html`. */
  path: string;
}
