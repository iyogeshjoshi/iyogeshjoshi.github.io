import { describe, expect, it } from 'vitest';
import {
  categoriesInUse,
  countLive,
  filterApps,
  findApp,
  relatedApps,
  searchApps,
  sortApps,
} from './query';
import type { App } from './schema';

function app(overrides: Partial<App> & Pick<App, 'slug'>): App {
  return {
    name: overrides.slug,
    url: `https://${overrides.slug}.deviloper.dev`,
    category: 'tool',
    status: 'live',
    featured: false,
    tagline: '',
    description: '',
    features: [],
    howTo: [],
    tags: [],
    privacy: '',
    devices: ['desktop'],
    accent: '#000000',
    requiresAccount: false,
    previewKind: 'generic',
    ...overrides,
  };
}

const ruler = app({
  slug: 'online-ruler',
  name: 'Online Ruler',
  category: 'tool',
  featured: true,
  tagline: 'An actual-size ruler on your screen.',
  tags: ['measurement', 'calibration', 'utility'],
});
const counter = app({
  slug: 'charcap',
  name: 'CharCap',
  category: 'tool',
  featured: true,
  tagline: 'A live character counter.',
  tags: ['writing', 'social media', 'utility'],
});
const life = app({
  slug: 'game-of-life',
  name: 'Game of Life',
  category: 'simulation',
  tagline: "Conway's Game of Life.",
  tags: ['cellular automata', 'emergence', 'classic'],
});
const pong = app({
  slug: 'ping-pong',
  name: 'Ping Pong',
  category: 'game',
  status: 'beta',
  tagline: 'Classic Pong against the computer.',
  tags: ['arcade', 'classic', 'single player'],
});
const prim = app({
  slug: 'primordia',
  name: 'Primordia',
  category: 'simulation',
  status: 'coming-soon',
  tagline: 'A 3D artificial-life sandbox.',
  tags: ['artificial life', 'evolution', 'emergence'],
});

const APPS: readonly App[] = [life, pong, prim, counter, ruler];
const slugs = (list: readonly App[]): string[] => list.map((a) => a.slug);

describe('sortApps', () => {
  it('puts featured first, then sorts by name case-insensitively', () => {
    expect(slugs(sortApps(APPS))).toEqual([
      'charcap',
      'online-ruler',
      'game-of-life',
      'ping-pong',
      'primordia',
    ]);
  });

  it('does not mutate its input', () => {
    const input = [...APPS];
    sortApps(input);
    expect(input).toEqual(APPS);
  });
});

describe('searchApps', () => {
  it('returns everything for an empty or whitespace query', () => {
    expect(searchApps(APPS, '')).toEqual(APPS);
    expect(searchApps(APPS, '   ')).toEqual(APPS);
  });

  it('is case-insensitive and trims', () => {
    expect(slugs(searchApps(APPS, '  RULER '))).toEqual(['online-ruler']);
  });

  it('requires every word to match (AND)', () => {
    expect(slugs(searchApps(APPS, 'classic pong'))).toEqual(['ping-pong']);
    expect(slugs(searchApps(APPS, 'classic'))).toEqual([
      'game-of-life',
      'ping-pong',
    ]);
    expect(searchApps(APPS, 'ruler pong')).toEqual([]);
  });

  it('matches tags', () => {
    expect(slugs(searchApps(APPS, 'evolution'))).toEqual(['primordia']);
    expect(slugs(searchApps(APPS, 'utility'))).toEqual([
      'charcap',
      'online-ruler',
    ]);
  });

  it('matches plural and singular category labels', () => {
    expect(slugs(searchApps(APPS, 'simulations'))).toEqual([
      'game-of-life',
      'primordia',
    ]);
    expect(slugs(searchApps(APPS, 'game'))).toEqual([
      'game-of-life',
      'ping-pong',
    ]);
    expect(slugs(searchApps(APPS, 'tools'))).toEqual([
      'charcap',
      'online-ruler',
    ]);
  });

  it('matches the tagline', () => {
    expect(slugs(searchApps(APPS, 'character counter'))).toEqual(['charcap']);
  });

  it('does not search the description', () => {
    const hidden = app({ slug: 'hidden', description: 'zebra' });
    expect(searchApps([hidden], 'zebra')).toEqual([]);
  });
});

describe('filterApps', () => {
  it('filters by category', () => {
    expect(slugs(filterApps(APPS, { category: 'simulation' }))).toEqual([
      'game-of-life',
      'primordia',
    ]);
  });

  it('combines category and query', () => {
    expect(
      slugs(filterApps(APPS, { category: 'game', query: 'classic' }))
    ).toEqual(['ping-pong']);
    expect(filterApps(APPS, { category: 'tool', query: 'classic' })).toEqual(
      []
    );
  });

  it('returns everything with no filter', () => {
    expect(filterApps(APPS)).toEqual(APPS);
    expect(filterApps(APPS, { category: null, query: '' })).toEqual(APPS);
  });
});

describe('categoriesInUse', () => {
  it('returns categories in display order', () => {
    expect(categoriesInUse(APPS)).toEqual(['tool', 'game', 'simulation']);
  });

  it('omits categories with no apps', () => {
    expect(categoriesInUse([life, ruler])).toEqual(['tool', 'simulation']);
    expect(categoriesInUse([])).toEqual([]);
  });

  it('includes app when present', () => {
    expect(
      categoriesInUse([app({ slug: 'thing', category: 'app' }), pong])
    ).toEqual(['game', 'app']);
  });
});

describe('relatedApps', () => {
  it('never includes the app itself', () => {
    for (const a of APPS) {
      expect(slugs(relatedApps(APPS, a.slug))).not.toContain(a.slug);
    }
  });

  it('prefers the same category, then shared tags', () => {
    expect(slugs(relatedApps(APPS, 'game-of-life'))).toEqual([
      'primordia',
      'ping-pong',
    ]);
  });

  it('orders same-category matches by shared tag count', () => {
    const a = app({ slug: 'a', category: 'game', tags: ['x', 'y'] });
    const b = app({ slug: 'b', category: 'game', tags: ['z'] });
    const c = app({ slug: 'c', category: 'game', tags: ['x', 'y'] });
    const d = app({ slug: 'd', category: 'tool', tags: ['x', 'y'] });
    expect(slugs(relatedApps([a, b, c, d], 'a'))).toEqual(['c', 'b', 'd']);
  });

  it('respects n', () => {
    expect(relatedApps(APPS, 'game-of-life', 1)).toEqual([prim]);
    expect(relatedApps(APPS, 'game-of-life', 0)).toEqual([]);
  });

  it('leaves out apps with no shared category or tag', () => {
    expect(slugs(relatedApps(APPS, 'online-ruler'))).toEqual(['charcap']);
  });

  it('returns an empty list for an unknown slug', () => {
    expect(relatedApps(APPS, 'nope')).toEqual([]);
  });
});

describe('findApp and countLive', () => {
  it('finds by slug', () => {
    expect(findApp(APPS, 'ping-pong')).toBe(pong);
    expect(findApp(APPS, 'verdict')).toBeUndefined();
  });

  it('counts only live apps', () => {
    expect(countLive(APPS)).toBe(3);
  });
});
