/** Per-app steps run after load and before the screenshot, so previews show the app "alive". */

/** Minimal page surface the actions need (satisfied by Playwright's Page). */
export interface ActionPage {
  locator(selector: string): {
    first(): {
      click(options?: { timeout?: number }): Promise<void>;
      fill(value: string, options?: { timeout?: number }): Promise<void>;
    };
  };
  waitForTimeout(ms: number): Promise<void>;
}

export type PreviewAction = (page: ActionPage) => Promise<void>;

export const CHARCAP_SAMPLE_TEXT =
  'Writing a launch post? CharCap shows how much room you have left on every platform.';

const wait =
  (ms: number): PreviewAction =>
  (page) =>
    page.waitForTimeout(ms);

/** Runs a step; a missing selector logs a warning and capture continues. */
async function tolerant(
  label: string,
  step: () => Promise<void>
): Promise<void> {
  try {
    await step();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`warn ${label}: ${msg.split('\n')[0]}`);
  }
}

export const PREVIEW_ACTIONS: Readonly<Record<string, PreviewAction>> = {
  'game-of-life': async (page) => {
    await tolerant('game-of-life Random', () =>
      page.locator('#random, button:has-text("Random")').first().click({
        timeout: 3000,
      })
    );
    await tolerant('game-of-life Start', () =>
      page.locator('#start, button:has-text("Start")').first().click({
        timeout: 3000,
      })
    );
    await page.waitForTimeout(2500);
  },
  charcap: async (page) => {
    await tolerant('charcap textarea', () =>
      page
        .locator('textarea')
        .first()
        .fill(CHARCAP_SAMPLE_TEXT, { timeout: 3000 })
    );
    await page.waitForTimeout(500);
  },
  'ping-pong': wait(2000),
  primordia: wait(4000),
};

export function getPreviewAction(slug: string): PreviewAction | undefined {
  return Object.prototype.hasOwnProperty.call(PREVIEW_ACTIONS, slug)
    ? PREVIEW_ACTIONS[slug]
    : undefined;
}

/** Runs the app's action if any; never throws. */
export async function runPreviewAction(
  slug: string,
  page: ActionPage
): Promise<void> {
  const action = getPreviewAction(slug);
  if (!action) return;
  await tolerant(`${slug} action`, () => action(page));
}

/** Optional framing: clip the screenshot to an element, then letterbox onto a solid colour. */
export interface PreviewFraming {
  /** Element whose bounding box is captured. */
  selector: string;
  /** Letterbox background (matches the element's own backdrop). */
  background: string;
}

export const PREVIEW_FRAMING: Readonly<Record<string, PreviewFraming>> = {
  'ping-pong': { selector: '#canvas', background: '#000' },
};

export function getPreviewFraming(slug: string): PreviewFraming | undefined {
  return Object.prototype.hasOwnProperty.call(PREVIEW_FRAMING, slug)
    ? PREVIEW_FRAMING[slug]
    : undefined;
}
