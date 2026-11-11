# PRD — deviloper.dev Catalog Hub

| | |
|---|---|
| **Status** | Draft — awaiting owner sign-off |
| **Owner** | Yogesh Joshi |
| **Branch** | `feat/catalog-hub` (treated as main until merged back to `master`) |
| **Created** | 2026-11-11 |
| **Companion docs** | [`subdomains.md`](./subdomains.md) · [`catalog-implementation-plan.md`](./catalog-implementation-plan.md) · Design: [`../design/`](../design/README.md) |

---

## 1. Summary

Turn the root domain **deviloper.dev** from a personal portfolio into the **catalog hub** for everything hosted on `*.deviloper.dev`: micro-tools, small games, and side apps. Each entry gets a preview (auto-captured screenshot, light and dark), a description, and a crawlable detail page. The root domain is also the property used for **Google AdSense approval** for the root and every subdomain, so the hub must meet AdSense's content, policy, and consent requirements. Ad and analytics wiring that exists today (publisher ID, `ads.txt`, GA4, privacy policy, sitemaps) is kept or migrated, never dropped.

The portfolio content (experience, skills, GitHub projects, resume) is **removed entirely** at the owner's request.

## 2. Background and current state

| Area | Today |
|---|---|
| Stack | React 18 + TypeScript + Vite 5 + styled-components + framer-motion, deployed to GitHub Pages via `.github/workflows/deploy.yml` on push to `master` |
| Content | Portfolio loaded at runtime from `public/data.yaml`; projects fetched from the GitHub GraphQL API |
| Crawlable HTML | `index.html` contains a hand-written static copy of the portfolio inside `#root`, which React replaces on load |
| AdSense | `google-adsense-account` meta + `adsbygoogle.js?client=ca-pub-5076417401305199` in `<head>`; `public/ads.txt` = `google.com, pub-5076417401305199, DIRECT, f08c47fec0942fa0` |
| Analytics | GA4 `G-PCZPZC1H5E`, loaded **unconditionally** on root (no consent banner on root, which contradicts the privacy policy's own wording) |
| Legal / SEO pages | `public/privacy-policy.html`, `public/sitemap.html`, `public/sitemap.xml` (index → `sitemap-main.xml` + each subdomain's `sitemap-index.xml`), `robots.txt` |
| Active subdomains (6) | Online Ruler, CharCap, Game of Life, Ping Pong, Primordia, Verdict. Full registry and per-site AdSense/SEO readiness: [`subdomains.md`](./subdomains.md). Only Online Ruler and CharCap carry AdSense, GA4, consent and full metadata today. Verdict requires sign-in. |
| Security issue | `VITE_GITHUB_TOKEN` is inlined into the public JS bundle (all `VITE_*` vars are), and production sourcemaps are on. **The token must be revoked**, whatever else is decided. |

## 3. Goals

1. **G1 Discovery.** A visitor finds and opens any deviloper.dev app within 10 seconds of landing, using search, filters, or browsing.
2. **G2 AdSense approval.** The root domain passes AdSense site review and serves ads compliantly on root and subdomains, including the EEA/UK/CH consent requirement.
3. **G3 Delight.** The UI feels fluid and polished: instant search, animated filtering, smooth theme switching, and no layout shift or theme flash.
4. **G4 Low-maintenance growth.** Adding a new app means one YAML entry plus running the preview script.
5. **G5 SEO.** Every app has an indexable detail page with unique copy, metadata, and structured data.

### Non-goals

- Hosting or building the sub-apps themselves (each lives in its own repo).
- User accounts, comments, ratings, or any backend.
- A blog or CMS (can be revisited later; see §12).
- Keeping any portfolio or resume content.

## 4. Users

| Persona | Need |
|---|---|
| **Drive-by visitor** (search or social referral) | Understand what's here, pick a tool quickly, trust that it's safe and free |
| **Returning user** | Jump straight to a known tool, or see what's new |
| **AdSense / Search reviewer** (human or bot) | Original content, clear navigation, privacy policy, contact, no thin pages, compliant ad placement |
| **Owner** | Add or update apps with minimal effort |

## 5. Functional requirements

### 5.1 Catalog home (`/`)

| ID | Requirement | Priority |
|---|---|---|
| F1 | Hero with site name, a one-line value proposition, and the search field visible above the fold on mobile and desktop | P0 |
| F2 | **Instant search** across name, tagline, tags, and category. Client-side and fuzzy-tolerant. Focus with `/` or `⌘K`/`Ctrl+K`. Esc clears it. | P0 |
| F3 | **Category filter chips:** All · Tools · Games · Simulations · Apps (generated from data; empty categories hidden). Selection is reflected in the URL (`?category=games&q=ruler`) so it can be shared and survives back/forward. | P0 |
| F4 | **Card grid**, responsive: 1 column under 640px, 2 at 768px, 3 at 1024px or wider. Each card shows: preview image (matches the active theme), icon, name, tagline, category badge, status badge (Live / Beta / Coming soon), up to 3 tags. | P0 |
| F5 | Card interactions: the whole card links to the detail page. A secondary "Open app ↗" button goes straight to the subdomain. Hover lift and focus ring. Fully keyboard operable. | P0 |
| F6 | Animated reflow when filtering or searching (framer-motion `layout`). Disabled under `prefers-reduced-motion`. | P1 |
| F7 | "Featured" row or larger hero card for entries flagged `featured: true` | P1 |
| F8 | Empty-search state with suggestions and a clear-filters action | P0 |
| F9 | Sort: Featured (default) · Newest · A–Z | P2 |
| F10 | "Recently updated" signal (badge when `updatedAt` is within 30 days) | P2 |

### 5.2 App detail page (`/apps/<slug>/`)

| ID | Requirement | Priority |
|---|---|---|
| D1 | Large preview (light/dark pair), name, tagline, status, category, primary CTA "Open <name> ↗" to the subdomain | P0 |
| D2 | **Original long description** (150–400 words), "What you can do" feature list, "How to use" steps, and a privacy note (e.g. "runs entirely in your browser") | P0 |
| D3 | Related apps (same category or shared tags), up to 3 | P1 |
| D4 | Breadcrumb (Home → Category → App) with `BreadcrumbList` JSON-LD | P1 |
| D5 | Shared-element transition from card to detail page using the View Transitions API, as progressive enhancement with an instant fallback | P2 |
| D6 | "Coming soon" entries get a detail page only if they have enough original copy. Otherwise they show on the home page with no link (avoids thin-content pages). | P0 |

### 5.3 Site pages (existing URLs preserved)

| ID | Page | Notes | Priority |
|---|---|---|---|
| S1 | `/privacy-policy.html` | Migrated into the new layout, with theme support. Content updated: remove portfolio/GitHub-API sections, list every catalog app, describe CMP + Consent Mode, keep the AdSense and GA4 disclosures and opt-out links. **Same URL.** | P0 |
| S2 | `/sitemap.html` | Human sitemap generated from the catalog data. **Same URL.** | P0 |
| S3 | `/about.html` or `/about/` | **About this site:** what deviloper.dev is, who builds it, how the apps are made, and how they're funded (ads). Not a portfolio. AdSense reviewers look for this page, so see open question Q6. | P0 (pending Q6) |
| S4 | `/contact/` | Contact page with a real email (no form; there's no backend) | P0 |
| S5 | `/terms.html` | Terms of use (pending Q9) | P1 |
| S6 | `/404.html` | Custom 404 with search and links back into the catalog (GitHub Pages serves `404.html`) | P0 |
| S7 | Footer on every page | Links: Home · About · Contact · Privacy · Terms · Sitemap · Cookie settings (reopens the CMP). © year, site name. | P0 |

### 5.4 Theme (dark / light / auto)

| ID | Requirement | Priority |
|---|---|---|
| T1 | Three modes, `light → dark → auto` cycle (existing behaviour), persisted in `localStorage` | P0 |
| T2 | **No flash of the wrong theme.** A tiny inline `<head>` script sets `data-theme` before first paint. | P0 |
| T3 | Smooth cross-fade between themes (View Transition, or a CSS transition on colour tokens), off under reduced motion | P1 |
| T4 | Previews swap to the matching light or dark screenshot via `<picture>` + `prefers-color-scheme`, overridden by an explicit theme | P0 |
| T5 | WCAG AA contrast in both themes for all text and controls | P0 |
| T6 | `<meta name="theme-color">` updates per theme | P2 |

### 5.5 Previews (auto screenshots)

| ID | Requirement | Priority |
|---|---|---|
| P1 | `npm run previews` runs a Playwright script that visits each **live** catalog URL and captures **light + dark** screenshots at 1280×800 (desktop) and 390×844 (mobile) | P0 |
| P2 | **Ad and analytics requests are blocked during capture** (`googlesyndication`, `doubleclick`, `googletagmanager`, `google-analytics`, `fundingchoicesmessages`). This prevents automated ad impressions, which count as invalid traffic, and keeps ad slots out of the screenshots. The CMP banner is dismissed or hidden. | P0 |
| P3 | Output converted to WebP (and AVIF, optional) in `public/previews/<slug>-{light,dark}-{desktop,mobile}.webp`, committed to the repo. Not run in CI, to avoid flaky builds and repeated hits on live sites. | P0 |
| P4 | Manual override: if `preview.light` or `preview.dark` is set in YAML, that file is used instead | P1 |
| P5 | Fallback when there's no image: generated gradient tile from `accent` colour + icon (no placeholder JPG) | P0 |
| P6 | Images have explicit `width`/`height`, `loading="lazy"` below the fold, and `fetchpriority="high"` for the first row | P0 |

### 5.6 Ads, consent and analytics (AdSense readiness)

| ID | Requirement | Priority |
|---|---|---|
| A1 | Keep `google-adsense-account` meta, the `adsbygoogle.js` client script and `ads.txt` (root `ads.txt` covers all subdomains) | P0 |
| A2 | **Google-certified CMP** for EEA/UK/Switzerland traffic (required by Google to serve ads there). Recommended: AdSense **Privacy & messaging** (GDPR message + US state regulations message), configured in the AdSense console. One setup covers every site in the account. | P0 (owner action) |
| A3 | **Google Consent Mode v2**: `gtag('consent','default',{…denied})` for ad_storage, ad_user_data, ad_personalization and analytics_storage **before** GA4/AdSense load. The CMP updates consent. GA4 stays in place but respects consent. | P0 |
| A4 | Reusable `<AdSlot>` component: lazy-mounted on viewport entry, reserved min-height (no CLS), labelled "Advertisement", never adjacent to clickable cards or CTAs (≥ 24px spacing plus a visual separator) to avoid accidental clicks | P0 |
| A5 | Placement (manual units, not Auto Ads, for layout control): home has one unit after the first card row (in-feed) and one above the footer. Detail page has one unit after the description. **No ads** on 404, privacy, terms or contact. **Ad units are added only after AdSense approval**; until then only the verification script loads. | P0 |
| A6 | Content quality bar for review: no lorem ipsum, no "under construction" pages, every indexable page has substantial original text, working navigation, no broken links | P0 |
| A7 | GA4 events: `select_content` (card → detail), `outbound_app_open` (CTA → subdomain), `search` (debounced), `filter_category`, `theme_change` | P1 |
| A8 | "Cookie settings" footer link reopens the CMP (`googlefc.callbackQueue` / `showRevocationMessage`) | P0 |

### 5.7 SEO and metadata

| ID | Requirement | Priority |
|---|---|---|
| E1 | **Prerendered static HTML for every route** at build time, then hydrated. Replaces today's hand-maintained static copy in `index.html`. | P0 |
| E2 | Unique `<title>`, meta description, canonical, OG and Twitter tags per route | P0 |
| E3 | JSON-LD: `WebSite` (with `SearchAction`) + `ItemList` on home. `WebApplication` / `VideoGame` + `BreadcrumbList` on detail pages. `Person` as publisher. | P1 |
| E4 | `sitemap-main.xml` generated at build from routes + `updatedAt`. Sitemap index keeps each subdomain's sitemap. | P0 |
| E5 | OG image per app: desktop light preview at 1200×630 | P1 |

### 5.8 Adding and managing apps (new subdomains)

New subdomains must be easy to add without hand-editing several files. One shared core script powers three entry points.

| ID | Requirement | Priority |
|---|---|---|
| R1 | **Single source of truth:** `src/data/catalog.yaml`. Everything else (cards, detail pages, sitemap, JSON-LD, footer links, OG images) is generated from it at build time. | P0 |
| R2 | **Core script `scripts/catalog/add-app.ts`:** given a subdomain, it (a) probes `https://<sub>.deviloper.dev` and reads `<title>`, meta description, OG tags, theme-color and icon, (b) runs a **readiness check**: HTTPS, title, description, OG image, real sitemap (not a soft 404), AdSense tag, GA4 tag, consent/CMP, privacy link, (c) captures light/dark previews with ads blocked (§5.5), (d) writes a **draft** entry (`status: draft`) to `catalog.yaml`, keeping comments and order, and (e) validates against the schema | P0 |
| R3 | **CLI:** `npm run catalog:add -- <subdomain>` (interactive prompts for category, tagline and description). `npm run catalog:check` re-runs readiness for all entries. | P0 |
| R4 | **Studio (dev-only UI) at `/__studio`:** available only under `npm run dev`. A Vite dev-server middleware calls the core script and writes the YAML. **Excluded from the production build**, so there's no admin surface on the live site and nothing to secure. Lists all apps (edit, reorder, hide or draft), plus an "Add app" flow: subdomain → fetch → prefilled form with readiness checklist → capture previews → live card preview → save as draft / publish. | P1 |
| R5 | **GitHub Action `add-app.yml` (workflow_dispatch):** inputs are subdomain, name, category and tagline. It runs the core script and **opens a PR** with the YAML and preview changes, so you can add an app from the GitHub mobile app. Merging deploys. | P1 |
| R6 | **Publish gate:** an entry can move from `draft` to `live` only if it has name, category, tagline (≤ 90 chars), description (≥ 150 words), at least 1 preview, and a reachable URL. Readiness warnings (no ads tag, no sitemap) don't block listing but are shown in the Studio and the PR body. | P0 |
| R7 | **Weekly health check (scheduled Action):** pings every live entry and reports downtime or a lost AdSense/GA tag as a GitHub issue; refreshes screenshots via PR if they've changed noticeably | P2 |
| R8 | Sitemap index includes a subdomain only when R2 detects a real sitemap | P0 |

> Not chosen: a runtime admin panel on the live site (GitHub Pages is static, so it would need auth plus a backend: added attack surface and cost). Auto-discovery from DNS (subdomains are on mixed hosts: GitHub Pages, Cloudflare Pages and a Next.js host, so there's no single API). Both can be revisited later.

### 5.9 Hosting: GitHub Pages (owner requirement)

The hub is built and hosted on **GitHub Pages** via GitHub Actions. Everything must work as static files:

| ID | Constraint → design decision |
|---|---|
| H1 | **Static output only.** No server code, API routes or middleware in production. Every route is prerendered to `dist/<route>/index.html` (or `.html` for preserved legacy URLs). |
| H2 | **No server redirects or rewrites.** Keep legacy URLs as real files (`/privacy-policy.html`, `/sitemap.html`). Removed URLs fall to the custom `404.html`. Optional `<meta http-equiv="refresh">` stubs only if a moved URL matters. |
| H3 | **No custom response headers.** CSP and referrer policy go in `<meta>` tags. Caching relies on Vite's hashed asset filenames. |
| H4 | **Custom domain:** `public/CNAME` = `deviloper.dev` is kept (the duplicate root `CNAME` file is removed). HTTPS is enforced in the repo's Pages settings. |
| H5 | **Deploy:** the existing `deploy.yml` (push to `master` → build → `upload-pages-artifact` → `deploy-pages`). This branch adds a `ci.yml` (lint, type-check, test, build) on PRs and on `feat/catalog-hub` pushes, but **does not deploy** from the branch. Production deploys only after the merge to `master`. |
| H6 | **Secrets:** none needed at runtime. The `VITE_GITHUB_TOKEN` step and secret are removed. |
| H7 | **Add-app automation** stays inside GitHub: the CLI and Studio run locally, and the `add-app.yml` and weekly health-check Actions run on GitHub runners and open PRs. Screenshots are committed to the repo (Pages can't generate them). |
| H8 | **Size:** Pages has a 1 GB site limit and a soft 100 GB/month bandwidth limit. Previews are WebP, about 60 KB each × 4 per app, which is well within both. |

## 6. Non-functional requirements

| Area | Target |
|---|---|
| Performance | Lighthouse mobile ≥ 95 Perf / 100 A11y / 100 Best Practices / 100 SEO (before ad units are added). LCP < 2.0s, CLS < 0.05, INP < 200ms. JS < 120 KB gzip on home. |
| Accessibility | WCAG 2.2 AA. Skip link, visible focus, semantic landmarks, `aria-live` result count for search, reduced-motion support. |
| Browsers | Last 2 versions of Chrome, Safari, Firefox and Edge, plus iOS Safari 16+. View Transitions as progressive enhancement. |
| Privacy | No first-party data collection. No cookies before consent where required. |
| Security | No secrets in the client bundle. Production sourcemaps off (or `hidden`). Third-party scripts limited to Google ads/analytics/fonts. |
| Maintainability | Catalog data validated against a schema at build time (the build fails on a missing description, bad slug, or missing preview for a live app) |

## 7. Data model — `src/data/catalog.yaml`

Imported at **build time**, not fetched at runtime, so there's no loading state and no layout shift, and prerendering works.

```yaml
site:
  name: Deviloper.dev            # Q5: confirm
  tagline: Side projects, small tools & games.   # draft, owner to approve
  email: hello@deviloper.dev     # Q4: confirm
  social:                        # Q3: confirm which to keep
    github: https://github.com/iyogeshjoshi
    linkedin: https://linkedin.com/in/iyogeshjoshi
    x: https://x.com/iyogeshjoshi

apps:
  - slug: online-ruler
    name: Online Ruler
    url: https://onlineruler.deviloper.dev
    category: tool               # tool | game | simulation | app
    status: live                 # live | beta | coming-soon | draft | private
                                 # draft + private are never built into public pages, sitemaps or search (Verdict = private)
    featured: true
    tagline: Actual-size screen ruler in cm, inches and pixels
    description: >-               # 150–400 words, original
      …
    features: [ … ]
    howTo: [ … ]
    tags: [measurement, calibration, ppi]
    privacy: Runs entirely in your browser; calibration saved locally.
    accent: '#64ffda'
    icon: ruler                  # inline SVG icon key
    launchedAt: 2026-06-17       # Q1: confirm dates
    updatedAt: 2026-06-17
    preview: {}                  # optional manual overrides
```

TypeScript types are derived and validated with a small schema (e.g. `zod`) during the build.

## 8. Information architecture

```
/                         Catalog home (search, filters, grid)
/apps/<slug>/             App detail (one per live/beta app)
/about/                   About this site            (pending Q6)
/contact/                 Contact
/privacy-policy.html      Privacy policy             (URL preserved)
/terms.html               Terms of use               (pending Q9)
/sitemap.html             Human sitemap              (URL preserved)
/sitemap.xml              Sitemap index              (URL preserved)
/sitemap-main.xml         Root sitemap, generated    (URL preserved)
/ads.txt  /robots.txt  /CNAME                        (preserved)
/404.html                 Not found
```

Category views use the query string (`/?category=games`) rather than separate pages until there are more than 6 apps in a category. Separate pages before that would be thin content.

## 9. What is removed

- Portfolio components: Hero, About, Experiences, Skills, SoftSkills, Projects, ProjectGallery, ProjectDetailModal, DownloadButton, Contact (rebuilt), and their tests
- `public/data.yaml`, `src/utils/github.ts`, `src/utils/projectManager.ts`, `src/data/projects.ts`, `src/types/project.ts`
- The GitHub token step in `deploy.yml` and the `VITE_GITHUB_TOKEN` secret (**revoke the PAT**)
- Unused dependencies: `jspdf`, `html2canvas`, `react-to-pdf`, `@react-pdf/renderer`, `react-router-dom` (if the prerender approach doesn't need it), `react-helmet`
- Resume files in `public/` (pending Q2; note that `.tex` and `.pages` sources are publicly downloadable today)
- `docs/improvement-plan.md` → archived to `docs/archive/improvement-plan.md` ✅

## 10. Success metrics

| Metric | Target | Source |
|---|---|---|
| AdSense site status | "Ready" within 1 review cycle after launch | AdSense console |
| Home → app click-through | ≥ 40% of sessions click an app (detail or outbound) | GA4 `select_content` / `outbound_app_open` |
| Outbound referrals to subdomains | +30% vs 4 weeks before launch | GA4 per-subdomain referral |
| Lighthouse | Targets in §6 | CI / manual |
| Indexed pages | All detail pages indexed within 4 weeks | Search Console |

## 11. Risks

| Risk | Mitigation |
|---|---|
| AdSense rejects as "low-value content" (only 2 apps) | Long-form original descriptions and how-to content per app, a real About page, no thin "coming soon" pages, complete legal pages |
| No CMP means no ads served in EEA/UK | Configure AdSense Privacy & messaging before requesting review (owner action) |
| Screenshots generate invalid ad traffic | Block ad and analytics hosts in Playwright (P2) |
| Prerender + styled-components hydration mismatch | Use `ServerStyleSheet` during prerender. Hydration test in CI. |
| Removing the portfolio breaks inbound links to resume or anchors | Q2 decision. Custom 404 routes visitors back into the catalog. |
| 4 of 6 subdomains lack metadata, AdSense, consent and sitemaps (see `subdomains.md`) | Hub detail pages carry the original content. Sitemap index lists only real sitemaps. Per-subdomain AdSense rollout tracked as follow-ups. |
| Verdict (private, sign-in) accidentally exposed in the catalog | `status: private` is excluded from pages, sitemap, search index and JSON-LD by the build; schema test asserts it |
| Cross-host sitemap index ignored | Use a Search Console **Domain property** for `deviloper.dev` so subdomain sitemaps can be referenced from the root index |

## 12. Future (out of scope for v1)

Per-category landing pages once a category has more than 6 apps, a changelog/"what's new" feed, a lightweight blog for tool guides (good for AdSense content depth), PWA install, i18n.

## 13. Open questions (blocking items marked ⛔)

| # | Question | Blocks |
|---|---|---|
| ✅ Q1 | ~~Full list of subdomains~~ — **resolved 2026-11-11**: 6 active, see [`subdomains.md`](./subdomains.md). Per-app follow-ups (Primordia description, Ping Pong controls, Verdict data handling) are listed there. | — |
| ⛔ Q2 | Resume files (`yogesh_resume*.pdf/.docx/.tex/.pages`, `Deviloper.png`): delete, or keep at the same URLs unlinked? | Cleanup phase |
| Q3 | Footer social links: keep GitHub, LinkedIn and X, or a subset? | Footer |
| Q4 | Is `hello@deviloper.dev` still the right public contact email? | Contact, privacy, footer |
| ✅ Q5 | ~~Hero tagline~~: owner wants a generic "collection of my side projects" line. Draft in the design: **"Side projects, small tools & games."** + sub-line. Owner to approve the final wording. | Hero, metadata |
| ⛔ Q6 | OK to have a short **"About this site"** page (who builds it, why, how it's funded)? Not a portfolio, but AdSense reviewers expect one. | IA, AdSense |
| ⛔ Q7 | Will you set up **AdSense Privacy & messaging** (GDPR + US states) in the AdSense console? I'll provide steps; it can't be done from code. | Ads/consent |
| Q8 | Ad placement density: OK with the placements in A5 (2 units on home, 1 per detail page) after approval? | Ads |
| Q9 | Do you want a Terms of Use page? | IA |
| Q10 | Is `deviloper.dev` set up as a Search Console **Domain property**? | Sitemaps |
| Q11 | Do the subdomains each have their own privacy policy, or do they link to the root one? (This affects the policy's scope wording.) | Privacy |
