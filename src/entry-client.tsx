import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import { Placeholder } from './pages/Placeholder';

import './styles/global.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found');
}

const app = (
  <React.StrictMode>
    <Placeholder />
  </React.StrictMode>
);

// Prerendered pages (Phase 8) ship markup inside #root, so hydrate them.
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
