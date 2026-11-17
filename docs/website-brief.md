# Fifty website: where it stands

Last updated 16 November 2026.

The website for the May 2028 walk. It invites friends and family to walk part of the route, shows where Pedro is, and carries a daily journal. This note records what has been decided and where the working files live, so a new session can pick up.

## Where things are

| Thing                                      | Where                                                                                                                                                                                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository                                 | `github.com/pataruco/fifty`, checked out at `/Users/pataruco/dev/fifty` on mac-mynet. Branch `main`, no commits yet                                                                                                                |
| Design brief                               | `docs/design-brief.md` in that repository. Draft 3 is in the repository; draft 4 (address and phone settled) was written on 16 November while the computer was unreachable and still has to be copied in                           |
| Design canvas                              | https://claude.ai/artifact/EcSi8PnRmjBdUBxQYmQtoC                                                                                                                                                                                  |
| Tech spec                                  | `docs/tech-spec.md`. Scaffold with seven sections; section 2, Architecture, is drafted and waiting for Pedro's review. Written on 16 November while the computer was unreachable, so it still has to be copied into the repository |
| Decision records                           | `docs/adrs/0001` to `0009`, in the same state as the tech spec                                                                                                                                                                     |
| Build prompt for the Claude agent in Delta | Not started. Written last, after the tech spec                                                                                                                                                                                     |

Delta keeps its own clone of the repository under `.delta/` and pushes back to the local checkout. Its agent only sees committed files, so the documents in `docs/` must be committed before a Delta session starts.

## How the tech spec is being written

Section by section, at Pedro's request. For each section: a few decisions put to Pedro as choices, then a draft, then his changes. Order: 2 Architecture (drafted), then 3 Data and content, 4 The site, 5 The server side, 6 The trail page and the tracker, 7 Quality and delivery, and 1 Scope and constraints last. Pedro tells Claude what to change; he does not edit the file directly.

Pedro was offered a cold read of the finished spec by a fresh agent and did not choose it. Do not start one without asking.

## Decisions

Product and design (15 November 2026):

| Question      | Decision                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Who sees what | Public story, private details. Exact position only for people who open the invite link                                                   |
| Location      | Check-ins by hand, plus live tracking with OwnTracks on days when people are joining                                                     |
| Journal       | Written in Contentful, in Pedro's existing account. Pages are built from it; visitors never call it; every build keeps its own copy      |
| Joining       | People message Pedro. No form and no list of names. Every one of the four parts of the route carries its own invitation and button       |
| Words         | Content design practice                                                                                                                  |
| Languages     | English and Spanish. Spanish is Venezuelan Spanish, localised: informal "tú", kilometres only, times in the reader's own format and zone |
| Look          | Direction D: the styles of Pedro's own blog, pataruco.dev                                                                                |

Technical (16 November 2026), each with an ADR:

| Question     | Decision                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------- |
| Address      | fifty.pataruco.dev. The pataruco.dev zone is already on Cloudflare                              |
| Hosting      | Everything on Cloudflare: one Worker with Static Assets and a D1 database                       |
| Language     | TypeScript only. No Rust, no WebAssembly                                                        |
| Site build   | The way the blog is built: Vite multi-page, a TypeScript build script, vanilla Web Components   |
| Live status  | The Worker writes it into the page with HTMLRewriter; a custom element refreshes it each minute |
| Repository   | Monorepo with Moon, laid out like El Guacal: apps/web, apps/worker, packages/shared             |
| Environments | Production only. Rehearsals run on the real site behind a setting only Pedro can change         |
| Seasons      | One season per build, picked from the date or named by hand                                     |

Pedro carries an iPhone 16 Pro Max.

Assumed, not yet confirmed: hidden from search engines; called Fifty; WCAG 2.2 AAA where possible.

## Pedro's conventions, taken from his other repositories

El Guacal (`github.com/pataruco/el-guacal`) is the model for how he documents and runs a project. ADRs use Michael Nygard's template (Status, Context, Decision, Consequences with "Positive:" and "Negative:" lines), numbered, in `docs/adrs`, in British English. Documents carry "Status / Author: Pedro (with Claude as editor) / Date". He keeps a product brief at `docs/product/brief.md` and design notes and agent prompts in `docs/design/`; his prompt for a coding agent there is a long, step-by-step task file with exact file paths and code. Moon version 2 is installed as `@moonrepo/cli` and run as `pnpm exec moon run <project>:<task>`. CI is GitHub Actions with pinned action SHAs, conventional commits, release-please, and deploys started by hand from a tag.

The blog (`github.com/pataruco/blog`) is vanilla Web Components with a custom TypeScript static build on Vite, Biome, pnpm, Node `lts/krypton`, GitHub Pages. Its CSS names Inter but does not load it.

## Errors found in the itinerary, not yet corrected there

2028 is not a Holy Year. 25 July 2028 is a Tuesday. The Holy Year is 2027.

The total of about 437 km does not add up. The stages sum to about 306 km and the three legs to about 315 km.

Day 11, Ferrol to Pontedeume, is about 30 km, not 22 km. The usual guide has six stages from Ferrol to Santiago; the itinerary allows five walking days.

Day 10, Santander to Ferrol, is not 6 to 8 hours by train. It is about 14 hours with a change in Oviedo. A bus takes about 8.

## Open questions

In the tech spec, section 2: whether a dress rehearsal may put On the Way pages on the real site for a day, and whether the docs should move to El Guacal's layout.

In the brief: whether people should be invited onto the ferry; whether the Contentful account's free space is unused; whether companions may appear in public photos; "journal entry" or "postcard" as the one name.

## Next steps

1. Copy the tech spec, the nine ADRs and draft 4 of the brief into the repository's `docs/` once the computer is reachable.
2. Pedro reviews section 2 of the tech spec.
3. Section 3, Data and content.
4. The remaining sections, then the build prompt for the Claude agent in Delta.
