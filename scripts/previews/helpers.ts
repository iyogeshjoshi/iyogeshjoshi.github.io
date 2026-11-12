import type { App } from '../../src/catalog/schema';

/** Requests matching this are aborted during capture so no ad/analytics traffic is generated (PRD §5.6). */
export const BLOCKED_URL_RE =
  /googlesyndication|doubleclick|googletagmanager|google-analytics|googleadservices|adservice\.google|fundingchoicesmessages|adtrafficquality|cloudflareinsights/i;

export function isBlockedUrl(url: string): boolean {
  return BLOCKED_URL_RE.test(url);
}

/** Hides consent/cookie overlays only; never matches app content containers by tag. */
export const HIDE_BANNERS_CSS = `.fc-consent-root, #cookie-banner, [class*="cookie" i], [id*="consent" i], [class*="consent" i], [role="dialog"][aria-label*="cookie" i], [role="dialog"][aria-label*="consent" i] { display: none !important; }`;

export type Theme = 'light' | 'dark';
export type ViewportName = 'desktop' | 'mobile';

export interface ViewportSpec {
  name: ViewportName;
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  /** Final output size. */
  outWidth: number;
  outHeight: number;
}

export const THEMES: readonly Theme[] = ['light', 'dark'];

export const VIEWPORTS: readonly ViewportSpec[] = [
  {
    name: 'desktop',
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    outWidth: 960,
    outHeight: 600,
  },
  {
    name: 'mobile',
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    outWidth: 390,
    outHeight: 844,
  },
];

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const MAX_WEBP_BYTES = 80 * 1024;
export const QUALITY_STEPS = [80, 75, 70, 65, 60] as const;

/** Web path (as stored in catalog.yaml) of a screenshot. */
export function previewPath(
  slug: string,
  theme: Theme,
  viewport: ViewportName = 'desktop'
): string {
  return `/previews/${slug}-${theme}${viewport === 'mobile' ? '-mobile' : ''}.webp`;
}

export function ogPath(slug: string): string {
  return `/previews/${slug}-og.png`;
}

/** Only live/beta apps are captured: never private, draft or coming-soon. */
export function selectCapturable<T extends Pick<App, 'slug' | 'status'>>(
  apps: readonly T[],
  slugs: readonly string[] = []
): T[] {
  return apps.filter(
    (app) =>
      (app.status === 'live' || app.status === 'beta') &&
      (slugs.length === 0 || slugs.includes(app.slug))
  );
}

/**
 * Text-level edit of catalog.yaml (keeps comments and folded scalars intact).
 * Sets/replaces a `preview:` block right after each listed app's `previewKind:` line.
 * Idempotent: running twice yields the same text.
 */
export function applyPreviewFields(
  yamlText: string,
  slugs: readonly string[]
): string {
  const lines = yamlText.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const start = /^ {2}- slug: (\S+)\s*$/.exec(lines[i]);
    if (!start || !slugs.includes(start[1])) {
      out.push(lines[i++]);
      continue;
    }
    const slug = start[1];
    let end = i + 1;
    while (end < lines.length && !/^ {2}- slug: /.test(lines[end])) end++;
    const block: string[] = [];
    for (let j = i; j < end; j++) {
      if (/^ {4}preview:\s*$/.test(lines[j])) {
        j++;
        while (j < end && /^ {6}\S/.test(lines[j])) j++;
        j--;
        continue;
      }
      block.push(lines[j]);
    }
    const at = block.findIndex((l) => /^ {4}previewKind:/.test(l));
    if (at === -1) throw new Error(`apps/${slug}: no previewKind line found`);
    block.splice(
      at + 1,
      0,
      '    preview:',
      `      light: ${previewPath(slug, 'light')}`,
      `      dark: ${previewPath(slug, 'dark')}`,
      `      og: ${ogPath(slug)}`
    );
    out.push(...block);
    i = end;
  }
  return out.join('\n');
}
