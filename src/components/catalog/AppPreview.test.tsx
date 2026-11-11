import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import type { AppPreviewProps } from './AppPreview';
import { AppPreview } from './AppPreview';

const base: AppPreviewProps['app'] = {
  slug: 'online-ruler',
  name: 'Online Ruler',
  accent: '#2DD4BF',
  previewKind: 'ruler',
};

describe('AppPreview', () => {
  it('renders light and dark screenshots when both exist', () => {
    const { container } = render(
      <AppPreview
        app={{
          ...base,
          preview: {
            light: '/previews/online-ruler-light.webp',
            dark: '/previews/online-ruler-dark.webp',
          },
        }}
      />
    );
    expect(container.querySelectorAll('picture')).toHaveLength(2);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute('src', '/previews/online-ruler-light.webp');
    expect(imgs[1]).toHaveAttribute('src', '/previews/online-ruler-dark.webp');
    imgs.forEach((img) => {
      expect(img).toHaveAttribute('width', '1280');
      expect(img).toHaveAttribute('height', '800');
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
      expect(img).toHaveAttribute('alt', '');
    });
  });

  it('loads priority screenshots eagerly with high fetch priority', () => {
    const { container } = render(
      <AppPreview
        priority
        app={{ ...base, preview: { light: '/l.webp', dark: '/d.webp' } }}
      />
    );
    container.querySelectorAll('img').forEach((img) => {
      expect(img).toHaveAttribute('loading', 'eager');
      expect(img).toHaveAttribute('fetchpriority', 'high');
    });
  });

  it('uses a single screenshot when only one theme exists', () => {
    const { container } = render(
      <AppPreview app={{ ...base, preview: { light: '/l.webp' } }} />
    );
    expect(container.querySelectorAll('img')).toHaveLength(1);
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
