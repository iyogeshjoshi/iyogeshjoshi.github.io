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

## Architecture

### Data Flow
- Content is loaded from `public/data.yaml` at runtime via `src/utils/yamlLoader.ts`
- Projects data in `src/data/projects.ts` supplements YAML data
- Theme preference stored in localStorage

### Key Files
- `src/index.tsx` - Entry point with global styles and CSS variables
- `src/App.tsx` - Main app component with theme provider
- `src/theme.ts` - Theme definitions (light/dark/auto) with color palettes and spacing
- `src/components/` - React components (Hero, About, Skills, Projects, Contact, etc.)
- `src/utils/` - Utilities (yamlLoader, projectManager, github, microInteractions)
- `public/data.yaml` - Portfolio content (name, bio, skills, experience)

### Theme System
- Three theme types: `'light' | 'dark' | 'auto'` (auto follows system preference)
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