# How to add a new app

All three routes run the same core (`scripts/catalog/core.ts`): probe
`https://<sub>.deviloper.dev`, run the 9 readiness checks, write a
`status: draft` entry to `src/data/catalog.yaml` (comments and formatting kept),
and validate it against the schema. Readiness warnings never block listing.
Going public (`live`, `beta`, `coming-soon`) needs the publish gate: tagline
≤ 90 characters, description ≥ 150 words, 3+ features and 3+ how-to steps, and
a captured preview for `live`/`beta`.

The CMP check is a proxy. Google's consent message is served by the AdSense
tag, so "AdSense tag present" is reported as a WARN with that label. Check in
AdSense that the message is published.

## 1. Studio (local, visual)

```bash
npm run dev            # then open http://localhost:3000/__studio
```

Type the subdomain and click **Fetch details**, then review the readiness
checks. Fill in the details (the counters show the publish gate), save as a
draft, capture previews, and publish. The list on the left reorders entries
(drag, or ↑/↓) and changes their status. Studio exists only under `vite`
(`apply: 'serve'`), answers only on `localhost`, and refuses cross-origin
POSTs. It switches itself off if you start the dev server with `--host`.

## 2. CLI

```bash
npm run catalog:add -- my-new-thing --category tool --tagline "Does one thing well."
npm run catalog:add -- my-new-thing --yes --no-previews   # non-interactive, skip screenshots
npm run catalog:check                                       # readiness table for every entry
npm run catalog:check -- --json                             # machine-readable
```

If a field is missing and the terminal is interactive, `catalog:add` asks for
it. Previews need Chromium (`npx playwright install chromium`). When it
finishes, write the description, set `status: live` and commit.

## 3. GitHub Action (away from your laptop)

GitHub → **Actions** → **Add app to catalog** → **Run workflow**. Enter the
subdomain, category and, if you like, a name and tagline. The workflow runs the
CLI with `--yes`, runs `npm test` and `npm run build`, and opens a PR on
`catalog/add-<sub>`. The PR body holds the readiness table and a checklist. It
never deploys; merging to `master` does.

The weekly **Catalog health check** workflow re-probes every entry. If a live
app goes down or loses a tag it used to have, it opens or updates a single
`catalog-health` issue.
