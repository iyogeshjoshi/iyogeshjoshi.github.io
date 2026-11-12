import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { catalogPlugin } from './scripts/vite-plugin-catalog';

/**
 * Dev only: `index.html` is the prerender template, with `<!--app-head-->` in
 * <head>. The dev server has no prerender step, so fill in a default title and
 * description; the client then sets the per-route `document.title`.
 */
function devHeadPlugin(): Plugin {
  return {
    name: 'deviloper:dev-head',
    apply: 'serve',
    transformIndexHtml(html) {
      return html.replace(
        '<!--app-head-->',
        '<title>deviloper.dev (dev)</title>\n    <meta name="description" content="deviloper.dev development server" />'
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), catalogPlugin(), devHeadPlugin()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // The SSR bundle is ESM; `.mjs` lets Node load it without "type": "module".
    rollupOptions: isSsrBuild
      ? {
          output: {
            entryFileNames: '[name].mjs',
            chunkFileNames: '[name]-[hash].mjs',
          },
        }
      : undefined,
  },
  ssr: {
    // Bundle framer-motion into the SSR build so it resolves the same ESM
    // entry as the client (CSS modules are always handled by Vite).
    noExternal: ['framer-motion'],
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 4173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
}));
