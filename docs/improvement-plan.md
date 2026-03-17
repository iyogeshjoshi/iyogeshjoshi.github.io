# Improvement Plan for iyogeshjoshi.github.io

## Context
The codebase analysis revealed numerous improvement opportunities across code quality, performance, accessibility, and maintainability. This plan organizes the improvements by priority and provides actionable steps.

---

## High Priority (High Impact, Low Effort)

### 1. Accessibility - Reduced Motion Support
- **Files**: `src/components/Hero.tsx`, `src/components/Header.tsx`, `src/index.tsx`
- **Issue**: No check for `prefers-reduced-motion` media query. All animations play regardless of user preference.
- **Fix**: Add reduced-motion check using `useReducedMotion` from framer-motion and disable animations when true.

### 2. Fix Memory Leak in DownloadButton
- **File**: `src/components/DownloadButton.tsx` (line 147)
- **Issue**: setTimeout without cleanup can cause memory leaks if component unmounts before timeout.
- **Fix**: Use useEffect cleanup to clear timeout on unmount.

### 3. Remove Unused Dependencies
- **File**: `package.json`
- **Issue**: Unused packages: jspdf, html2canvas, react-to-pdf, @react-pdf/renderer, react-router-dom
- **Fix**: Remove unused packages to reduce bundle size.
  ```bash
  npm uninstall jspdf html2canvas react-to-pdf @react-pdf/renderer react-router-dom
  ```

### 4. Add Skip to Content Link
- **File**: `src/App.tsx`
- **Issue**: No skip navigation link for keyboard users.
- **Fix**: Add a skip link that jumps to main content.

### 5. Fix Non-memoized GeometricBackground
- **File**: `src/components/Hero.tsx` (lines 286-293)
- **Issue**: Shapes array recreated on every render with Math.random(), causing animation resets.
- **Fix**: Wrap shapes creation in useMemo.

---

## Medium Priority (High Impact, Medium Effort)

### 6. Extract Custom Hooks from App.tsx
- **File**: `src/App.tsx`
- **Issue**: useTheme and useSystemTheme defined inline; App.tsx is ~430 lines with multiple responsibilities.
- **Fix**: Extract to `src/hooks/useTheme.ts` and `src/hooks/useSystemTheme.ts`

### 7. Add React.memo to Static Components
- **Files**: `src/components/Projects.tsx`, `src/components/Skills.tsx`, `src/components/About.tsx`, `src/components/Contact.tsx`
- **Issue**: Components re-render unnecessarily with static data.
- **Fix**: Wrap in React.memo with proper comparison.

### 8. Add Error Boundary
- **Files**: `src/App.tsx`, new file `src/components/ErrorBoundary.tsx`
- **Issue**: No error boundary - crashes show blank screen.
- **Fix**: Create ErrorBoundary component and wrap app content.

### 9. Theme Logic Centralization
- **Files**: `src/index.tsx`, `src/theme.ts`
- **Issue**: Duplicate theme definitions between GlobalStyle and theme.ts
- **Fix**: Use generateCSSCustomProperties from theme.ts in index.tsx instead of hardcoding.

### 10. Console Error Cleanup
- **Files**: Multiple (App.tsx, yamlLoader.ts, github.ts, ProjectDetailModal.tsx)
- **Issue**: 9 console.error calls could leak info in production.
- **Fix**: Replace with proper logging service or remove.

---

## Low Priority (High Effort, Lower Impact)

### 11. Code Splitting with React.lazy
- **File**: `src/App.tsx`
- **Issue**: No lazy loading for components.
- **Fix**: Use React.lazy for ProjectDetailModal and other heavy components.

### 12. Add Loading State for GitHub Data
- **Files**: `src/components/Projects.tsx`, `src/utils/github.ts`
- **Issue**: No visible loading indicator when fetching GitHub repos.
- **Fix**: Add loading spinner/skeleton.

### 13. Migrate from react-helmet to react-helmet-async
- **File**: `src/components/SEO.tsx`
- **Issue**: react-helmet is deprecated.
- **Fix**: Migrate to react-helmet-async.

### 14. Add Virtualization to Projects
- **File**: `src/components/Projects.tsx`
- **Issue**: All projects rendered without virtualization.
- **Fix**: Use react-window for large lists.

### 15. Add Bundle Analysis
- **File**: `vite.config.ts`
- **Issue**: No bundle analyzer to identify large dependencies.
- **Fix**: Add rollup-plugin-visualizer or vite-bundle-visualizer.

### 16. Focus Trap in Modal
- **File**: `src/components/ProjectDetailModal.tsx`
- **Issue**: No focus trap, keyboard focus can escape.
- **Fix**: Implement focus trap or use a library like react-focus-lock.

---

## Summary by Category

### Code Quality
- Extract custom hooks from App.tsx
- Theme logic centralization
- Add error boundary

### Performance
- Fix non-memoized GeometricBackground
- Add React.memo to static components
- Code splitting with React.lazy
- Add virtualization to projects
- Add bundle analysis

### Accessibility
- Reduced motion support
- Skip to content link
- Focus trap in modal

### Dependencies
- Remove unused dependencies
- Migrate from react-helmet to react-helmet-async

### Maintainability
- Console error cleanup
- Add loading state for GitHub data

---

## ProjectGallery Improvements (No Images Support)

### Current State Analysis
- **Problem**: GitHub repos always have `images: []` (empty array), forcing all cards to use the placeholder
- **Location**: `src/components/Projects.tsx` lines 34-62 maps GitHub repos to Project with `images: []`
- **Fallback used**: `/images/placeholder-project.jpg` in both ProjectGallery.tsx:432 and ProjectDetailModal.tsx:488

### Proposed Solutions

#### Option A: Show GitHub Repo Info as Card Visual (Recommended)
Instead of a placeholder image, show GitHub-specific info on the card:
- Show repository language (colored badge)
- Show star/fork count
- Show last updated date
- Show primary topic as category

**Files to modify**:
- `src/components/ProjectGallery.tsx` - Update card layout for no-image case
- `src/components/ProjectDetailModal.tsx` - Update modal header for no-image case

#### Option B: Generate Dynamic Screenshots
Use GitHub's repository screenshot API or generate one:
- Use `https://gh-card.dev/` or similar service
- Fallback to repo's primary language color as card background

#### Option C: Card Layout Without Image
Completely redesign cards when no image exists:
- Use a header with project name and language
- Display description prominently
- Show metrics/stats instead of image area

### Implementation Plan (if Option A):

1. **Update Project type in Projects.tsx**:
   - When mapping GitHub repos to Projects, extract: language, stargazers_count, forks_count, updated_at

2. **Update ProjectGallery.tsx**:
   - Create `ProjectCardNoImage` variant
   - Show language badge, stars, forks instead of image
   - Use language color as accent background

3. **Update ProjectDetailModal.tsx**:
   - When no images, show GitHub stats section
   - Display repo metadata prominently

4. **Update styles**:
   - Add new CSS for no-image card variant
   - Ensure consistent styling with existing cards

---

## Verification

Run tests after each fix:
```bash
npm run test
```

Build and verify:
```bash
npm run build
npm run preview
```

Accessibility check:
```bash
npm run lint
```