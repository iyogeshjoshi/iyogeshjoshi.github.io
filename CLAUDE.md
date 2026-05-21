# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal portfolio website (deviloper.dev) built with React, TypeScript, and Vite. It features dark/light theme toggle, smooth animations via Framer Motion, and content managed through YAML files.

## Build Commands

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Type-check and build for production (outputs to dist/)
npm run preview      # Preview production build locally (port 4173)
npm run lint         # Run ESLint with strict warnings
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
```

## Test Commands

```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test -- --testPathPattern="Hero"    # Run specific test file
npm run test -- --testNamePattern="renders" # Run tests matching pattern
```

## Environment Variables

Create `.env` (already gitignored) before running locally:

```
VITE_GITHUB_TOKEN=<personal_access_token>
```

The GitHub token is required for the Projects section. Without it, the section silently renders empty. The token is used to call the GitHub GraphQL API (`/graphql`) to fetch pinned repos, falling back to top repos by star count. Results are cached in `localStorage` for 1 hour under the key `github_repos_cache`.

## Architecture

### Data Flow
- Portfolio content (`name`, `bio`, `tagline`, `skills`, `experiences`, `contact`) is loaded at runtime from `public/data.yaml` via `src/utils/yamlLoader.ts`
- **Projects come exclusively from GitHub API** — `src/data/projects.ts` has an empty `projects` array by design; `src/utils/github.ts` fetches and maps repos into the `Project` type at runtime
- Experiences from `data.yaml` are sorted by end date descending in `App.tsx` before being passed to `Experiences`
- Theme preference stored in localStorage

### data.yaml Contracts
- Experience `duration` field must follow the format: `"MONTH YEAR - MONTH YEAR"` or `"MONTH YEAR - PRESENT"` (e.g., `"JANUARY 2022 - PRESENT"`). This is parsed by `parseDate()` in `App.tsx` — deviating from this format will cause incorrect sort order.

### Key Files
- `src/index.tsx` - Entry point with global styles and CSS variables
- `src/App.tsx` - Main app component; also houses `useTheme` and `useSystemTheme` hooks
- `src/theme.ts` - Theme definitions (light/dark/auto) with color palettes and spacing
- `src/components/` - React components (Hero, About, Skills, Projects, Contact, etc.)
- `src/utils/github.ts` - GitHub GraphQL fetcher with localStorage cache
- `src/utils/yamlLoader.ts` - Fetches and parses `public/data.yaml`
- `public/data.yaml` - Portfolio content (name, bio, skills, experience, contact)

### Theme System
- Three theme types: `'light' | 'dark' | 'auto'` (auto follows system preference)
- Toggle cycles in order: `light → dark → auto → light` (not a binary toggle)
- CSS custom properties in `:root` and `[data-theme='light']` for theming
- Styled-components ThemeProvider wraps the app
- Theme toggle persists to localStorage

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Use interfaces for object types, types for unions/primitives
- Use `React.FC` for component types
- Prefix transient styled-component props with `$` (e.g., `$variant`)

### Component Patterns
- Functional components with hooks
- Use `useCallback` for callbacks passed as props
- Import React explicitly: `import React, { useState, useEffect } from 'react'`

### Imports Order
1. React imports
2. Third-party libraries (styled-components, framer-motion, etc.)
3. Internal utils
4. Internal components
5. Types/theme

### Naming Conventions
- Components: PascalCase (`Hero`, `ProjectGallery`)
- Hooks: camelCase starting with `use` (`useTheme`, `useTypingEffect`)
- Constants: SCREAMING_SNAKE_CASE for config values
- Interfaces: PascalCase without "I" prefix (`HeroProps` not `IHeroProps`)

### CSS Variables
Core variables used throughout:
- `--bg-color`, `--text-color`, `--secondary-color`, `--accent-color`
- `--card-bg`, `--card-border`, `--shadow-color`
- `--spacing-xs` through `--spacing-5xl`
- `--duration-fast`, `--duration-normal`, `--duration-slow`
- `--easing-ease-out`, `--easing-ease-in-out`

### Responsive Breakpoints
- Mobile: default
- Tablet/Desktop: 768px (`@media (min-width: 768px)`)

## Deployment

- GitHub Pages deployment via GitHub Actions (`.github/workflows/`)
- Push to `master` triggers automatic deploy to deviloper.dev
- Custom domain configured via `public/CNAME`