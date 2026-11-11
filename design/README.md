# Catalog Hub — Design

Live canvas (private until shared): https://claude.ai/artifact/DHgzh7pKQ6z93KsTekjwmQ

Source of truth for the canvas lives in `project/`:

| File | Artboard |
|---|---|
| `project/canvas.json` | Canvas index (layout, notes) |
| `project/Main.dc.html` | Catalog home, desktop. Interactive: search, category chips, light/dark/auto toggle. |
| `project/Detail.dc.html` | App detail page (Online Ruler), interactive theme toggle |
| `project/Mobile.dc.html` | Catalog home at 390px, light theme, interactive |
| `project/Studio.dc.html` | **Studio**: dev-only "Add app" flow (subdomain → readiness check → details → previews → save). Interactive. See PRD §5.8. |

## Look: "Workbench"

- **Type:** Space Grotesk (headings), Inter (body), JetBrains Mono (labels/meta)
- **Dark:** bg `#0A0F1A`, surface `#111827`, border `#1E293B`, text `#E6EDF7`, muted `#9AA8BE`, accent `#2DD4BF` (on-accent `#042F2A`)
- **Light:** bg `#F6F7F9`, surface `#FFFFFF`, border `#E2E7EE`, text `#0E1420`, muted `#4A5568`, accent `#0F766E` (on-accent `#FFFFFF`)
- Radius 16px cards / 12–14px controls. Touch targets ≥ 44px. 24px grid gap.

## Placeholders still in the design

- All 6 live subdomains are shown (registry: `docs/subdomains.md`). Primordia's and Ping Pong's copy is inferred from their live apps and needs owner confirmation.
- Hero tagline is a draft (PRD Q5)
- Card previews are CSS illustrations; real screenshots come from the build-time capture script (PRD §5.5)
- Ad slots are reserved boxes; real units only after AdSense approval (PRD A5)

See [`../docs/catalog-prd.md`](../docs/catalog-prd.md).
