/** Typed, never-throwing GA4 event wrapper. No-op without `window.gtag`. */

export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;

type Gtag = (command: 'event', name: string, params?: object) => void;

export function track(event: string, params: AnalyticsParams = {}): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag !== 'function') return;
  try {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    );
    gtag('event', event, clean);
  } catch {
    // Analytics must never break the page.
  }
}
