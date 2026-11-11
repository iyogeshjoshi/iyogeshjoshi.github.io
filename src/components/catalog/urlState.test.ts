import { describe, expect, it } from 'vitest';

import type { Category } from '@/catalog';
import { paramToCategory, readFilterState, writeFilterState } from './urlState';

const ALLOWED: Category[] = ['tool', 'game', 'simulation'];

describe('urlState', () => {
  it('reads q and the plural or singular category', () => {
    expect(readFilterState('?q=ruler&category=tools', ALLOWED)).toEqual({
      query: 'ruler',
      category: 'tool',
    });
    expect(paramToCategory('Game', ALLOWED)).toBe('game');
  });

  it('ignores unknown or unused categories', () => {
    expect(paramToCategory('apps', ALLOWED)).toBeNull();
    expect(paramToCategory('nope', ALLOWED)).toBeNull();
    expect(readFilterState('', ALLOWED)).toEqual({ query: '', category: null });
  });

  it('writes params only when they differ from the default and keeps others', () => {
    expect(writeFilterState('', { query: '', category: null })).toBe('');
    expect(
      writeFilterState('?utm_source=x&q=old', {
        query: '  pong ',
        category: 'game',
      })
    ).toBe('?utm_source=x&q=pong&category=games');
    expect(
      writeFilterState('?q=old&category=games', { query: '', category: null })
    ).toBe('');
  });
});
