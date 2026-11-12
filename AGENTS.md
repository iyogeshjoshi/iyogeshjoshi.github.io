# AGENTS.md

Instructions for coding agents working in this repository. See `CLAUDE.md` for the same guidance in more detail.

## Project Overview

deviloper.dev is a static catalog hub listing apps hosted on `*.deviloper.dev` subdomains. Stack: React 18, TypeScript (strict), Vite 5, framer-motion, zod, Vitest. Hosted on GitHub Pages (static files only). The rewrite is in progress on `feat/catalog-hub`; only a placeholder page exists today.

Scope and status live in `docs/catalog-prd.md` and `docs/catalog-implementation-plan.md` (the living checklist; update it when tasks complete). Items below marked *(planned)* do not exist yet.

## Commands

```bash
npm run dev          # dev server (3000)
npm run build        # typecheck + vite build -> dist/
npm run preview      # preview dist/ (4173)
npm run typecheck    # tsc (src + node configs)
npm run lint         # ESLint, max-warnings 0
npm run lint:fix
npm run format       # Prettier
npm test             # Vitest single run
npm run test:watch
npm run coverage
```

Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` before declaring work done.

## Architecture

- Multi-page static site: one prerendered HTML file per route, plain `<a>` links, no router *(prerender planned, Phase 8)*.
- Data: `src/data/catalog.yaml` validated by zod at build time *(planned, Phase 2)*. Entries with `status: draft` or `private` must never reach public pages, sitemaps, search or structured data.
- Styling: CSS Modules + CSS custom properties/design tokens *(planned, Phase 3)*. No styled-components.
- Theme: `light | dark | auto` *(planned)*.
- Alias: `@/` -> `src/`.
- Keep the AdSense and GA4 tags in `index.html` intact.

## Code Style

- Strict TypeScript; interfaces for object shapes, `type` for unions.
- Functional components with `React.FC`; `import React from 'react'` explicitly.
- Import order: React, third-party, utils, components, types.
- Naming: PascalCase components, `useX` hooks, SCREAMING_SNAKE_CASE config constants, no `I` prefix on interfaces.
- Prettier: single quotes, semicolons, ES5 trailing commas, width 80, 2 spaces.
- Mobile first with a `768px` breakpoint; use `clamp()` for fluid type.
- Errors: try/catch around async work, return fallbacks for recoverable failures, log with descriptive messages.
- Accessibility: semantic HTML, keyboard support, visible focus, respect `prefers-reduced-motion`.

## Testing

Vitest + React Testing Library + jest-dom (jsdom). No globals: import from `vitest`. Co-locate `*.test.ts(x)` with source; script tests go in `scripts/**/*.test.ts`. Setup file: `src/test/setup.ts`.

## Rules

- Conventional commits; commit each verified task. Never push.
- No secrets or tokens in the repo, workflows or build output.
- CI (`ci.yml`) runs lint, typecheck, test, build; `deploy.yml` deploys `master` only.
