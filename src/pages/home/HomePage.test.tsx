import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { apps } from '@/catalog';
import { URL_SYNC_DELAY_MS } from '@/components/catalog';
import { installMatchMedia } from '@/test/matchMedia';
import { HomePage } from './HomePage';

// framer-motion reads this once per module; reduced motion keeps exits instant.
installMatchMedia({ '(prefers-reduced-motion)': true });

type GtagMock = ReturnType<typeof vi.fn>;
const win = window as Window & { gtag?: GtagMock };

const search = (): HTMLInputElement =>
  screen.getByRole('searchbox', { name: 'Search the catalog' });
const chips = () =>
  within(screen.getByRole('group', { name: 'Filter by category' }));
const chip = (label: string) =>
  chips().getByRole('button', { name: new RegExp(`^${label}\\b`) });
const cardNames = (): string[] =>
  screen
    .queryAllByRole('article')
    .map(
      (card) =>
        within(card).getByRole('heading', { level: 3 }).textContent ?? ''
    );

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  vi.useRealTimers();
  delete win.gtag;
});

describe('HomePage', () => {
  it('renders the hero and every public app, but never Verdict', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Side projects, small tools & games.',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/5 live on \*\.deviloper\.dev/)
    ).toBeInTheDocument();
    expect(cardNames()).toEqual(apps.map((app) => app.name));
    expect(
      screen.getByRole('heading', { level: 2, name: 'Everything' })
    ).toBeInTheDocument();
    expect(screen.getByText('5 apps')).toHaveAttribute('aria-live', 'polite');
    expect(document.body.textContent?.toLowerCase()).not.toContain('verdict');
    expect(search()).toHaveAttribute(
      'placeholder',
      'Search tools, games and simulations…'
    );
  });

  it('renders the "Built to get out of your way" section', () => {
    render(<HomePage />);
    const section = screen
      .getByRole('heading', { level: 2, name: 'Built to get out of your way' })
      .closest('section') as HTMLElement;
    expect(
      within(section)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent)
    ).toEqual(['No sign-up, ever', 'Private by default', 'Fast on any screen']);
  });

  it('filters instantly with multi-word queries', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.type(search(), 'classic mouse');
    await waitFor(() => expect(cardNames()).toEqual(['Ping Pong']));
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Results for “classic mouse”',
      })
    ).toBeInTheDocument();
    expect(screen.getByText('1 app')).toBeInTheDocument();
  });

  it('matches tags', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.type(search(), 'emergence');
    await waitFor(() =>
      expect(cardNames().sort()).toEqual(['Game of Life', 'Primordia'])
    );
  });

  it('filters by chip, updates aria-pressed and counts', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    expect(chip('All')).toHaveAttribute('aria-pressed', 'true');
    expect(
      chips()
        .getAllByRole('button')
        .map((b) => b.textContent?.split(',')[0])
    ).toEqual(['All5', 'Tools2', 'Games1', 'Simulations2']);

    await user.click(chip('Simulations'));
    expect(chip('Simulations')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('All')).toHaveAttribute('aria-pressed', 'false');
    await waitFor(() =>
      expect(cardNames().sort()).toEqual(['Game of Life', 'Primordia'])
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Simulations' })
    ).toBeInTheDocument();

    // Counts follow the search, independent of the selected chip.
    await user.type(search(), 'classic');
    expect(chip('All')).toHaveAccessibleName(/2 apps$/);
    expect(chip('Games')).toHaveAccessibleName(/1 app$/);
    expect(chip('Tools')).toHaveAccessibleName(/0 apps$/);
    expect(chip('Simulations')).toHaveAccessibleName(/1 app$/);
    await waitFor(() => expect(cardNames()).toEqual(['Game of Life']));
  });

  it('shows the empty state and clears everything back', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(chip('Games'));
    await user.type(search(), 'zzz');
    await waitFor(() => expect(cardNames()).toEqual([]));
    expect(
      screen.getByText('Nothing matches “zzz” in Games')
    ).toBeInTheDocument();
    expect(screen.getByText('0 apps')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Clear search & filters' })
    );
    expect(search()).toHaveValue('');
    expect(search()).toHaveFocus();
    expect(chip('All')).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(cardNames()).toHaveLength(apps.length));
    expect(window.location.search).toBe('');
  });

  it('applies an empty-state suggestion', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.type(search(), 'zzz');
    const suggestion = await screen.findByRole('button', {
      name: apps[0].tags[0],
    });
    await user.click(suggestion);
    expect(search()).toHaveValue(apps[0].tags[0]);
    await waitFor(() => expect(cardNames().length).toBeGreaterThan(0));
  });

  it('hydrates prerendered markup without mismatches, then applies the URL', async () => {
    const html = renderToString(<HomePage />);
    window.history.replaceState(null, '', '/?q=pong');
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});

    const root = await act(async () => hydrateRoot(container, <HomePage />));
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
    await waitFor(() => expect(cardNames()).toEqual(['Ping Pong']));

    act(() => root.unmount());
    container.remove();
  });

  describe('keyboard shortcuts', () => {
    it('focuses the search box with "/"', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      expect(search()).not.toHaveFocus();
      await user.keyboard('/');
      expect(search()).toHaveFocus();
      expect(search()).toHaveValue('');
    });

    it('focuses the search box with Ctrl+K and ⌘K', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await user.keyboard('{Control>}k{/Control}');
      expect(search()).toHaveFocus();
      search().blur();
      await user.keyboard('{Meta>}k{/Meta}');
      expect(search()).toHaveFocus();
    });

    it('types "/" normally inside the search box', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await user.type(search(), 'a/b');
      expect(search()).toHaveValue('a/b');
    });

    it('ignores shortcuts while typing in another field', async () => {
      const user = userEvent.setup();
      render(
        <>
          <input aria-label="Other field" />
          <HomePage />
        </>
      );

      const other = screen.getByRole('textbox', { name: 'Other field' });
      await user.type(other, '/');
      await user.keyboard('{Control>}k{/Control}');
      expect(other).toHaveFocus();
      expect(other).toHaveValue('/');
    });

    it('Esc clears the query, then blurs when empty', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await user.type(search(), 'ruler');
      await user.keyboard('{Escape}');
      expect(search()).toHaveValue('');
      expect(search()).toHaveFocus();
      await user.keyboard('{Escape}');
      expect(search()).not.toHaveFocus();
    });
  });

  describe('URL sync', () => {
    it('writes ?q= and ?category= after the debounce', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<HomePage />);

      await user.type(search(), 'ruler');
      expect(window.location.search).toBe('');
      act(() => {
        vi.advanceTimersByTime(URL_SYNC_DELAY_MS);
      });
      expect(window.location.search).toBe('?q=ruler');

      await user.click(chip('Tools'));
      act(() => {
        vi.advanceTimersByTime(URL_SYNC_DELAY_MS);
      });
      expect(window.location.search).toBe('?q=ruler&category=tools');

      await user.click(chip('All'));
      await user.clear(search());
      act(() => {
        vi.advanceTimersByTime(URL_SYNC_DELAY_MS);
      });
      expect(window.location.search).toBe('');
    });

    it('reads the query and category from the URL after mount', async () => {
      window.history.replaceState(null, '', '/?q=pong&category=games');
      render(<HomePage />);

      await waitFor(() => expect(search()).toHaveValue('pong'));
      expect(chip('Games')).toHaveAttribute('aria-pressed', 'true');
      await waitFor(() => expect(cardNames()).toEqual(['Ping Pong']));
    });

    it('applies the URL on popstate', async () => {
      render(<HomePage />);
      await waitFor(() => expect(cardNames()).toHaveLength(apps.length));

      act(() => {
        window.history.pushState(null, '', '/?category=simulations');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(chip('Simulations')).toHaveAttribute('aria-pressed', 'true');
      await waitFor(() =>
        expect(cardNames().sort()).toEqual(['Game of Life', 'Primordia'])
      );
    });
  });

  describe('analytics', () => {
    it('sends debounced search and filter_category events to gtag', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const gtag = vi.fn();
      win.gtag = gtag;
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<HomePage />);

      await user.type(search(), 'ruler');
      expect(gtag).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(URL_SYNC_DELAY_MS);
      });
      expect(gtag).toHaveBeenCalledTimes(1);
      expect(gtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'ruler',
      });

      await user.click(chip('Games'));
      expect(gtag).toHaveBeenCalledWith('event', 'filter_category', {
        category: 'game',
      });
    });

    it('does not report a query restored from the URL', async () => {
      const gtag = vi.fn();
      win.gtag = gtag;
      window.history.replaceState(null, '', '/?q=pong');
      render(<HomePage />);
      await waitFor(() => expect(search()).toHaveValue('pong'));
      await new Promise((resolve) =>
        setTimeout(resolve, URL_SYNC_DELAY_MS + 50)
      );
      expect(gtag).not.toHaveBeenCalled();
    });

    it('works without gtag', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<HomePage />);
      await user.type(search(), 'ruler');
      await user.click(chip('Tools'));
      expect(() =>
        act(() => {
          vi.advanceTimersByTime(URL_SYNC_DELAY_MS);
        })
      ).not.toThrow();
    });
  });
});
