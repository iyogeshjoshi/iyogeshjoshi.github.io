/**
 * Thin, optional GA4 hook (PRD A7). Phase 9 installs `gtag` behind Consent
 * Mode; until then (and in tests, SSR, or with blockers) every call is a no-op.
 */

type Gtag = (command: 'event', name: string, params?: object) => void;

export type CatalogEvent =
  | 'search'
  | 'filter_category'
  | 'select_content'
  | 'outbound_app_open';

export function trackEvent(name: CatalogEvent, params: object = {}): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag !== 'function') return;
  try {
    gtag('event', name, params);
  } catch {
    // Analytics must never break the page.
  }
}
