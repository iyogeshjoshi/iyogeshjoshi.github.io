import { describe, expect, it } from 'vitest';
import {
  apps,
  categoriesInUse,
  CATEGORY_LABELS,
  getApp,
  liveCount,
  relatedApps,
  site,
} from './index';

describe('catalog module (virtual:catalog)', () => {
  it('exposes the site block', () => {
    expect(site.name).toBe('deviloper.dev');
    expect(site.email).toBe('hello@deviloper.dev');
  });

  it('contains only public apps', () => {
    expect(apps.length).toBe(5);
    for (const app of apps) {
      expect(['live', 'beta', 'coming-soon']).toContain(app.status);
    }
    expect(getApp('verdict')).toBeUndefined();
    expect(JSON.stringify(apps).toLowerCase()).not.toContain('verdict');
  });

  it('sorts featured apps first, then by name', () => {
    expect(apps.map((app) => app.slug)).toEqual([
      'charcap',
      'online-ruler',
      'game-of-life',
      'ping-pong',
      'primordia',
    ]);
  });

  it('derives categories, live count and related apps from public data', () => {
    expect(categoriesInUse()).toEqual(['tool', 'game', 'simulation']);
    expect(categoriesInUse().map((c) => CATEGORY_LABELS[c])).toEqual([
      'Tools',
      'Games',
      'Simulations',
    ]);
    expect(liveCount).toBe(5);
    expect(relatedApps('online-ruler').map((app) => app.slug)).toEqual([
      'charcap',
    ]);
    expect(relatedApps('primordia')[0].slug).toBe('game-of-life');
  });

  it('is frozen', () => {
    expect(Object.isFrozen(apps)).toBe(true);
  });
});
