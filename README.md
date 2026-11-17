# Fifty

The website for Pedro's walk from Reading to Finisterre in May 2028: an invitation to walk part of the route, where Pedro is each day, and a journal. It lives at fifty.pataruco.dev.

## How it is built

One renderer, in `packages/shared`, makes every page. A Cloudflare Worker (`apps/worker`) runs it on each request; plain Node (`apps/web`) runs it once to write The Book, the same pages saved as files that open from disk.

| Project | What it holds |
| --- | --- |
| `packages/shared` | The escaping `html` template, dates and distances, the English and Spanish copy, the itinerary, the page templates and the stylesheet |
| `apps/worker` | Routing, the guest cookie, response headers, browser checks and the smoke test |
| `apps/web` | The Book's export, and the static files the Worker serves (`robots.txt`, `_headers`) |

The stylesheet, logo and favicon reach every runtime through one generated module, `packages/shared/src/generated/assets.ts`. After changing `fifty.css` or a file in `src/brand`, run `pnpm exec moon run shared:styles` and commit the result.

## Getting started

You need Node 24 (`nvm use`) and pnpm.

```sh
pnpm install
```

## Running it locally

```sh
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
pnpm exec moon run worker:dev
```

Open http://localhost:8787 for English and http://localhost:8787/es/ for Spanish. Open `/hello/otter-lantern-meadow-harbour/` to become a guest and see the join buttons. The sample words and address are not real.

## Tests

```sh
pnpm exec moon run shared:lint worker:lint web:lint
pnpm exec moon run shared:typecheck worker:typecheck web:typecheck
pnpm exec moon run shared:test worker:test web:test
pnpm exec moon run worker:e2e    # Chromium and WebKit, with axe
pnpm exec moon run worker:build  # a dry-run deploy
```

The Worker's tests run inside workerd; the browser checks run against `wrangler dev`.

## The Book

```sh
pnpm exec moon run web:book
```

This writes `apps/web/dist/book/index.html` and `es/index.html`. Pass `--at <ISO date>` to `node src/book/export.ts` to write the Book for a given moment.

## Deploying

Nothing deploys on its own. See `docs/runbooks/secrets-and-words.md` for the secrets, the first deploy and the go-live checklist. After that, the **Deploy** workflow deploys a release tag, runs the smoke test and rolls back if it fails.

## Documents

- `docs/website-brief.md`: where the project stands and what has been decided.
- `docs/design/design-brief.md`: the design brief.
- `docs/superpowers/plans/`: implementation plans.
