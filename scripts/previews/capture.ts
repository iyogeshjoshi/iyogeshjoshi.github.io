/**
 * Captures light/dark × desktop/mobile screenshots of every public app.
 *
 *   npm run previews [-- <slug> ...] [--no-write-yaml]
 *
 * Ad, analytics and consent traffic is blocked so captures never create invalid
 * ad impressions (PRD §5.6).
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import sharp from 'sharp';

import { parseCatalog } from '../../src/catalog/load';
import { runPreviewAction } from './actions';
import {
  HIDE_BANNERS_CSS,
  DEDUPE_THUMB_HEIGHT,
  DEDUPE_THUMB_WIDTH,
  agnosticPath,
  isThemeAgnostic,
  MAX_WEBP_BYTES,
  OG_HEIGHT,
  OG_WIDTH,
  QUALITY_STEPS,
  THEMES,
  applyPreviewFields,
  VIEWPORTS,
  isBlockedUrl,
  ogPath,
  previewPath,
  selectCapturable,
} from './helpers';
import type { Theme, ViewportSpec } from './helpers';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CATALOG_PATH = resolve(ROOT, 'src/data/catalog.yaml');
const PUBLIC_DIR = resolve(ROOT, 'public');
const ATTEMPTS = 2;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function toWebp(png: Buffer, vp: ViewportSpec): Promise<Buffer> {
  let out = Buffer.alloc(0);
  for (const quality of QUALITY_STEPS) {
    out = await sharp(png)
      .resize(vp.outWidth, vp.outHeight, { fit: 'cover', position: 'top' })
      .webp({ quality })
      .toBuffer();
    if (out.length <= MAX_WEBP_BYTES) break;
  }
  return out;
}

async function screenshot(
  browser: Browser,
  slug: string,
  url: string,
  theme: Theme,
  vp: ViewportSpec
): Promise<Buffer> {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    colorScheme: theme,
  });
  try {
    await context.route('**/*', (route) =>
      isBlockedUrl(route.request().url()) ? route.abort() : route.continue()
    );
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page
      .waitForLoadState('networkidle', { timeout: 20_000 })
      .catch(() => undefined);
    await sleep(1500);
    await runPreviewAction(slug, page);
    await page.addStyleTag({ content: HIDE_BANNERS_CSS });
    // Fallback for banners with no recognisable class/id: fixed overlays that say "cookies".
    await page.evaluate(`(() => {
      for (const el of Array.from(document.body.querySelectorAll('*'))) {
        const text = el.textContent || '';
        if (
          getComputedStyle(el).position === 'fixed' &&
          /uses cookies|cookie consent/i.test(text) &&
          text.length < 400
        ) {
          el.style.setProperty('display', 'none', 'important');
        }
      }
    })()`);
    return await page.screenshot({ type: 'png' });
  } finally {
    await context.close();
  }
}

async function withRetries<T>(fn: () => Promise<T>): Promise<T> {
  let last: unknown;
  for (let i = 0; i < ATTEMPTS; i++) {
    try {
      return await fn();
    } catch (error) {
      last = error;
    }
  }
  throw last;
}

async function thumb(png: Buffer): Promise<Uint8Array> {
  return new Uint8Array(
    await sharp(png)
      .resize(DEDUPE_THUMB_WIDTH, DEDUPE_THUMB_HEIGHT, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer()
  );
}

function removeIfExists(rel: string): void {
  const file = resolve(PUBLIC_DIR, `.${rel}`);
  if (existsSync(file)) unlinkSync(file);
}

function updateYaml(
  captured: Map<string, boolean>,
  agnostic: Set<string>
): void {
  const text = readFileSync(CATALOG_PATH, 'utf8');
  const next = applyPreviewFields(
    text,
    Array.from(captured)
      .filter(([, ok]) => ok)
      .map(([slug]) => slug),
    agnostic
  );
  if (next !== text) writeFileSync(CATALOG_PATH, next);
  // Re-validate what we wrote.
  parseCatalog(readFileSync(CATALOG_PATH, 'utf8'));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const writeYaml = !args.includes('--no-write-yaml');
  const slugs = args.filter((a) => !a.startsWith('--'));
  const catalog = parseCatalog(readFileSync(CATALOG_PATH, 'utf8'));
  const apps = selectCapturable(catalog.apps, slugs);
  if (apps.length === 0) {
    console.error('No capturable apps matched.');
    process.exit(1);
  }

  mkdirSync(resolve(PUBLIC_DIR, 'previews'), { recursive: true });
  const browser = await chromium.launch();
  const failures: string[] = [];
  const fullyCaptured = new Map<string, boolean>();
  const agnostic = new Set<string>();

  try {
    for (const app of apps) {
      let okShots = 0;
      let total = 0;
      const unthemed: boolean[] = [];
      for (const vp of VIEWPORTS) {
        total += THEMES.length;
        const shots = new Map<Theme, Buffer>();
        for (const theme of THEMES) {
          const rel = previewPath(app.slug, theme, vp.name);
          try {
            shots.set(
              theme,
              await withRetries(() =>
                screenshot(browser, app.slug, app.url, theme, vp)
              )
            );
            okShots++;
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            failures.push(`${rel}: ${msg.split('\n')[0]}`);
            console.error(`FAIL ${rel}: ${msg.split('\n')[0]}`);
          }
        }
        const light = shots.get('light');
        const dark = shots.get('dark');
        if (!light || !dark) continue;
        // Desktop decides; mobile follows (random layouts differ on small grids).
        const same =
          unthemed.length > 0
            ? unthemed[0]
            : isThemeAgnostic(await thumb(light), await thumb(dark));
        unthemed.push(same);
        const outputs: [string, Buffer][] = same
          ? [[agnosticPath(app.slug, vp.name), light]]
          : [
              [previewPath(app.slug, 'light', vp.name), light],
              [previewPath(app.slug, 'dark', vp.name), dark],
            ];
        if (same) {
          for (const t of THEMES)
            removeIfExists(previewPath(app.slug, t, vp.name));
        } else {
          removeIfExists(agnosticPath(app.slug, vp.name));
        }
        for (const [rel, png] of outputs) {
          const webp = await toWebp(png, vp);
          writeFileSync(resolve(PUBLIC_DIR, `.${rel}`), webp);
          console.log(`ok   ${rel} ${(webp.length / 1024).toFixed(1)} KB`);
        }
        if (vp.name === 'desktop') {
          const og = await sharp(light)
            .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'top' })
            .png({ compressionLevel: 9, palette: true, quality: 80 })
            .toBuffer();
          writeFileSync(resolve(PUBLIC_DIR, `.${ogPath(app.slug)}`), og);
          console.log(
            `ok   ${ogPath(app.slug)} ${(og.length / 1024).toFixed(1)} KB`
          );
        }
      }
      // The catalog references the desktop shots, so desktop decides the YAML shape.
      if (unthemed[0]) agnostic.add(app.slug);
      fullyCaptured.set(app.slug, okShots === total);
      if (okShots === 0) console.error(`App ${app.slug} failed entirely`);
    }
  } finally {
    await browser.close();
  }

  if (writeYaml) updateYaml(fullyCaptured, agnostic);

  if (failures.length > 0) {
    console.error(
      `\n${failures.length} shot(s) failed:\n${failures.join('\n')}`
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
