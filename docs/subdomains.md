# Subdomain Registry — *.deviloper.dev

Source: owner, 2026-11-11 ("for now these are all the active sub-domains").
Probed: 2026-11-11 (`curl` of the live homepage, `/sitemap.xml`, `/sitemap-index.xml`).

This file is the human record. At implementation, the machine source of truth becomes `src/data/catalog.yaml` (PRD §7), and new apps go in through the add-app flow (PRD §5.8).

## Active subdomains

| # | Subdomain | Name | Proposed category | What it is (from the live site) | Confidence |
|---|---|---|---|---|---|
| 1 | https://onlineruler.deviloper.dev | Online Ruler | Tool | Actual-size screen ruler (cm/in/px) with PPI calibration by device, diagonal or bank card | High (full meta) |
| 2 | https://character-counter.deviloper.dev | CharCap | Tool | Real-time character counter with limits for 20+ platforms (X, Instagram, LinkedIn, TikTok, YouTube, SMS, SEO) | High (full meta) |
| 3 | https://gameoflife.deviloper.dev | Game of Life | Simulation | Conway's Game of Life on a canvas (p5.js): Start / Stop / Reset / Random, generation counter | High (UI text) |
| 4 | https://ping-pong.deviloper.dev | Ping Pong | Game | Single-player Pong against the computer, played with the mouse, on a 600×400 canvas | High (owner-confirmed 2026-11-11) |
| 5 | https://primordia.deviloper.dev | Primordia | Simulation | 3D (three.js) artificial-life sandbox: organisms with genomes, energy, lifespan, kills, offspring and generations; population charts. A run ends when one lineage takes over the world. | High (owner-confirmed 2026-11-11) |
| 6 | https://verdict.deviloper.dev | Verdict | App | "Settle it once. The immutable record of what your group actually decided." Group decisions are sealed once all required members weigh in and can't be rewritten afterwards. Requires sign-in. **Private — friends only; NOT listed in the public catalog, no AdSense** (owner, 2026-11-11). | High (meta + UI text) |

## AdSense / SEO readiness per subdomain

| Subdomain | AdSense tag | GA4 | Consent banner | Meta description | OG tags | Sitemap |
|---|---|---|---|---|---|---|
| onlineruler | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ `/sitemap-index.xml` |
| character-counter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ `/sitemap-index.xml` |
| gameoflife | ❌ | ❌ (Cloudflare Pages analytics only) | ❌ | ❌ | ❌ | ⚠️ `/sitemap.xml` returns the app HTML (soft 404) |
| ping-pong | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ soft 404 |
| primordia | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ soft 404 |
| verdict | ❌ | ❌ | ❌ | ✅ | ❌ | ⚠️ `307` redirect |

### Implications

1. **Catalog listing doesn't depend on these gaps.** All five public apps can be listed on the hub now. The hub's detail pages give each one crawlable original copy, whatever its own site has.
2. **Sitemap index:** list only subdomains that serve a real sitemap (onlineruler, character-counter). Add the others once they ship one; the add-app flow checks this.
3. **Ads on the subdomains:** gameoflife, ping-pong, primordia and verdict serve no ads today. Running ads on them later needs the AdSense script, the consent setup (CMP via AdSense Privacy & messaging) and meta tags. This is tracked as a follow-up per subdomain repo, outside this branch.
4. **Verdict is private** (friends only, no AdSense): it's excluded from the public catalog, sitemaps and the privacy policy scope. It's kept in `catalog.yaml` with `status: private` so it can be made public later. That will need a privacy-policy section for account data at that point.
5. **Thin pages:** Ping Pong and Primordia have minimal on-site text. Their hub detail pages carry the descriptions, controls and how-to-play notes (now owner-confirmed).

## Open per-app questions

- ~~Primordia: confirm description~~: confirmed. Still useful: controls, and whether it works on mobile.
- ~~Ping Pong controls~~: single-player vs computer, mouse only. (Is mouse-only a problem on touch devices? The detail page will say "desktop recommended".)
- Game of Life: any extras beyond Start/Stop/Reset/Random (drawing cells, speed)?
- Launch dates for each (for "Newest" sort and `launchedAt`); optional.
