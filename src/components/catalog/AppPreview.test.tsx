import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';

import { installMatchMedia, type MatchMediaMock } from '@/test/matchMedia';

import type { AppPreviewProps } from './AppPreview';
import { AppPreview } from './AppPreview';

const base: AppPreviewProps['app'] = {
  slug: 'online-ruler',
  name: 'Online Ruler',
  accent: '#2DD4BF',
  previewKind: 'ruler',
};

describe('AppPreview', () => {
  let mm: MatchMediaMock | null = null;
  const both = {
    ...base,
    preview: {
      light: '/previews/online-ruler-light.webp',
      dark: '/previews/online-ruler-dark.webp',
    },
  };

  afterEach(() => {
    delete document.documentElement.dataset.theme;
    vi.restoreAllMocks();
    mm?.restore();
    mm = null;
  });

  it('renders one picture with a dark source and the light img', () => {
    const { container } = render(<AppPreview app={both} />);
    expect(container.querySelectorAll('picture')).toHaveLength(1);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(1);
    const source = container.querySelector('source');
    expect(source).toHaveAttribute('media', '(prefers-color-scheme: dark)');
    expect(source).toHaveAttribute(
      'srcset',
      '/previews/online-ruler-dark.webp'
    );
    expect(imgs[0]).toHaveAttribute('src', '/previews/online-ruler-light.webp');
    expect(imgs[0]).toHaveAttribute('width', '1280');
    expect(imgs[0]).toHaveAttribute('height', '800');
    expect(imgs[0]).toHaveAttribute('loading', 'lazy');
    expect(imgs[0]).toHaveAttribute('decoding', 'async');
    expect(imgs[0]).toHaveAttribute('alt', '');
  });

  it('loads priority screenshots eagerly with high fetch priority on the single img', () => {
    const { container } = render(<AppPreview priority app={both} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(1);
    expect(imgs[0]).toHaveAttribute('loading', 'eager');
    expect(imgs[0]).toHaveAttribute('fetchpriority', 'high');
  });

  it('swaps to the dark file when data-theme=dark overrides a light OS scheme', async () => {
    mm = installMatchMedia({ '(prefers-color-scheme: dark)': false });
    document.documentElement.dataset.theme = 'dark';
    const { container } = render(<AppPreview app={both} />);
    await waitFor(() =>
      expect(container.querySelector('img')).toHaveAttribute(
        'src',
        '/previews/online-ruler-dark.webp'
      )
    );
    expect(container.querySelector('source')).toBeNull();

    // Follows later theme changes back to the OS default.
    act(() => {
      document.documentElement.dataset.theme = 'light';
    });
    await waitFor(() =>
      expect(container.querySelector('source')).not.toBeNull()
    );
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/previews/online-ruler-light.webp'
    );
  });

  it('swaps to the light file when data-theme=light overrides a dark OS scheme', async () => {
    mm = installMatchMedia({ '(prefers-color-scheme: dark)': true });
    document.documentElement.dataset.theme = 'light';
    const { container } = render(<AppPreview app={both} />);
    await waitFor(() => expect(container.querySelector('source')).toBeNull());
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/previews/online-ruler-light.webp'
    );
  });

  it('disconnects its theme observer on unmount', () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const { unmount } = render(<AppPreview app={both} />);
    expect(disconnect).not.toHaveBeenCalled();
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it('uses a single screenshot when only one theme exists', () => {
    const { container } = render(
      <AppPreview app={{ ...base, preview: { light: '/l.webp' } }} />
    );
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('renders one theme-agnostic picture when only light exists', () => {
    const { container } = render(
      <AppPreview app={{ ...base, preview: { light: '/previews/x.webp' } }} />
    );
    const pictures = container.querySelectorAll('picture');
    expect(pictures).toHaveLength(1);
    expect(pictures[0].className).not.toMatch(/light|dark/);
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/previews/x.webp'
    );
    expect(container.firstElementChild).toHaveAttribute(
      'data-preview',
      'image'
    );
  });

  it.each(['ruler', 'counter', 'life', 'pong', 'prim'] as const)(
    'draws the %s illustration when there is no screenshot',
    (kind) => {
      const { container } = render(
        <AppPreview app={{ ...base, previewKind: kind }} />
      );
      const preview = container.firstElementChild as HTMLElement;
      expect(preview).toHaveAttribute('aria-hidden', 'true');
      expect(preview).toHaveAttribute('data-preview', kind);
      expect(container.querySelector('img')).toBeNull();
      expect(preview.childElementCount).toBeGreaterThan(0);
    }
  );

  it('falls back to an accent monogram for the generic kind', () => {
    const { container } = render(
      <AppPreview app={{ ...base, previewKind: 'generic' }} />
    );
    expect(container.firstElementChild).toHaveAttribute(
      'data-preview',
      'generic'
    );
    expect(container).toHaveTextContent('O');
  });

  it('falls back to the generic tile for a kind without an illustration', () => {
    const { container } = render(
      <AppPreview app={{ ...base, previewKind: 'verdict' }} />
    );
    expect(container.firstElementChild).toHaveAttribute(
      'data-preview',
      'generic'
    );
    expect(container).toHaveTextContent('O');
  });

  it('is deterministic', () => {
    const first = render(<AppPreview app={{ ...base, previewKind: 'prim' }} />);
    const html = first.container.innerHTML;
    first.unmount();
    const second = render(
      <AppPreview app={{ ...base, previewKind: 'prim' }} />
    );
    expect(second.container.innerHTML).toBe(html);
  });
});
