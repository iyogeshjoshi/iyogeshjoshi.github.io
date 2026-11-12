# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repository.

## Project Overview

deviloper.dev is a static **catalog hub**: a directory of apps (web tools, games, simulations), each hosted on its own `*.deviloper.dev` subdomain. It is built with React 18, TypeScript and Vite 5, and hosted on **GitHub Pages** (static files only: no server, no runtime secrets, no API calls to private services).

The rewrite from the old portfolio is in progress on branch `feat/catalog-hub`. Source of truth for scope and status:
- `docs/catalog-prd.md` (requirements, data model)
- `docs/catalog-implementation-plan.md` (phased checklist; update it when a task is done)
- `docs/subdomains.md` (app registry), `design/` (design reference)

**Current state (Phase 1):** only a placeholder page exists (`src/entry-client.tsx`, `src/pages/Placeholder.tsx`). Everything below marked *(planned)* is not built yet.

## Commands

```bash
npm run dev            # Vite dev server (port 3000)
npm run build          # typecheck, then vite build -> dist/
npm run preview        # serve dist/ (port 4173)
npm run typecheck      # tsc for src and for vite.config.ts/scripts
npm run lint           # ESLint, zero warnings allowed
npm run lint:fix
npm run format         # Prettier
npm test               # Vitest, single run
npm run test:watch
npm run coverage
npm test -- src/pages/Placeholder   # one file
npm test -- -t "renders"            # by test name
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, test and build on PRs and `feat/**` pushes. `deploy.yml` deploys `master` to GitHub Pages. No secrets or tokens are used anywhere.

## Architecture

- **Multi-page static site** *(prerender planned, Phase 8)*: each route becomes its own `index.html`; navigation uses plain `<a>` links, no client router. Pages hydrate via `hydrateRoot` when `#root` has prerendered markup, else `createRoot`.
- **Data** *(planned, Phase 2)*: `src/data/catalog.yaml` is the single source of truth, validated with zod at build time (build fails on bad data). Entries with `status: draft` or `status: private` must never appear in public pages, sitemaps, search index or JSON-LD.
- **Styling** *(planned, Phase 3)*: CSS Modules plus CSS custom properties (design tokens in `src/styles/tokens.css`, light/dark). No styled-components or other CSS-in-JS.
- **Theme** *(planned)*: `light | dark | auto`, cycling light -> dark -> auto, persisted in localStorage, with a no-flash inline script.
- **Animation**: framer-motion, only where needed, respecting `prefers-reduced-motion`.
- **Studio / add-app tooling** *(planned, Phases 6-11)*: dev-only Vite plugin (`apply: 'serve'`), never part of `dist/`.
- **Ads/analytics**: the AdSense meta tag and script and GA4 (`G-PCZPZC1H5E`) live in `index.html`; keep them intact. Consent handling is planned (Phase 9).

Path alias: `@/` maps to `src/`.

### Key files
- `index.html`: shell with SEO meta, AdSense, GA4
- `src/entry-client.tsx`: client entry
- `src/test/setup.ts`: Vitest setup (jest-dom, cleanup)
- `vite.config.ts`: Vite and Vitest config (single file)
- `public/`: static assets copied as is (CNAME, ads.txt, robots.txt, sitemaps, legal pages, resumes). `public/CNAME` is the only CNAME.

## Code Style

- TypeScript strict. Interfaces for object shapes, `type` for unions/primitives.
- Functional components typed with `React.FC`; import React explicitly (`import React, { useState } from 'react'`).
- `useCallback` for callbacks passed as props.
- Import order: React, third-party, internal utils, internal components, types.
- Naming: components PascalCase, hooks `useX`, config constants SCREAMING_SNAKE_CASE, interfaces without an `I` prefix.
- Prettier: single quotes, semicolons, ES5 trailing commas, width 80.
- Responsive: mobile first, one breakpoint at `768px`.
- Accessibility is a requirement: semantic landmarks, visible focus, keyboard support, adequate contrast.

## Testing

Vitest + React Testing Library + jest-dom, jsdom environment. No globals: import `describe`, `it`, `expect`, `vi` from `vitest`. Tests live next to the code (`*.test.ts(x)`), plus `scripts/**/*.test.ts`. Playwright for previews/e2e is planned.

## Workflow rules

- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, ...).
- Commit each verified task (conventional commits). Never push; the owner pushes.
- Never add secrets, tokens or `.env` values to the repo or the build output; the site is public static files.
- Keep `docs/catalog-implementation-plan.md` checklist current.
