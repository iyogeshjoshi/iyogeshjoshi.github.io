# AGENTS.md

## Project Overview

This is a React/TypeScript portfolio website built with Vite. The project uses styled-components for styling, framer-motion for animations, and Jest with React Testing Library for tests. Data is loaded from YAML files.

## Build Commands

```bash
npm run dev          # Start development server
npm run build        # Type-check and build for production
npm run preview      # Preview production build locally
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

Coverage threshold: 70% for statements, functions, lines, and branches.

## Code Style Guidelines

### TypeScript

- Use strict mode enabled (`noImplicitAny` is off for `any` types)
- Interfaces for object types, types for unions/primitives
- Use `React.FC` for component types
- Prefix transient styled-component props with `$` (e.g., `$variant`)

### React Components

- Use functional components with hooks
- Use `useCallback` for callbacks passed as props
- Use `useEffect` with proper cleanup
- Import React explicitly: `import React, { useState, useEffect } from 'react'`

### Imports Order

1. React imports
2. Third-party libraries (styled-components, framer-motion, etc.)
3. Internal utils
4. Internal components
5. Types/theme

### Naming Conventions

- Components: PascalCase (e.g., `Hero`, `ProjectGallery`)
- Hooks: camelCase starting with `use` (e.g., `useTheme`, `useTypingEffect`)
- Variables/functions: camelCase (e.g., `handleDownload`, `parseDate`)
- Constants: SCREAMING_SNAKE_CASE for config values
- Interfaces: PascalCase without "I" prefix (e.g., `HeroProps` not `IHeroProps`)
- Types: PascalCase (e.g., `ThemeType = 'light' | 'dark' | 'auto'`)

### Styling

- Use CSS custom properties from `:root` (e.g., `var(--spacing-md)`, `var(--accent-color)`)
- Styled-components for component-scoped styles
- Responsive design with media queries (breakpoint: 768px)
- Use `clamp()` for fluid typography

### Formatting (Prettier)

- Single quotes (`'string'`)
- Semicolons at end of statements
- Trailing commas (ES5 compatible)
- Print width: 80, tab width: 2

### Error Handling

- Use try/catch for async operations
- Return fallback data rather than throwing for recoverable errors
- Log errors with descriptive messages: `console.error('Failed to load portfolio data:', error)`

### File Structure

```
src/
  components/     # React components
  utils/          # Helper functions
  types/          # TypeScript definitions
  setupTests.ts   # Jest setup
  App.tsx         # Main app component
  index.tsx       # Entry point
```

### Testing

- Use React Testing Library with jest-dom matchers
- Mock framer-motion and other external dependencies
- Helper function `renderWithTheme` for styled-components theme provider
- Use `async/await` with `waitFor` for async assertions

### CSS Variables

Available variables: `--bg-color`, `--text-color`, `--accent-color`, `--secondary-color`, `--spacing-xs` through `--spacing-xl`, `--duration-normal`, `--easing-ease-out`
