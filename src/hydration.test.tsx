import React from 'react';
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveRoute, routes } from './routes';

/**
 * Hydrating the server markup must not log mismatch warnings. The stored theme
 * is set on <html> *after* server rendering, as the inline head script does.
 */
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('hydration', () => {
  let root: Root | undefined;

  afterEach(() => {
    act(() => root?.unmount());
    root = undefined;
    document.body.innerHTML = '';
    delete document.documentElement.dataset.themeMode;
    delete document.documentElement.dataset.theme;
  });

  const detail = routes.find((r) => r.app)?.path ?? '/';

  it.each(['/', detail, '/about/', '/404.html'])(
    '%s hydrates without errors',
    async (path) => {
      const route = resolveRoute(path);
      // jsdom has `window`, so isomorphic layout effects warn here; real SSR runs in Node.
      const serverWarn = vi
        .spyOn(console, 'error')
        .mockImplementation((msg: unknown) => {
          if (
            !String(msg).includes('useLayoutEffect does nothing on the server')
          ) {
            throw new Error(`server render logged: ${String(msg)}`);
          }
        });
      const html = renderToString(
        <React.StrictMode>{route.render()}</React.StrictMode>
      );
      serverWarn.mockRestore();

      document.documentElement.dataset.themeMode = 'dark';
      document.documentElement.dataset.theme = 'dark';
      const container = document.createElement('div');
      container.id = 'root';
      container.innerHTML = html;
      document.body.appendChild(container);

      const errors = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const recoverable = vi.fn();
      try {
        await act(async () => {
          root = hydrateRoot(
            container,
            <React.StrictMode>{route.render()}</React.StrictMode>,
            {
              onRecoverableError: recoverable,
            }
          );
        });
        expect(errors.mock.calls).toEqual([]);
        expect(recoverable).not.toHaveBeenCalled();
        // After hydration the toggle reflects the stored theme.
        expect(
          container.querySelector('button[aria-label^="Theme: Dark"]')
        ).not.toBeNull();
      } finally {
        errors.mockRestore();
      }
    }
  );
});
