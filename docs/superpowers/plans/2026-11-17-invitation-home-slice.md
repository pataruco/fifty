# Fifty: Invitation Home slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (Pedro chose native execution). Steps use checkbox (`- [ ]`) syntax for tracking. **Pedro commits.** Every task ends with a hand-over, not a commit: run the checks, list the changed files, suggest a conventional commit message, then wait for Pedro to commit before starting the next task.

**Goal:** Set up the Fifty monorepo and build the first working slice. The slice is the Invitation-season Home page, made on request by a Cloudflare Worker, in English at `/` and Spanish at `/es/`, for the public and for guests. It also includes the plain-Node run of the same renderer that writes The Book.

**Architecture:**
- `packages/shared` holds the one renderer: an escaping `html` template, computed dates and distances, English and Spanish copy whose parity the type checker enforces, and the page templates.
- The stylesheet, logo and favicon reach every runtime through one generated, committed TypeScript module. The Worker bundle, the Worker tests and plain Node therefore inline the same bytes under one CSP hash.
- `apps/worker` routes requests, marks guests with a signed cookie that does not depend on the invite words, and sets the headers.
- `apps/web` writes The Book with plain `node` and holds the few static files.

**Tech Stack:** Node 24 (`lts/krypton`, built-in type stripping), pnpm 12.4.2, Moon 2.6, TypeScript 6.0, Biome 2.4, Wrangler 4.164 (`wrangler.jsonc`), Vitest 5 with `@cloudflare/vitest-plugin` 1.8, esbuild (CSS minifying), jsdom and css-tree (DOM and CSS assertions), Playwright with `@axe-core/playwright`, GitHub Actions.

**Spec:** `docs/design/design-brief.md`, and `docs/website-brief.md` ("Decisions").
- Brief sections to follow: "Decisions made on 17 November 2026", "The pages › Home", "Walk with me", "On every page", "Guests", "Language", "Words on the page", "Look and feel" and "Where the canvas and this brief differ".
- Copy comes from the canvas boards "D · Invitation" and "D · Invitación (Spanish)" in `docs/design/website-design.html`, changed as Task 5 lists. Where the canvas and the brief differ, the brief wins.

**Where the work happens:** the Delta worktree `/Users/pataruco/dev/fifty/.delta/worktrees/dwmb3zmpm9k8/fifty`, switched to branch `plan`, which Pedro created at `c12a029`. In this slice nothing is deployed, nothing is pushed to GitHub, and no real secret, invite word or join address is created.

## Global Constraints

Every task's requirements include these.

**Versions**
- `.nvmrc` `lts/krypton`; `"packageManager": "pnpm@12.4.2"`; `@moonrepo/cli` `^2.6.5`; `wrangler` `^4.164`; `typescript` `^6.0`; `@biomejs/biome` `^2.4`; `vitest` `^5` (fallback `^4.1`); `@cloudflare/vitest-plugin` `^1.8`.
- `compatibility_date` `"2026-11-17"`.

**Conventions (El Guacal)**
- `.moon/workspace.yml` maps projects explicitly and sets `vcs: { provider: github, defaultBranch: main }`.
- Moon tasks call binaries with `pnpm exec …`, and CI runs `pnpm exec moon run <project>:<task>`.
- Actions are pinned to full SHAs. Reuse the blog's: checkout `d23441a48e516b6c34aea4fa41551a30e30af803` (v6.1.0), setup-node `249970729cb0ef3589644e2896645e5dc5ba9c38` (v6.5.0), pnpm/action-setup `0977fd99725f1db4007ccb2928dbb4e90d06cc86` (v6.0.10), github-script `3a2844b7e9c422d3c10d287c895573f7108da1b3` (v9.0.0), release-please-action `45996ed1f6d02564a971a2fa1b5860e934307cf7` (v5.0.0).
- Commits are conventional and checked by commitlint.

**Biome**
- 2 spaces, width 80, single quotes, semicolons always, trailing commas `all`.
- `correctness.useImportExtensions: "error"`: imports carry `.ts`, because plain Node runs the sources.

**Addresses**
- `/` English, `/es/` Spanish.
- The invite link is `/hello/<words>/` (lands on `/`) or `/es/hello/<words>/` (lands on `/es/`).

**Never in any output**
- WhatsApp, `wa.me`, `tel:`, `sms:`, or any phone number.
- The join address appears only in guest HTML. It is never in the repo, in public HTML, in the Book, or in a test fixture other than `join@example.test`.

**Page weight and privacy**
- Styles go inline. No font file.
- Every page loads nothing from the network: CSP `default-src 'none'`.
- No `style=` attribute anywhere, because the CSP uses a hash.

**Search engines.** `noindex, nofollow` on every page, both as `<meta name="robots">` and as an `X-Robots-Tag` header. `robots.txt` allows all, so crawlers can see `noindex`.

**Accessibility**
- Text contrast is at least 7:1.
- Touch targets are at least 44 × 44 CSS px, except links inside sentences.
- Colour never carries meaning alone, and reduced motion is respected.
- Pages work at 320 px wide.

**Words**
- Numerals. Dates as "Friday 12 May 2028", with no "th"; in Spanish, "viernes 12 de mayo de 2028".
- English gives km, then miles in brackets. Spanish gives km only, in the informal "tú".
- Controls are named after what they do; Spanish controls use the infinitive.
- A number and its unit are joined by U+00A0 (`NBSP`), never a breaking space.

**Header**
- The logo links to Home in the current language.
- The language link reads "Español" (`lang="es"`) on English pages and "English" (`lang="en"`) on Spanish pages, and points to the same page in the other language.
- No Menu until there are pages to list.

**Footer.** Logo, a `pataruco.dev` link, and "Contact me" / "Escríbeme" with `hola@pataruco.dev`. About and the feed join it when those pages exist. No profile links, no "Updated on".

**Workers Cache stays off.** `wrangler.jsonc` has no `cache` key, because that cache keys on path and query and ignores the guest cookie.

**Time**
- Only `apps/worker/src/index.ts` reads the clock. Everything else takes `now: number` (epoch ms) as a parameter.
- Seasons: Invitation before `Date.UTC(2028, 4, 6, 23)`, which is midnight London time on 7 May. On the Way before `Date.UTC(2028, 4, 28, 23)`. The Book after that.

## Review Focus

1. **Cloudflare rewrites `mailto:` links in production.** Email Address Obfuscation would break every join button. Pages wrap `<body>` content in `<!--email_off-->…<!--/email_off-->` (Task 5 test). The smoke test compares production HTML with the renderer (Task 11).
2. **An unset or short `INVITE_WORDS` turns `/hello/-/` into a master key.** `wordsMatch` fails closed below 3 words (Task 8 test), and `secrets.required` makes a deploy refuse (Task 7 config test).
3. **The CSP style hash drifts and production is unstyled.** The page still returns 200 and every content test still passes. Task 7 tests that the hash matches every `<style>` in the body; Task 5 that no element has a `style=` attribute; Task 10 that the browser console shows no CSP message.
4. **A device that just opened the invite link sees the public Home.** Causes: a 301, `SameSite=Strict`, or a cached public page. Task 8 tests 303, `SameSite=Lax`, `no-cache` and `Vary: Cookie`. Task 10 visits Home first and then the link, in Chromium and WebKit.
5. **Blog CSS defects carried over.** A white focus ring on the black button, and the language link hidden at 48em and wider. Task 6 checks both statically; Task 10 checks focus visibility and the link's visibility at 320, 390 and 1280 px.

## File structure

**Root:** `package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `.editorconfig` (from the blog), `.gitignore`, `biome.json`, `tsconfig.base.json`, `commitlint.config.ts`, `.moon/workspace.yml`, `README.md`, `release-please-config.json`, `.release-please-manifest.json`, `.github/{actions,scripts,workflows}/…`

**`packages/shared` (`@fifty/shared`)**
- `package.json`: `"exports": {".": "./src/index.ts"}`, TypeScript source, no build step.
- `scripts/build-styles.ts`: the generator. It reads the CSS and SVG sources and writes `src/generated/assets.ts`.
- `src/generated/assets.ts`: generated and committed.
- `src/html/`: escaping and links.
- `src/time/`: plain dates and seasons.
- `src/i18n/`: languages, formats and messages.
- `src/content/itinerary.ts`: the canvas facts.
- `src/render/`: shell, components and pages.
- `src/styles/fifty.css` and `src/brand/{logo,favicon}.svg`: the sources.
- `src/` has `types: []`, so any DOM, Node or Workers API in shared code is a type error.

**`apps/worker` (`@fifty/worker`)**
- `wrangler.jsonc` and `worker-configuration.d.ts` (from `wrangler types`, committed).
- `src/{index,handle,routes,responses,guest-mark,invite-words}.ts`
- `test/*.test.ts`, run in workerd.
- `config/wrangler-config.test.ts`, run in Node.
- `e2e/*`, run by Playwright.
- `scripts/smoke.ts`
- `.dev.vars.example` (`.dev.vars` is gitignored).

**`apps/web` (`@fifty/web`)**
- `src/book/{write-book,export}.ts`: The Book under plain Node.
- `public/{robots.txt,_headers}`: the only static assets, served by the Worker's `assets.directory`.
- No browser JavaScript yet. Web Components come with the slices that need them.
- The renderer is a library because Moon forbids one application depending on another.

---

### Task 1: Walking skeleton through three runtimes

This task de-risks the slice first: a workspace package imported by the Worker under the Vitest plugin, the generated CSS module, plain-Node type stripping, and pnpm 12's build-script approvals.

**Files:**
- Create: the root files listed above, except release-please (Task 11).
- Create: `.github/actions/{prepare,ci-validation,conventional-commits}/action.yaml`, `.github/scripts/check-for-errors.mjs` (from the blog) and `.github/workflows/pr.yaml`. Its jobs are `commits`, `lint`, `typecheck`, `test`, `book` (uploads `the-book`), `build` (uploads `worker-bundle`) and `ci-validation`, which always runs.
- Create in `packages/shared`: `package.json`, `moon.yml`, `tsconfig.json`, `vitest.config.ts`, `scripts/build-styles.ts`, `scripts/build-styles.test.ts`, `src/styles/fifty.css` (one rule), `src/generated/assets.ts`, `src/index.ts`.
- Create in `apps/worker`: `package.json`, `moon.yml`, `tsconfig.json`, `vitest.config.ts`, `wrangler.jsonc`, `worker-configuration.d.ts`, `src/index.ts`, `test/skeleton.test.ts`.
- Create in `apps/web`: `package.json`, `moon.yml`, `tsconfig.json`, `vitest.config.ts`, `public/robots.txt` (`User-agent: *` / `Allow: /`), `src/book/export.ts`, `src/book/export.test.ts`.
- Create: `docs/superpowers/plans/2026-11-17-invitation-home-slice.md` (this plan).

**Interfaces — Produces:**
- `@fifty/shared` exports `css: string`, `styleHash: \`sha256-${string}\`` and `buildAssetsModule(sources: { css: string }): Promise<string>`. The sources gain the logo and favicon in Task 2.
- Moon tasks:
  - `shared:{styles,lint,format,typecheck,test}`
  - `worker:{dev,lint,format,typecheck,test,build}`
  - `web:{lint,format,typecheck,test,book}`
  - `worker:build` runs `wrangler deploy --dry-run --outdir dist`.
  - `worker:typecheck` runs `wrangler types --check` before `tsc`.

- [ ] **Step 1: Branch and save the plan.** Run `git fetch local && git switch --track local/plan`, confirm `HEAD` is `c12a029`, then copy this plan to `docs/superpowers/plans/2026-11-17-invitation-home-slice.md`.
- [ ] **Step 2: Root config with the values from Global Constraints.**
  - `pnpm-workspace.yaml`: `packages: [apps/*, packages/*]`; a `catalog:` for vitest, typescript, `@types/node` and jsdom; and `allowBuilds:` with an explicit `true`/`false` for every dependency that has an install script. Expect esbuild and workerd. pnpm 12's `strictDepBuilds` fails the install otherwise.
  - `tsconfig.base.json`: target and lib `ES2023`; module and moduleResolution `nodenext`; `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `allowImportingTsExtensions`, `noEmit`, `skipLibCheck`; `types: []`.
- [ ] **Step 3: Write the failing tests.**
  - `shared › generated assets are up to date with their sources`: `buildAssetsModule({ css: <fifty.css> })` equals the committed `src/generated/assets.ts`.
  - `worker › serves the shared stylesheet inline`: the body of `exports.default.fetch('https://fifty.test/')` contains `` `<style>${css}</style>` ``.
  - `worker › the CSP style hash is the SHA-256 of the inline style`: `Content-Security-Policy` contains `` `'${styleHash}'` ``, and workerd's `crypto.subtle.digest('SHA-256', css)` gives the same base64.
  - `web › plain Node writes the Book with the same stylesheet`: spawning `process.execPath src/book/export.ts --out <tmp>` exits 0, and `<tmp>/index.html` contains `` `<style>${css}</style>` ``.
- [ ] **Step 4: Run them.** `pnpm install && pnpm exec moon run shared:test worker:test web:test`. Expected: FAIL (modules not found).
- [ ] **Step 5: Implement.**
  - **Generator:** `esbuild.transform(src, { loader: 'css', minify: true })`, then `styleHash = 'sha256-' + base64(sha256(minified))`. It writes the module with a "Generated by scripts/build-styles.ts — do not edit" banner.
  - **`wrangler.jsonc`:**
    - `name: "fifty"`, `main: "src/index.ts"`
    - `routes: [{ pattern: "fifty.pataruco.dev", custom_domain: true }]`, `workers_dev: false`, `preview_urls: false`
    - `assets: { directory: "../web/public", html_handling: "none", not_found_handling: "none" }`
    - `observability: { enabled: true }`
    - `secrets: { required: ["INVITE_WORDS", "GUEST_KEY", "JOIN_EMAIL"] }`
  - **Worker `vitest.config.ts`:** `cloudflareTest({ wrangler: { configPath: './wrangler.jsonc' }, miniflare: { bindings: { INVITE_WORDS: 'otter lantern meadow harbour', GUEST_KEY: <32 fixed test bytes, base64>, JOIN_EMAIL: 'join@example.test' } } })`.
  - **Minimal pages:** both the Worker and `export.ts` render a minimal page with the inline style. The Worker also sends the CSP header.
  - Generate the types with `pnpm exec wrangler types`.
- [ ] **Step 6: Run the tests.** Same command as Step 4. Expected: PASS. Then run these checks and record each result for the hand-over; each has a fallback:
  1. The plugin accepts `2026-11-17`. If not, use the newest date both accept.
  2. `@fifty/shared`'s `.ts` source loads under the plugin. If not, add `ssr.noExternal: ['@fifty/shared']`.
  3. Plain `node` strips types in `packages/shared` through the pnpm symlink. If not, run the Book with `tsx`.
  4. `pnpm exec moon run worker:build` passes with `secrets.required`.
  5. `wrangler types --check` exists. If not, regenerate the types and run `git diff --exit-code`.
  6. Vitest 5 works with the plugin. If not, use `^4.1`.
- [ ] **Step 7: Hand over.**
  - Run `pnpm exec moon run shared:lint worker:lint web:lint shared:typecheck worker:typecheck web:typecheck`.
  - Suggest: `build: set up the monorepo with Moon, the Worker and the Book export`.

### Task 2: Escaping, links and trusted build assets

**Files:**
- Create: `packages/shared/src/html/{html,href}.ts` and `{html,href}.test.ts`, `src/trust-boundary.test.ts`.
- Create: `src/brand/logo.svg` (from the blog's `public/logo.svg`) and `src/brand/favicon.svg` (from the blog, with its Google Fonts `@import` removed).
- Modify: `scripts/build-styles.ts`, `src/generated/assets.ts`, `src/index.ts`.

**Interfaces — Produces:**
- `class SafeHtml` with a private constructor and `toString(): string`.
- `type HtmlValue = SafeHtml | string | number | false | null | undefined | readonly HtmlValue[]`
- `html(strings: TemplateStringsArray, ...values: readonly HtmlValue[]): SafeHtml`
- `escapeHtml(text: string): string`
- `trustBuildOutput(markup: string, source: 'generated/assets'): SafeHtml`
- `type Href` (branded string), with:
  - `pathHref(p: \`/${string}\`): Href`
  - `relativeHref(fromPath: string, toPath: string): Href`
  - `fragmentHref(id: string): Href`
  - `externalHref(u: \`https://${string}\`): Href`
  - `trustBuildHref(url: \`data:${string}\`, source: 'generated/assets'): Href`
- `type EmailAddress` (branded), `emailAddress(v: string): EmailAddress`, `mailtoHref(o: { to: EmailAddress; subject: string; body: string }): Href`
- The generated module now also exports `inlineStyle: SafeHtml` (`<style>${css}</style>`), `logoSvg: SafeHtml` and `faviconHref: Href`. `buildAssetsModule` takes `{ css: string; logoSvg: string; faviconSvg: string }`.

- [ ] **Step 1: Write the failing tests.**
  - `escapes the five special characters`: `` html`<p>${'<a href="x">&\''}</p>` `` → `<p>&lt;a href=&quot;x&quot;&gt;&amp;&#39;</p>`
  - `never escapes SafeHtml twice`
  - `renders null, undefined and false as nothing and flattens arrays`
  - `refuses NaN, Infinity, true and objects`: each throws a `TypeError`.
  - `a SafeHtml cannot be forged from a plain object`
  - `mailtoHref encodes spaces as %20 and line breaks as %0D%0A`: `mailtoHref({ to: emailAddress('a@b.test'), subject: 'Día 5', body: 'a\nb' })` → `mailto:a@b.test?subject=D%C3%ADa%205&body=a%0D%0Ab`
  - `emailAddress rejects spaces, quotes and angle brackets`
  - `relativeHref works between the two Homes`: `relativeHref('/es/', '/')` → `../index.html`; `relativeHref('/', '/es/')` → `es/index.html`.
  - `the logo keeps only viewBox and path d, and adds aria-hidden, focusable=false and fill=currentColor`
  - `the favicon is a data: link with no @import`
  - `trust-boundary` source scan over `src/`:
    - `trustBuild*` appears only in `src/generated/assets.ts`
    - no template contains `=${`
    - nothing is interpolated inside `<style>` or `<script>`
    - no `Date.now()`, argument-less `new Date()`, local-time `Date` getter or `Intl`
- [ ] **Step 2: Run.** `pnpm exec moon run shared:test`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `SafeHtml` is created only through a module-private factory set in a `static {}` block. `#html in value` is the brand check.
  - `mailtoHref` uses `encodeURIComponent` and `%0D%0A`, never `URLSearchParams`, whose `+` shows literally in iOS Mail.
  - The generator cleans the logo (drops `style`, `aria-label` and `font-*`), encodes the favicon as `data:image/svg+xml,…`, and wraps them with `trustBuild*`.
- [ ] **Step 4: Run.** Same command. Expected: PASS.
- [ ] **Step 5: Hand over.** Suggest: `feat(shared): add the escaping html template and trusted build assets`.

### Task 3: Dates, distances and seasons

**Files:**
- Create: `packages/shared/src/time/{plain-date,season}.ts`, `src/i18n/{lang,format}.ts`, and their tests.

**Interfaces — Produces:**
- `PlainDate` (branded `{ year; month; day }`), `plainDate(iso: string): PlainDate`, `toIso(d): string`, `weekday(d): 0|1|2|3|4|5|6`, `addDays(d, n): PlainDate`, `daysInclusive(a, b): number`
- `type Season = 'invitation' | 'on-the-way' | 'book'`, `SEASON_STARTS = { onTheWay: Date.UTC(2028, 4, 6, 23), book: Date.UTC(2028, 4, 28, 23) }`, `seasonAt(now: number): Season`
- `LANGS = ['en', 'es'] as const`, `type Lang`
- `NBSP`, `formatDate(d, lang, o: { weekday: boolean; year: boolean }): string`, `formatDateRange(a, b, lang, o: { weekday: boolean; year: boolean }): string`, `kmToMiles(km: number): number`, `formatDistance(km: number, lang: Lang): string`, `capitalise(s: string): string`

- [ ] **Step 1: Write the failing tests.**
  - `canvas dates in both languages`, one row per case:

    | Input | English | Spanish |
    |---|---|---|
    | 7–14 May | `Sunday 7 to Sunday 14 May` | `del domingo 7 al domingo 14 de mayo` |
    | 15–17 May | `Monday 15 to Wednesday 17 May` | `del lunes 15 al miércoles 17 de mayo` |
    | 18–23 May | `Thursday 18 to Tuesday 23 May` | `del jueves 18 al martes 23 de mayo` |
    | 24–27 May | `Wednesday 24 to Saturday 27 May` | `del miércoles 24 al sábado 27 de mayo` |
    | 7–28 May `{ weekday: false, year: true }` | `7 to 28 May 2028` | `del 7 al 28 de mayo de 2028` |
    | `formatDate` 12 May, with weekday and year | `Friday 12 May 2028` | `viernes 12 de mayo de 2028` |

  - `miles are computed and joined with NBSP`:
    - `kmToMiles` turns 110, 115, 90, 13 and 315 into 68, 71, 56, 8 and 196.
    - `formatDistance(110, 'en') === '110 km (68 miles)'`
    - `formatDistance(110, 'es') === '110 km'`
  - `seasons switch at midnight London time`: 1 ms either side of each `SEASON_STARTS` value.
- [ ] **Step 2: Run.** `pnpm exec moon run shared:test`. Expected: FAIL.
- [ ] **Step 3: Implement.** Weekday and month names come from tables: capitalised in English, lowercase in Spanish. `weekday` uses `Date.UTC` with `getUTCDay()`. `kmToMiles = Math.round(km / 1.609344)`. There is no `Intl`, so Node and workerd agree byte for byte.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Hand over.** Suggest: `feat(shared): compute dates, distances and seasons`.

### Task 4: Itinerary facts and the two languages

**Files:**
- Create: `packages/shared/src/content/itinerary.ts` and its test, `src/i18n/{messages,en,es}.ts` and `messages.test.ts`.

**Data:** only the canvas facts.

| Part | From | To | km | Walking days |
|---|---|---|---|---|
| 1 England: Reading to Southampton | 2028-05-07 | 2028-05-14 | 110 | 7 (5 are day trips from London) |
| 2 Ferry to Spain: Portsmouth to Ferrol | 2028-05-15 | 2028-05-17 | none | 0 |
| 3 Spain: Ferrol to Santiago de Compostela | 2028-05-18 | 2028-05-23 | 115 | 5 (arrival 2028-05-22) |
| 4 Spain: Santiago de Compostela to Finisterre | 2028-05-24 | 2028-05-27 | 90 | 4 (last day 13 km) |

Also: start at Reading Abbey, finish at the lighthouse at Finisterre, fly home 2028-05-28. Easiest day: 2028-05-12, part 1, 13 km, Winchester loop. The provisional-dates notice says Spanish dates may move by 1 day, to be confirmed around May 2027.

**Interfaces — Produces:**
- `type PartNumber = 1 | 2 | 3 | 4`, `interface Part`, `PARTS`, `WALK`, `EASIEST_DAY`
- `TOTALS = { km, days, walkingDays }`, computed from the data.
- `interface Messages`: strings, plus functions from typed facts to strings, such as `parts[4].invite(f: { walkingDays: number; lastDay: PlainDate; lastDayKm: number })`.
- `en` and `es`, each `as const satisfies Messages`; `messages: Readonly<Record<Lang, Messages>>`.

- [ ] **Step 1: Write the failing tests.**
  - `parts and the flight home cover 7 to 28 May with no gaps`
  - `totals are 315 km, 22 days and 16 walking days`
  - `the easiest day is Friday 12 May and inside part 1`
  - `en and es have the same keys at every depth`. This is a backstop; `tsc` already enforces parity.
  - `computed sentences match the canvas`:
    - English: `Walk all 4 days, or only the last one on Saturday 27 May. It is 13 km (8 miles).`
    - Spanish: `Camina los 4 días, o solo el último, el sábado 27 de mayo. Son 13 km.`
  - `Spanish never mentions miles`, and `every English km figure is followed by miles in brackets`.
  - `no number is split from its unit by a breaking space`: no `/\d (km|miles?|days?|días?|hours?|horas?)\b/` match in any rendered string.
  - `no string mentions WhatsApp, a phone number, wa.me, tel: or sms:`
- [ ] **Step 2: Run.** `pnpm exec moon run shared:test`. Expected: FAIL.
- [ ] **Step 3: Implement.** Copy the strings from the decoded boards. Decode them to stdout only: manifest JSON → base64 → gunzip → the `__bundler/template` JSON string. Sentences with numbers or dates are functions over the itinerary.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Hand over.** Suggest: `feat(shared): add the itinerary facts and the English and Spanish copy`.

### Task 5: Pages: the shell, the Invitation Home and the error pages

**Files:**
- Create: `packages/shared/src/render/{routes,context,csp,layout,components,render-page}.ts`, `src/render/pages/{home,errors}.ts`, `src/render/render-page.test.ts`, `src/render/__snapshots__/`.

**Interfaces — Produces:**
- `type PageId = 'home' | 'not-found' | 'invite-gone'`, `BUILT_PAGES = ['home'] as const`
- `type Viewer = { kind: 'public' } | { kind: 'guest'; joinEmail: EmailAddress }`. A public render is never given the address.
- `interface RenderInput { page: PageId; lang: Lang; season: Season; viewer: Viewer; links: 'absolute' | 'relative'; path: string }`
- `interface RenderedPage { html: string; status: 200 | 404 }`, `renderPage(input: RenderInput): RenderedPage`
- `pathFor(page: 'home', lang: Lang): '/' | '/es/'`, `counterpartPath(path: string): string`, `contentSecurityPolicy(): string`
- `homeBySeason: Record<Season, PageRenderer>`. All three seasons map to the Invitation Home until their own Homes are built.

**The shell**
- `<html lang="en-GB">` or `<html lang="es">`.
- Head: charset, viewport, title, robots meta, description, `og:title` and `og:description` (for link previews in the family chat), the `faviconHref` icon, `inlineStyle`.
- The body content sits inside `<!--email_off-->…<!--/email_off-->`.
- `.site` holds the header, `<main id="content">` and the footer, as in Global Constraints. The logo link's hidden name follows the canvas: "Pedro Martin Valera" in English, "Pedro Martín Valera" in Spanish.

**Home, in this order**
1. h1, then the lead paragraph.
2. The button link "See where you can join", to `#route`.
3. h2 "The plan" and its facts list: When, Start, Finish, Distance, Days.
4. The provisional-dates notice. It goes here, near the dates; the brief wins over the canvas.
5. The Camino sentence.
6. `h2#route` and the route intro. Public visitors then get the open-letter line.
7. `ol` of parts. Each has an h3, a distance line, a dates line, the cyan "You can join" label and its invite sentence. Guests also get the button with `data-join="part-N"`. The mail line comes once, right after part 1's button.
8. "I fly home on Sunday 28 May."
9. h2 "The easiest day to join", then a card: the date, a "Day trip" tag, an h3, and a facts list for the walk, getting there and getting home. Guests also get a button with `data-join="day-2028-05-12"`.
10. h2 "Follow the walk from home", then its paragraph.

**Changes from the canvas**
- No Menu button. Part headings are not links.
- No "See every day and how to get there" link: that page doesn't exist yet.
- The WhatsApp line becomes the email line.
- The footer is Fifty's, with no "Updated on".
- The miles total is computed: 196.
- No `style=` attributes.

**New copy.** The English is fixed; the Spanish is a first draft for Pedro to rewrite.

| Where | English | Spanish draft |
|---|---|---|
| Public line | "This is an open letter to people I know. If that's you, ask me for your link." | "Esta es una carta abierta para la gente que conozco. Si eres tú, pídeme tu enlace." |
| Mail line | "This opens an email to Pedro with the part or day already written in it. You can change the email before you send it." | "Se abre un correo a Pedro con la parte o el día ya escritos. Puedes cambiar el correo antes de enviarlo." |
| Join email, part | Subject "Joining part 2 of your walk"; body "Hi Pedro,\n\nI'd like to join part 2: Ferry to Spain, Portsmouth to Ferrol, Monday 15 to Wednesday 17 May 2028." | Subject "Ir a la parte 2 de tu caminata"; body "Hola, Pedro:\n\nMe gustaría ir a la parte 2: ferry a España, de Portsmouth a Ferrol, del lunes 15 al miércoles 17 de mayo de 2028." |
| Join email, day | Subject "Joining you on Friday 12 May 2028"; body names the day's walk | The same in Spanish |
| 404 page | "This page does not exist", with the link "Read the invitation" | "Esta página no existe", with "Leer la invitación" |
| Old-link page | "This invite link no longer works" / "Pedro may have changed it. If you know Pedro, ask him for the new one at hola@pataruco.dev." / "Read the invitation" | "Este enlace de invitación ya no funciona" / "Puede que Pedro lo haya cambiado. Si conoces a Pedro, pídele el nuevo en hola@pataruco.dev." / "Leer la invitación" |

- [ ] **Step 1: Write the failing tests.** They use jsdom for the DOM assertions.
  - `public and guest Home match their snapshots in each language`: four file snapshots, with the `<style>` body replaced by a placeholder so CSS changes don't churn them.
  - `guest Home has 4 part buttons and 1 day button, each a mailto: to the join address with the part or day in the subject and body`
  - `the mail line appears once, right after the first join button`
  - `public Home shows the open-letter line once, has no data-join, and has no mailto: except hola@pataruco.dev`
  - `the language link is named in the other language, has lang and hreflang, and points to the counterpart`
  - `every internal link targets a built page or an id on the page`, and `relative links end in .html or #id`
  - `no element has a style attribute`
  - `there is one h1 and headings never skip a level`
  - `the body content is wrapped in email_off markers`
  - `contentSecurityPolicy() allows exactly styleHash for styles and data: for images`
- [ ] **Step 2: Run.** `pnpm exec moon run shared:test`. Expected: FAIL.
- [ ] **Step 3: Implement** the shell, components and pages as specified above.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Hand over.** Point Pedro to the four snapshots for a copy review. Suggest: `feat(shared): render the Invitation Home and the error pages`.

### Task 6: Styles from the blog

**Files:**
- Modify: `packages/shared/src/styles/fifty.css`, curated by hand from blog commit `8eb63ac`'s `src/styles/index.css`, with a header comment naming the source.
- Modify: `scripts/build-styles.ts` (the refusal checks), `src/generated/assets.ts`.
- Create: `src/styles/styles.test.ts`.

**What to keep, add, drop and fix**
- **Keep:**
  - The `:root` tokens Fifty uses, box-sizing, and `html`/`body` type (18 px, line height 1.5).
  - h1 to h3: 40, 32 and 24 px, their weights, and `lining-nums`.
  - `p`/`li` spacing; links (#333, weight 600); `img` and `svg`.
  - `.site`, `.header`, `.branding`, `.footer`, `.btn`, `.sr-only`.
- **Add, from the canvas:**
  - `.lead`, which replaces the blog's `h1 ~ p:first-of-type`.
  - `.btn-secondary`: 2 px black outline.
  - `.facts`: the 2fr/3fr `dl` grid.
  - `.parts`, `.part`, `.label-invite` (black on #0ff), `.tag`.
  - `.card-outline` (#939393 border), `.notice` (2 px black).
  - `.lang-switch` and `.footer-links`: 44 px tall.
- **Drop:**
  - normalize's IE fixes; forms, tables, code, kbd, shiki; navigation; pagination, `.logos`, `.embed`, `.sidebar`.
  - `[aria-busy]` and the spin keyframes; unused utility classes.
  - `.card` and `.box`. They return with the On the Way slice.
- **Fix:**
  - Focus uses `:focus-visible`, and `.btn` gets a black outline.
  - Remove the 48em rule that hides everything after `.branding`.
  - Transitions only inside `prefers-reduced-motion: no-preference`.

- [ ] **Step 1: Write the failing tests.**
  - `every selector in fifty.css matches an element on a rendered page`. It uses css-tree, including rules inside `@media`, with pseudo-classes and pseudo-elements stripped. It runs jsdom `querySelector` over every combination of English/Spanish, public/guest, and home/not-found/invite-gone.
  - `the minified stylesheet stays under 6,000 bytes`
  - `the generator refuses </style, @import, @font-face and any url() other than data:`
  - `transitions only appear under prefers-reduced-motion: no-preference`
  - `no rule hides the language link`
  - `focus styles use :focus-visible and the button's outline is not white`
- [ ] **Step 2: Run.** `pnpm exec moon run shared:test`. Expected: FAIL.
- [ ] **Step 3: Implement.** Curate the stylesheet, add the refusals to the generator, then run `pnpm exec moon run shared:styles`.
- [ ] **Step 4: Run.** Expected: PASS, including Task 1's up-to-date test.
- [ ] **Step 5: Hand over.** Suggest: `feat(shared): bring in the blog's styles, trimmed for Fifty`.

### Task 7: The Worker serves Home in both languages

**Files:**
- Create: `apps/worker/src/{handle,routes,responses}.ts`, `test/{helpers,home,routing,headers}.test.ts`, `config/wrangler-config.test.ts`.
- Modify: `src/index.ts` (it only calls `handle(request, env, Date.now())`), `vitest.config.ts` (two projects: `worker` in workerd, `node` for the config test).

**Interfaces**
- Consumes: `renderPage`, `pathFor`, `counterpartPath`, `contentSecurityPolicy`, `seasonAt`.
- Produces:
  - `handle(request: Request, env: Env, now: number): Promise<Response>`
  - `type Match = { kind: 'page'; page: 'home'; lang: Lang } | { kind: 'hello'; lang: Lang; words: string } | { kind: 'redirect'; location: string } | { kind: 'not-found'; lang: Lang }`
  - `matchRoute(pathname: string): Match`
  - `type CachePolicy = 'public-page' | 'guest-page' | 'never-store'`, mapped by `CACHE_CONTROL` to `no-cache`, `private, no-store` and `no-store`.
  - `htmlResponse(page: RenderedPage, o: { cache: CachePolicy; varyCookie: boolean; setCookie?: string; head: boolean }): Response`
  - `redirectResponse(location: string, status: 303 | 308, o?: { setCookie?: string; cache?: CachePolicy }): Response`

**Headers on every HTML response:** `Content-Type: text/html; charset=utf-8`, the CSP, `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer` (the words sit in a URL) and `X-Content-Type-Options: nosniff`.

- [ ] **Step 1: Write the failing tests.**
  - `GET / and /es/ return the public Home in the right language`
  - `public pages are no-cache with Vary: Cookie`
  - `every HTML response carries the CSP, X-Robots-Tag, Referrer-Policy and nosniff`
  - `the CSP hash matches every <style> in the body`: HTMLRewriter collects the style text and compares digests.
  - `/es redirects 308 to /es/`
  - `unknown paths get the 404 page in the right language`
  - `POST returns 405 with Allow: GET, HEAD`
  - `HEAD returns the same headers and no body`
  - `public responses never contain the join address or join buttons`: checks the raw, entity-encoded and percent-encoded forms, in the body and the headers, for every page and language, including 404 and HEAD.
  - Config, run in Node:
    - `Workers Cache stays off`
    - `secrets.required lists INVITE_WORDS, GUEST_KEY and JOIN_EMAIL`
    - `workers_dev and preview_urls are false`
    - `assets.directory is ../web/public`
- [ ] **Step 2: Run.** `pnpm exec moon run worker:test`. Expected: FAIL.
- [ ] **Step 3: Implement** the routing and responses. Guest paths come in Task 8.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Hand over.** Suggest: `feat(worker): serve the Invitation Home in English and Spanish`.

### Task 8: Guests

**Files:**
- Create: `apps/worker/src/{guest-mark,invite-words}.ts`, `test/{guest-mark,guests}.test.ts`, `.dev.vars.example` (sample words, a sample key, `join@example.test`).
- Modify: `src/handle.ts`, `src/routes.ts`.

**Interfaces — Produces**
- Constants:
  - `GUEST_COOKIE = '__Host-fifty-guest'`
  - `MARK_END = Date.UTC(2028, 5, 30, 23)`
  - `MAX_AGE_CAP_S = 34_560_000`, which is 400 days, the browsers' cap.
  - `REFRESH_AFTER_S = 2_592_000`, which is 30 days.
  - `MIN_WORDS = 3`
- Functions:
  - `importMarkKey(secret: string): Promise<CryptoKey>`, which rejects keys under 32 bytes.
  - `signMark(issuedAt: number, key: CryptoKey): Promise<string>`
  - `verifyMark(value: string, key: CryptoKey, now: number): Promise<{ issuedAt: number } | null>`
  - `guestCookie(value: string, now: number): string`
  - `readCookie(header: string | null, name: string): string | null`
  - `needsRefresh(issuedAt: number, now: number): boolean`
  - `normaliseWords(raw: string): string`
  - `wordsMatch(candidate: string, secret: string | undefined): Promise<boolean>`

**The mark**
- Value: `g1.<issuedAt in seconds, base36>.<base64url HMAC-SHA-256 of "g1.<issuedAt>">`, keyed with `GUEST_KEY`. The words play no part, so changing them keeps every guest. Rotating `GUEST_KEY` removes every guest at once.
- `verifyMark` accepts only `g1`, `issuedAt ≤ now + 300 s`, an age of at most 400 days, `now < MARK_END`, and a signature that passes `crypto.subtle.verify`.
- Cookie: `Max-Age=min(MAX_AGE_CAP_S, MARK_END − now); Path=/; Secure; HttpOnly; SameSite=Lax`. `Lax` is needed so the cookie rides on the first visit from a link.

**The words**
- `normaliseWords`: `decodeURIComponent` (a malformed path is no match), NFKC, lowercase, every run of `space - _ . + ,` becomes one `-`, then trim.
- `wordsMatch` compares SHA-256 digests with `crypto.subtle.timingSafeEqual`. It returns false when the secret is missing or has fewer than `MIN_WORDS` words.

**Routes**
- The right words: 303 to `/` or `/es/`, a new mark, `no-store`. Never a 301, which browsers cache.
- Wrong words from a device that is already a guest: 303 to Home. They stay a guest.
- Wrong words from anyone else: 404 with the old-link page, `no-store`, no cookie.
- Guest pages: `private, no-store` with `Vary: Cookie`. The mark is renewed once it is older than 30 days.
- If `JOIN_EMAIL` is missing or invalid, a guest gets the public page with guest caching and a `console.error`. Never a 500.

- [ ] **Step 1: Write the failing tests.**
  - `the right words give a 303 to / with a __Host- cookie that is Secure, HttpOnly and SameSite=Lax`
  - `/es/hello/ lands on /es/`
  - `words match whatever the case and separators`
  - `other words give the old-link page as a 404, with no-store and no cookie`
  - `a guest opening an old link stays a guest`
  - `a mark made before the words changed still works`
  - `tampered, future-dated, too old and post-MARK_END marks count as public`
  - `a mark older than 30 days is renewed`
  - `an unset, empty or two-word secret never matches, and /hello// and /hello/-/ are 404`
  - `a guest page is never cached`: `private, no-store` and `Vary: Cookie`, for every page and language.
  - `the guest cookie only rides on no-store responses`
  - `a guest with no join address configured sees the public page, never a 500`
  - `a spring-2027 guest who visits monthly is still a guest on 28 May 2028`: a simulated clock through `handle(…, now)`.
- [ ] **Step 2: Run.** `pnpm exec moon run worker:test`. Expected: FAIL.
- [ ] **Step 3: Implement** as specified.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Hand over.** Suggest: `feat(worker): mark guests with a signed cookie from the invite link`.

### Task 9: The Book

**Files:**
- Create: `apps/web/src/book/write-book.ts`, `write-book.test.ts`, `src/public.test.ts`, `public/_headers` (`/*` with `X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer`).
- Modify: `src/book/export.ts`: `node src/book/export.ts --out dist/book [--at <ISO>]`.

**Interfaces — Produces:** `writeBook(o: { outDir: string; at: number }): Promise<readonly string[]>`, `bookFileFor(page: 'home', lang: Lang): string`.

- [ ] **Step 1: Write the failing tests.**
  - `writes index.html and es/index.html`
  - `the Book carries no guest content`
  - `every internal link is relative, ends in .html or #id, and resolves to a written file`
  - `the Book loads nothing from the network`: no `<script`, no stylesheet `<link>`, no `src="http`.
  - `the Book's Home equals the Worker's public Home apart from the link style`
  - `the Book is byte-identical under TZ=America/Caracas and TZ=Pacific/Kiritimati`: two child processes.
  - `public/ holds no HTML`, and `_headers sets X-Robots-Tag`.
- [ ] **Step 2: Run.** `pnpm exec moon run web:test`. Expected: FAIL.
- [ ] **Step 3: Implement** `writeBook`: public viewer, `links: 'relative'`, `seasonAt(at)`.
- [ ] **Step 4: Run.** Expected: PASS. Then run `pnpm exec moon run web:book` and open `apps/web/dist/book/index.html` from disk.
- [ ] **Step 5: Hand over.** Suggest: `feat(web): write the Book with plain Node`.

### Task 10: Browser checks

**Files:**
- Create: `apps/worker/e2e/playwright.config.ts`, `e2e/{a11y,layout,guest-flow}.spec.ts`.
- Modify: `apps/worker/package.json` (`@playwright/test`, `@axe-core/playwright`), `moon.yml` (task `e2e`, `runInCI`), `.github/workflows/pr.yaml` (job `e2e`, which runs `pnpm exec playwright install --with-deps chromium webkit` first).

**Set-up:** the `webServer` runs `wrangler dev --local-protocol https` with sample `--var` values, and the config sets `ignoreHTTPSErrors: true`. There are three projects: Pixel 7 (Chromium), iPhone 15 (WebKit) and a 1280 px desktop.

- [ ] **Step 1: Write the failing tests.**
  - `<lang> <variant> Home has no axe violations`, with tags `wcag2a, wcag2aa, wcag2aaa, wcag21a, wcag21aa, wcag22aa, best-practice`.
  - `every control is at least 44×44 CSS px, except links inside sentences`
  - `nothing scrolls sideways at 320 px`
  - `focus is visible on every control`
  - `the language link is visible at 320, 390 and 1280 px`
  - `with reduced motion, nothing transitions`
  - `the inline style applies and the console shows no CSP message`
  - `visiting Home first, then the invite link, shows the join buttons` (Chromium and WebKit), and `a second browser stays public`.
- [ ] **Step 2: Run.** `pnpm exec moon run worker:e2e`. Expected: FAIL (no config yet).
- [ ] **Step 3: Implement** the config and fix whatever the specs find.
- [ ] **Step 4: Run.** Expected: PASS. Also scan the four local variants with the accesslint tool, AAA rules on.
- [ ] **Step 5: Hand over.** Suggest: `test(worker): check the pages in Chromium and WebKit with axe`.

### Task 11: Smoke test, deploy and release workflows, and the record

**Files:**
- Create: `apps/worker/scripts/smoke.ts`, `scripts/smoke.test.ts`, `e2e/smoke.spec.ts`.
- Create: `.github/workflows/{deploy,release}.yaml`, `release-please-config.json` and `.release-please-manifest.json` (one component `fifty`, `release-type: node`, `0.1.0`).
- Create: `docs/runbooks/secrets-and-words.md`.
- Modify: `docs/website-brief.md`, `README.md`.

**Interfaces — Produces:**
- `interface SmokeResult { name: string; ok: boolean; detail: string }`
- `runSmoke(o: { baseUrl: string; inviteWords: string; fetch?: typeof fetch }): Promise<readonly SmokeResult[]>`
- The command line reads `SMOKE_BASE_URL` and `SMOKE_INVITE_WORDS`.

**What `runSmoke` checks**
1. `/` and `/es/` equal `renderPage` for the current season, public variant.
2. Neither contains `<script`, `/cdn-cgi/` or `data-join`.
3. Random words get a 404 and no cookie.
4. The real words get a 303 and the cookie.
5. The guest page is `private, no-store`, is not a cache `HIT`, and has 5 join `mailto:` links.
6. A public request straight afterwards gets the public page.

**`deploy.yaml`**
- Trigger: `workflow_dispatch` with a `tag` input. Environment `production`; concurrency that does not cancel.
- Jobs:
  1. `verify`: typecheck, test, book and build at the tag.
  2. `deploy`: `pnpm exec wrangler deploy --tag <tag> --message "Deploy <tag>"`, using `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
  3. `smoke`: on failure, `wrangler rollback --message "Smoke test failed for <tag>"`.
  4. `ci-validation`.
- **Written, not run.**

**`release.yaml`:** release-please on push to `main`, with the secret `RELEASE_PLEASE_GH_TOKEN`, as in the blog.

**The runbook covers:**
- Setting the three secrets.
- The first deploy with `wrangler deploy --secrets-file <file outside the repo>`.
- Changing the words with `wrangler secret put INVITE_WORDS`.
- Removing every guest by rotating `GUEST_KEY`.
- Email Address Obfuscation.
- The go-live checklist:
  1. The join address exists.
  2. Four words are chosen.
  3. `GUEST_KEY` is generated.
  4. The itinerary corrections are settled.
  5. The `production` environment and the API token (scoped to Workers and the pataruco.dev zone) exist.
  6. Pedro makes the first deploy by hand, then runs the smoke test.

- [ ] **Step 1: Write the failing tests.**
  - `runSmoke fails when a guest page is cacheable`, `when the public page has a join button`, and `when production HTML differs from the renderer`, each against a fake `fetch`.
  - `the smoke test passes against wrangler dev` (e2e).
- [ ] **Step 2: Run.** `pnpm exec moon run worker:test worker:e2e`. Expected: FAIL.
- [ ] **Step 3: Implement** `runSmoke`, the workflows, the runbook and the README.
  - The README covers install, dev, tests and the Book.
  - In `docs/website-brief.md`, add "Decisions taken while building (17 November 2026, no ADR yet)": the generated assets module and CSP hash, the guest mark, the words as a secret, no `Intl`, the Book under plain Node, Workers Cache off, and robots allowing with `noindex`. Also update "Next steps".
- [ ] **Step 4: Run.** `pnpm exec moon run shared:test worker:test web:test worker:e2e worker:build`. Expected: PASS.
- [ ] **Step 5: Hand over.** Suggest: `ci: add the smoke test and the deploy and release workflows`.
- [ ] **Step 6: Whole-branch review.** Once Pedro has committed, one fresh reviewer agent on the most capable model reviews `git diff c12a029...plan` against this plan and the brief. Report its findings to Pedro.

---

## Verification, end to end

1. **Install and test.** `pnpm install`, then `pnpm exec moon run shared:lint worker:lint web:lint shared:typecheck worker:typecheck web:typecheck shared:test worker:test web:test`. Everything passes.
2. **The Book.** `pnpm exec moon run web:book` writes `apps/web/dist/book/index.html` and `es/index.html`. Opened from disk, both are styled, and their language links work.
3. **Local site.** Copy `apps/worker/.dev.vars.example` to `.dev.vars` and run `pnpm exec moon run worker:dev`. Then:
   - `/` and `/es/` show the public Home.
   - `/hello/<sample words>/` shows the join buttons, and each opens a mail draft with its part or day.
   - Wrong words show the old-link page.
4. **Accessibility and the dry run.**
   - `pnpm exec moon run worker:e2e` passes.
   - The accesslint scan, with AAA rules on, of English and Spanish, public and guest, finds nothing.
   - `pnpm exec moon run worker:build` passes. Nothing is deployed.
5. **CI.** When Pedro pushes `plan` and opens a pull request, `pr.yaml` runs every job, and none needs a secret.

## Open points for Pedro

None of these blocks the build; each is raised at the hand-over of the task that meets it.

- **Miles total:** computed as 196, where the canvas says 195 (the sum of the rounded parts).
- **Logo name:** "Martin" on the English canvas, "Martín" on the Spanish canvas and in the logo file. The pages follow the canvas per language unless Pedro picks one.
- **Spanish drafts:** the new Spanish lines in Task 5 need his rewrite.
- **Kept by Pedro:** the join address, the invite words, the secrets and the go-live checklist.
