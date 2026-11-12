/**
 * Preview capture for a single catalog entry, any status (drafts included).
 *
 * `scripts/previews/capture.ts` runs on import and only captures live/beta
 * apps, so this module reuses its helpers (viewports, ad/analytics blocking,
 * banner hiding, paths, the YAML preview-field writer) for the add-app flow.
 * Playwright and sharp are imported lazily so the CLI and Studio load fast
 * and `--no-previews` works without a browser installed.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseCatalog } from '../../src/catalog/load';
import {
  HIDE_BANNERS_CSS,
  MAX_WEBP_BYTES,
  OG_HEIGHT,
  OG_WIDTH,
  QUALITY_STEPS,
  THEMES,
  VIEWPORTS,
  applyPreviewFields,
  isBlockedUrl,
  ogPath,
  previewPath,
} from '../previews/helpers';
import { validateCatalogText } from './core';

export interface CaptureOptions {
  /** catalog.yaml path. */
  catalogFile: string;
  /** Directory that holds `previews/` (the repo's `public/`). */
  publicDir: string;
  log?: (line: string) => void;
}

export interface CaptureResult {
  slug: string;
  written: string[];
  failures: string[];
  /** True when every shot succeeded and the YAML `preview:` block was set. */
  updatedYaml: boolean;
}

export async function capturePreviews(
  slug: string,
  options: CaptureOptions
): Promise<CaptureResult> {
  const log = options.log ?? (() => undefined);
  const catalog = parseCatalog(readFileSync(options.catalogFile, 'utf8'));
  const app = catalog.apps.find((a) => a.slug === slug);
  if (!app) throw new Error(`No app with slug "${slug}" in the catalog`);

  const { chromium } = await import('playwright');
  const sharp = (await import('sharp')).default;

  mkdirSync(resolve(options.publicDir, 'previews'), { recursive: true });
  const written: string[] = [];
  const failures: string[] = [];
  const browser = await chromium.launch();
  try {
    for (const theme of THEMES) {
      for (const vp of VIEWPORTS) {
        const rel = previewPath(slug, theme, vp.name);
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: vp.deviceScaleFactor,
          isMobile: vp.isMobile,
          hasTouch: vp.hasTouch,
          colorScheme: theme,
        });
        try {
          await context.route('**/*', (route) =>
            isBlockedUrl(route.request().url())
              ? route.abort()
              : route.continue()
          );
          const page = await context.newPage();
          await page.goto(app.url, {
            waitUntil: 'domcontentloaded',
            timeout: 30_000,
          });
          await page
            .waitForLoadState('networkidle', { timeout: 20_000 })
            .catch(() => undefined);
          await page.waitForTimeout(1500);
          await page.addStyleTag({ content: HIDE_BANNERS_CSS });
          const png = await page.screenshot({ type: 'png' });

          let webp = Buffer.alloc(0);
          for (const quality of QUALITY_STEPS) {
            webp = await sharp(png)
              .resize(vp.outWidth, vp.outHeight, {
                fit: 'cover',
                position: 'top',
              })
              .webp({ quality })
              .toBuffer();
            if (webp.length <= MAX_WEBP_BYTES) break;
          }
          writeFileSync(resolve(options.publicDir, `.${rel}`), webp);
          written.push(rel);
          log(`ok   ${rel} ${(webp.length / 1024).toFixed(1)} KB`);

          if (theme === 'light' && vp.name === 'desktop') {
            const og = await sharp(png)
              .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'top' })
              .png({ compressionLevel: 9, palette: true })
              .toBuffer();
            writeFileSync(resolve(options.publicDir, `.${ogPath(slug)}`), og);
            written.push(ogPath(slug));
            log(`ok   ${ogPath(slug)} ${(og.length / 1024).toFixed(1)} KB`);
          }
        } catch (error) {
          const msg = (
            error instanceof Error ? error.message : String(error)
          ).split('\n')[0];
          failures.push(`${rel}: ${msg}`);
          log(`FAIL ${rel}: ${msg}`);
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  let updatedYaml = false;
  if (failures.length === 0) {
    const text = readFileSync(options.catalogFile, 'utf8');
    const next = applyPreviewFields(text, [slug]);
    validateCatalogText(next);
    if (next !== text) writeFileSync(options.catalogFile, next);
    updatedYaml = true;
  }
  return { slug, written, failures, updatedYaml };
}
