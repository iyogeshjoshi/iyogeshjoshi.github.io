import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import './styles/global.css';
import { resolveRoute } from './routes';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found');
}

const route = resolveRoute(window.location.pathname);

// Dev serves the bare template for every URL, so set the per-route title here.
if (import.meta.env.DEV) {
  document.title = route.meta.title;
}

const app = <React.StrictMode>{route.render()}</React.StrictMode>;

// Prerendered pages ship element markup inside #root, so hydrate them. The dev
// template only holds the `<!--app-html-->` placeholder comment.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
