import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { getApp } from '@/catalog';
import type { PublicApp } from '@/catalog';
import { AppCard, appHost, isDesktopOnly } from './AppCard';

function app(slug: string): PublicApp {
  const found = getApp(slug);
  if (!found) throw new Error(`missing fixture app ${slug}`);
  return found;
}

describe('AppCard', () => {
  it('renders an article with a stretched link to the detail page', () => {
    const ruler = app('online-ruler');
    render(<AppCard app={ruler} />);

    const card = screen.getByRole('article');
    const heading = within(card).getByRole('heading', { level: 3 });
    const link = within(heading).getByRole('link', { name: 'Online Ruler' });
    expect(link).toHaveAttribute('href', '/apps/online-ruler/');
  });

  it('has a separate Open link to the subdomain and no nested links', () => {
    const ruler = app('online-ruler');
    const { container } = render(<AppCard app={ruler} />);

    const open = screen.getByRole('link', {
      name: 'Open Online Ruler (opens onlineruler.deviloper.dev)',
    });
    expect(open).toHaveAttribute('href', ruler.url);
    expect(open).toHaveAttribute('rel', 'noopener');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(container.querySelectorAll('a a')).toHaveLength(0);
    expect(container.querySelectorAll('a button, button a')).toHaveLength(0);
  });

  it('shows category, status, host and at most 3 tags', () => {
    const ruler = app('online-ruler');
    render(<AppCard app={{ ...ruler, tags: ['a', 'b', 'c', 'd'] }} />);

    expect(screen.getByText('Tool')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText('onlineruler.deviloper.dev')).toBeInTheDocument();
    const tags = within(screen.getByRole('list', { name: 'Tags' }));
    expect(tags.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it.each(['ping-pong', 'primordia'])('marks %s as best on desktop', (slug) => {
    render(<AppCard app={app(slug)} />);
    expect(screen.getByText('Best on desktop')).toBeInTheDocument();
  });

  it.each(['online-ruler', 'charcap', 'game-of-life'])(
    'has no desktop badge for %s',
    (slug) => {
      render(<AppCard app={app(slug)} />);
      expect(screen.queryByText('Best on desktop')).not.toBeInTheDocument();
    }
  );

  it('renders a coming-soon app without links', () => {
    const soon: PublicApp = { ...app('charcap'), status: 'coming-soon' };
    render(<AppCard app={soon} />);
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'CharCap' })
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});

describe('AppCard helpers', () => {
  it('appHost returns the host of a URL', () => {
    expect(appHost('https://ping-pong.deviloper.dev/')).toBe(
      'ping-pong.deviloper.dev'
    );
  });

  it('isDesktopOnly is true only when desktop is the sole device', () => {
    expect(isDesktopOnly({ devices: ['desktop'] })).toBe(true);
    expect(isDesktopOnly({ devices: ['desktop', 'tablet'] })).toBe(false);
    expect(isDesktopOnly({ devices: ['phone'] })).toBe(false);
  });
});
