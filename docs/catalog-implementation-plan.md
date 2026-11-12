# Implementation Plan — deviloper.dev Catalog Hub

| | |
|---|---|
| **Branch** | `feat/catalog-hub` (treated as main; merged to `master` at Phase 12) |
| **PRD** | [`catalog-prd.md`](./catalog-prd.md) · Registry: [`subdomains.md`](./subdomains.md) · Design: [`../design/`](../design/README.md) ([canvas](https://claude.ai/artifact/DHgzh7pKQ6z93KsTekjwmQ)) |
| **Hosting** | GitHub Pages via GitHub Actions: static output only (PRD §5.9) |
| **Status** | Plan approved by owner 2026-11-11 · **Phases 1–5 approved to run (2026-11-11)** |
| **Supersedes** | [`archive/improvement-plan.md`](./archive/improvement-plan.md) |

**How to use this file:** it's the living checklist. Each task is ticked when it's done *and verified*. Each phase ends with a commit (or several) on `feat/catalog-hub`. ⛔ marks a task blocked on an owner answer or action (see the Owner checklist at the bottom).

---

## Architecture decisions

| # | Decision | Why | Status |
|---|---|---|---|
| D1 | **CSS Modules + CSS custom properties** replace styled-components | The theme is already CSS-variable based. No runtime CSS-in-JS, so no SSR style extraction during prerender and about 12 KB less JS. | ✅ Approved 2026-11-11 |
| D2 | **Multi-page static site** (MPA), each route prerendered to its own HTML file and hydrated. Plain `<a>` navigation, no client router. | Every URL is a real file on GitHub Pages (no SPA 404 hack). Best for crawlers and AdSense. Cross-document View Transitions give animated navigation as progressive enhancement. | ✅ Approved 2026-11-11 |
| D3 | **Vitest** replaces Jest; **Playwright** for previews + e2e smoke | Shares the Vite config (YAML import, ESM, aliases). Playwright is needed for screenshots anyway. | ✅ Approved 2026-11-11 |
| D4 | Data: `src/data/catalog.yaml` → validated with **zod** at build → typed module | Single source of truth (PRD R1). The build fails on bad data. | Agreed (PRD) |
| D5 | Keep React 18 + TypeScript + Vite + framer-motion | Owner's stack. framer-motion only for grid reflow (lazy, respects reduced motion). | Agreed |
| D6 | Studio is a **Vite dev-server plugin** (`apply: 'serve'`) | It never exists in `dist/`, so the live site has no admin surface (PRD R4). | Agreed (PRD) |

### Target structure

```
src/
  data/catalog.yaml            # source of truth (6 entries, verdict = private)
  catalog/schema.ts            # zod schema + types
  catalog/index.ts             # load, validate, filter public, sort, related()
  styles/tokens.css            # design tokens (light/dark) from design/README.md
  styles/global.css
  theme/                       # useTheme (light→dark→auto), no-flash inline script
  components/                  # Header, Footer, ThemeToggle, SearchBox, CategoryChips,
                               # AppCard, AppPreview, AdSlot, Breadcrumbs, SkipLink, Seo
  pages/                       # Home, AppDetail, About, Contact, Privacy, Terms, Sitemap, NotFound
  entry-client.tsx             # hydrateRoot per page
  entry-server.tsx             # render(route) → { html, head }
scripts/
  prerender.ts                 # writes dist/**/index.html, sitemap-main.xml, sitemap.xml
  catalog/add-app.ts           # core: probe, readiness, draft entry (PRD R2)
  catalog/cli.ts               # npm run catalog:add / catalog:check
  previews/capture.ts          # Playwright, ads blocked, → WebP
  studio/vite-plugin-studio.ts # dev-only /__studio
.github/workflows/
  deploy.yml (updated) · ci.yml (new) · add-app.yml (new) · health-check.yml (new, P2)
```

---

## Phase 0 — Discovery, PRD and design ✅

- [x] Audit the current site, ads/analytics, legal pages, sitemaps and workflows
- [x] Create branch `feat/catalog-hub`
- [x] PRD → `docs/catalog-prd.md`
- [x] Subdomain registry + readiness audit → `docs/subdomains.md`
- [x] Design canvas (home desktop/phone, detail, Studio) → `design/`
- [x] Owner answers: portfolio dropped, auto screenshots, 6 subdomains, Verdict private, Ping Pong mouse vs CPU, Primordia confirmed, tagline direction, GitHub Pages hosting
- [x] Archive `improvement-plan.md` → `docs/archive/`
- [x] This plan

## Phase 1 — Cleanup and foundations

- [x] Remove portfolio components (Hero, About, Experiences, Skills, SoftSkills, Projects, ProjectGallery, ProjectDetailModal, DownloadButton, Contact) and their tests
- [x] Remove `public/data.yaml`, `src/utils/{github,projectManager,yamlLoader,microInteractions}.ts`, `src/data/projects.ts`, `src/types/project.ts`, `src/theme.ts`
- [x] Remove the static portfolio markup from `index.html` (to be replaced by prerendered output in Phase 8)
- [x] Q2 Resume files: **keep everything** at current URLs, unlinked (owner, 2026-11-11)
- [x] Uninstall: `jspdf html2canvas react-to-pdf @react-pdf/renderer react-router-dom react-helmet @types/react-helmet styled-components @types/styled-components js-yaml`(→ dev only) `jest ts-jest jest-environment-jsdom identity-obj-proxy @types/jest`
- [x] Install: `zod`; dev: `vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @playwright/test sharp tsx yaml`
- [x] `vite.config.ts`: `sourcemap: false` (or `'hidden'`), Vitest config, `@/` alias
- [x] Workflow: delete the `VITE_GITHUB_TOKEN` steps from `deploy.yml`; delete `.env.production` from the repo
- [x] Delete the duplicate root `CNAME` (keep `public/CNAME`)
- [x] Add `.github/workflows/ci.yml`: lint, type-check, test, build on PRs and `feat/catalog-hub` pushes (**no deploy**)
- [x] Update `CLAUDE.md` / `AGENTS.md` for the new architecture
- **Done when:** `npm run build` and `npm test` pass on a minimal placeholder page, CI is green, and no secrets are left in the workflow

## Phase 2 — Catalog data layer

- [x] `src/catalog/schema.ts`: zod schema per PRD §7 (`category: tool|game|simulation|app`, `status: live|beta|coming-soon|draft|private`, tagline ≤ 90, description ≥ 150 words for public entries, slug regex, https URL on `*.deviloper.dev`)
- [x] `src/data/catalog.yaml`: 6 entries with original descriptions, features, how-to and privacy notes (Verdict `private`; Ping Pong "mouse, vs computer, desktop recommended")
- [x] `src/catalog/index.ts`: `publicApps()`, `byCategory()`, `search(q)` (multi-word AND, name/tagline/tags/category), `related(slug, n)`, `categoriesInUse()` (drives chip visibility)
- [x] Vite YAML import (virtual module, validated at build start; fails with a readable error)
- [x] Tests: schema accepts the real file and rejects bad slugs, short descriptions and non-deviloper hosts; **private/draft never returned by public helpers**; search and related behaviour
- [ ] Owner review of the 5 public descriptions (copy PR)
- **Done when:** the data tests are green and the owner has approved the copy

## Phase 3 — Design tokens and theme

- [x] `src/styles/tokens.css`: Workbench palette (dark/light), type scale, spacing, radii, motion tokens, from `design/README.md`
- [x] Fonts: Space Grotesk, Inter, JetBrains Mono via Google Fonts with `display=swap` + preconnect (subset weights only)
- [x] **No-flash inline script** in `<head>`: reads `localStorage.theme`, resolves `auto` via `matchMedia`, sets `data-theme` before paint (T2)
- [x] `useTheme`: cycle `light → dark → auto`, persist, follow system changes in auto, update `<meta name="theme-color">`
- [x] Theme cross-fade (View Transition API when available), disabled under `prefers-reduced-motion`
- [x] Contrast check of every token pair (WCAG AA), recorded in the PR
- **Done when:** toggling has no flash on reload in either theme, and the contrast checks pass

## Phase 4 — Layout shell

- [x] `SkipLink`, `Header` (logo, nav: Catalog/About/Contact, ThemeToggle), `Footer` (catalog links generated from data, site + legal links, "Cookie settings", © year)
- [x] Footer contact: **email only**, `hello@deviloper.dev` (owner, 2026-11-11). No social links.
- [x] `NotFound` page → `404.html` with search box and links to the catalog
- [x] Global focus-visible styles; 44px minimum targets
- **Done when:** shell renders at 360/768/1280px with no horizontal scroll, and keyboard-only navigation works

## Phase 5 — Catalog home

- [x] Hero ("Side projects, small tools & games." + sub-line + live count from data)
- [x] `SearchBox`: instant, debounced URL sync (`?q=`), `/` and `⌘K/Ctrl+K` focus, `Esc` clears, `aria-live` result count
- [x] `CategoryChips`: from `categoriesInUse()`, counts, `aria-pressed`, `?category=` URL sync, back/forward via `popstate`
- [x] `AppCard`: preview `<picture>` (light/dark + manual theme override), category/status badges, stretched link to detail, "Open ↗" to subdomain, hover lift
- [x] `AppPreview` fallback: CSS-drawn art per app (ported from the design) when no screenshot exists (P5)
- [x] Grid reflow animation (framer-motion `layout`, lazy-loaded; off under reduced motion)
- [x] Empty state + "Clear search & filters"
- [x] "Built to get out of your way" section
- [x] Tests: filter/search/URL-sync, chip visibility, keyboard shortcuts, empty state
- **Done when:** behaviour matches the `Main`/`Mobile` design boards, and the tests are green

## Phase 6 — App detail pages (`/apps/<slug>/`)

- [x] Page template: breadcrumb, hero with large preview, primary CTA, About, "What you can do", "How to use", privacy note, "At a glance", related apps
- [x] Generated only for `live`/`beta` public entries (5 pages)
- [x] Ping Pong: "Best on desktop (mouse)" note; Primordia: device note once confirmed
- [x] Cross-document View Transition: card preview → detail hero (`view-transition-name` per slug), progressive enhancement
- **Done when:** all 5 pages render from data with unique copy and match the `Detail` design board

## Phase 7 — Site pages (URLs preserved)

- [x] `/privacy-policy.html` rewrite: scope = deviloper.dev + public subdomains (**Verdict excluded**), Consent Mode/CMP, AdSense + GA4 disclosures, opt-out links, localStorage (theme, ruler calibration). GitHub API section removed. New effective date.
- [x] `/sitemap.html`: generated from data
- [x] `/contact/`: email only (no form; no backend on Pages)
- [x] `/about/`: "About this site" (what it is, who builds it, how it's funded). Recommended for AdSense.
- [x] `/terms.html`: terms of use (owner approved)
- [x] Owner legal decisions: governing law stays generic (residence-based); GA4 retention = 2 months (policy updated)
- **Done when:** every page linked from the footer exists, there are no broken links, and the owner has approved legal copy

## Phase 8 — Prerender and SEO

- [x] `entry-server.tsx` + `scripts/prerender.ts`: render every route → `dist/<route>/index.html` (+ `privacy-policy.html`, `sitemap.html`, `404.html`), hydrate on client
- [x] `Seo` per route: title, description, canonical, OG/Twitter (OG image = the app's desktop light preview at 1200×630)
- [x] JSON-LD: `WebSite` (+ `SearchAction` → `/?q=`), `ItemList` on home; `WebApplication`/`VideoGame` + `BreadcrumbList` on detail pages; `Person` publisher
- [x] Generate `sitemap-main.xml` (public routes + `lastmod` from `updatedAt`) and `sitemap.xml` index (root + **only subdomains with a real sitemap**: onlineruler, character-counter)
- [x] **Leak guard:** `scripts/check-dist.ts` run after build (and in CI) fails if `dist/` contains any private/draft slug or name from catalog.yaml (case-insensitive), covering code, CSS class names and HTML
- [x] No-JS phone nav: when JS is absent, show the header nav links inline (e.g. `html:not([data-js])` rule + set `data-js` in the inline head script) so the prerendered menu works without JavaScript
- [x] `robots.txt` kept; CSP + referrer policy as `<meta>` (PRD H3)
- [x] Test: built HTML contains content without JS; **no "verdict" string in `dist/`** (private-leak test); hydration has no mismatch warnings
- **Done when:** `view-source` of every route shows full content, and the sitemaps validate

## Phase 9 — Ads, consent and analytics

- [x] Keep `google-adsense-account` meta + `adsbygoogle.js` client script on every page; keep `ads.txt`
- [x] **Consent Mode v2 defaults** (all denied, `wait_for_update`) before gtag/AdSense load; GA4 `G-PCZPZC1H5E` kept
- [x] Q7 Owner has published the **AdSense Privacy & messaging** consent message. Footer "Cookie settings" reopens it (`googlefc.callbackQueue.push(googlefc.showRevocationMessage)`).
- [x] **AdSense Auto ads** (owner decision, 2026-11-11): no manual `AdSlot` units. The site loads only the AdSense script. Placement and density are configured in the AdSense console. Owner action at approval: enable Auto ads and exclude the 404, privacy, terms and contact pages via page exclusions (or set `data-ad-client` page-level opt-out).
- [x] Layout hardening for Auto ads: content max-width wrappers, no `overflow:hidden` on page sections that would clip injected ads, stable image dimensions (minimises CLS from injected units)
- [x] GA4 events: `select_content`, `outbound_app_open`, `search`, `filter_category`, `theme_change`
- [ ] Browser verification (Phase 12): with consent denied no GA/ads cookies; with consent granted events show in GA4 DebugView
- **Done when:** with consent denied there are no GA/ads cookies (checked in DevTools), and with consent granted the events show in GA4 DebugView

## Phase 10 — Preview screenshots

- [x] `scripts/previews/capture.ts` (`npm run previews [-- <slug>]`): Playwright, light + dark × desktop 1280×800 + mobile 390×844
- [x] **Block** `googlesyndication|doubleclick|googletagmanager|google-analytics|fundingchoicesmessages` and hide consent banners during capture (no invalid ad traffic)
- [x] Theme forcing: `colorScheme` emulation, plus a per-app localStorage/query override in YAML when an app ignores `prefers-color-scheme`
- [x] Convert with sharp → WebP (q≈80) in `public/previews/`, plus 1200×630 OG crops; commit the outputs
- [x] Capture all 5 public apps; review the images
- [ ] Follow-up: per-app capture actions (Game of Life: Random + Start before shooting, so the card isn't an empty grid); store a single image when an app ignores color-scheme (ruler, Game of Life, Ping Pong, Primordia) instead of identical light/dark files
- **Done when:** every public card shows real screenshots in both themes, each under 80 KB

## Phase 11 — Add-app tooling (PRD §5.8)

- [ ] Core `scripts/catalog/add-app.ts`: probe, 9 readiness checks, draft entry written with comments preserved (`yaml` Document API), schema validation
- [ ] CLI: `npm run catalog:add -- <sub>` (prompts) and `npm run catalog:check` (readiness table for all entries)
- [ ] Studio: `vite-plugin-studio.ts` (`apply: 'serve'`) serving `/__studio` per the `Studio` design board: list/reorder/status, add flow, capture previews, publish gate (R6)
- [ ] `.github/workflows/add-app.yml` (`workflow_dispatch` inputs → run the core → `peter-evans/create-pull-request` with the readiness report in the PR body)
- [ ] (P2) `.github/workflows/health-check.yml`: weekly; issue on downtime or a lost tag
- [ ] Test: Studio code absent from `dist/`; core script tested against a recorded HTML fixture
- **Done when:** adding a dummy subdomain through each of the 3 routes produces the same YAML diff

## Phase 12 — QA, launch and merge

- [ ] Lighthouse mobile (home + one detail): ≥ 95 / 100 / 100 / 100; LCP < 2.0s, CLS < 0.05
- [ ] axe a11y scan: 0 violations; keyboard and screen-reader pass (VoiceOver)
- [ ] Cross-browser: Chrome, Safari, Firefox, Edge, iOS Safari, Android Chrome
- [ ] Link checker over `dist/` (internal + subdomain links)
- [ ] AdSense readiness checklist (PRD §5.6 A6): original content, nav, privacy, contact, about, no thin pages
- [ ] Owner: final review on a local `npm run preview`
- [ ] Merge `feat/catalog-hub` → `master` (owner approval), watch the deploy, smoke-test https://deviloper.dev
- [ ] Post-launch: submit the sitemap in Search Console; request AdSense review (once the CMP is live); enable `ADS_ENABLED` after approval
- **Done when:** the site is live on deviloper.dev and the AdSense review has been requested

---

## Carried over from the archived plan

| Old item | Where it lands |
|---|---|
| Reduced motion support | Phase 3/5 (all motion gated) |
| Remove unused deps | Phase 1 |
| Skip-to-content link | Phase 4 |
| Theme logic centralisation | Phase 3 (single `tokens.css`) |
| Error boundary | Phase 4 (root boundary around hydrated islands) |
| Console error cleanup | Phase 1 (old code removed); new code logs only in dev |
| Focus trap in modal | n/a: no modals in the new design |
| Loading state for GitHub data | n/a: data is build-time |
| react-helmet migration | Replaced by the prerender `Seo` component (Phase 8) |
| Bundle analysis | Phase 12 (`rollup-plugin-visualizer`, one-off) |

## Owner checklist (actions/answers outside code)

| # | Item | Needed by |
|---|---|---|
| ✅ | GitHub token: owner confirms it was a fake test token; secret removed | — |
| ✅ Q2 | Resume files: keep all, unlinked | — |
| ✅ Q3/Q4 | Footer: email only | — |
| — | Approve the 5 public app descriptions | Phase 2 |
| ✅ Q6 | About page: yes | — |
| ✅ Q9 | Terms page: yes | — |
| ✅ Q7 | Consent message published | — |
| ✅ Q8 | Auto ads | — |
| ✅ Q10 | Search Console domain property verified | — |
| ✅ | D1–D3 approved | — |
| — | Approve merge to `master` | Phase 12 |

## Progress log

| Date | Phase | Note |
|---|---|---|
| 2026-11-11 | 0 | PRD, registry, design canvas and this plan completed; old plan archived |
| 2026-11-11 | 1 | Partial: portfolio code/tests/data, jest config, .env.production, root CNAME, yarn.lock removed; deps swapped (zod, vitest, yaml, tsx); token steps removed from deploy.yml. The `ghp_` value in history (5ffe4dd) is, per the owner, a fake test token. |
| 2026-11-11 | 1 | ✅ Complete: Vite/Vitest config, tsconfig, index.html shell, placeholder entry + test, ci.yml, CLAUDE.md/AGENTS.md. lint/typecheck/test/build green, no sourcemaps. |
| 2026-11-11 | 3 | ✅ Tokens (Workbench palette), global CSS, no-flash script, useTheme/ThemeToggle, contrast test. Light `--color-live` → #047857 and `--color-warn` → #A94F08 for AA on chip-bg. 40 tests green. |
| 2026-11-11 | 2 | ✅ zod schema, YAML loader, `virtual:catalog` Vite plugin (public-only, build fails on bad data), query helpers, 6 entries (Verdict private). 110 tests green; no `verdict` and no zod in the client bundle. Owner copy review pending. |
| 2026-11-11 | 4 | ✅ SkipLink, Header (phone disclosure menu), email-only Footer with Cookie settings (googlefc), ErrorBoundary, Layout, Container, 404 content page. 15 tests green. Follow-up for no-JS phone nav added to Phase 8. |
| 2026-11-11 | 5 | ✅ Home: hero, search (/, ⌘K, Esc, URL sync), category chips, cards with stretched link + Open CTA (full width on phone), CSS preview art, lazy framer-motion reflow, empty state, analytics events. Found the private app name leaking via an illustration's CSS class names; removed it, and added a dist leak guard to Phase 8. |
| 2026-11-11 | 7 | ✅ ProsePage + Privacy (CMP, Consent Mode, AdSense Auto ads, GA4, hosts, rights), Terms, About, Contact (copy-email), human Sitemap, all generated from public data. Owner legal review pending. |
| 2026-11-11 | 6 | ✅ Detail template for live/beta apps: breadcrumbs, hero + CTA, about/features/how-to, At a glance aside, desktop callout, related apps, view-transition names, meta helpers. 243 tests green. |
| 2026-11-12 | 8 | ✅ Route registry, SSR entry, prerender of 12 pages, per-route head + JSON-LD, generated sitemaps, check-dist leak guard in `npm run build`, no-JS phone nav, theme hydration fix. No CSP (AdSense needs it open). |
| 2026-11-12 | 10 | ✅ Playwright capture with ad hosts blocked; screenshots + OG PNGs for 5 apps. Follow-up: Game of Life empty grid, dedupe theme-agnostic shots. |
| 2026-11-12 | 9 | ✅ Consent Mode v2 region defaults (EEA/UK/CH denied, elsewhere granted) before AdSense + gtag; ads_data_redaction; track() wrapper + theme_change; privacy Consent section aligned; no page-level overflow clipping found. Browser verification in Phase 12. |
