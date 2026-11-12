import React from 'react';
import { renderToString } from 'react-dom/server';

import { apps, site } from './catalog';
import { NOT_FOUND_PATH, resolveRoute, routes } from './routes';
import { renderHead } from './seo/head';

/** Server entry, bundled by `vite build --ssr` and driven by scripts/prerender.ts. */

export interface RenderResult {
  html: string;
  head: string;
  status: number;
}

export function render(path: string): RenderResult {
  const route = resolveRoute(path);
  const html = renderToString(
    <React.StrictMode>{route.render()}</React.StrictMode>
  );
  return {
    html,
    head: renderHead(route.meta),
    status: route.path === NOT_FOUND_PATH ? 404 : 200,
  };
}

export { apps, routes, site };
