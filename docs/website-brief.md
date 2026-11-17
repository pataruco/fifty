# Fifty website: where it stands

Last updated 17 November 2026.

The website for the May 2028 walk. It invites friends and family to walk part of the route, shows where Pedro is, and carries a daily journal. This note records what has been decided and where the working files live, so a new session can pick up.

## Where things are

| Thing                                      | Where                                                                                                                                                                                                                                                                         |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository                                 | `github.com/pataruco/fifty`, checked out at `/Users/pataruco/dev/fifty` on mac-mynet. Branch `main`. Nothing had been pushed to GitHub by 17 November                                                                                                                         |
| Design brief                               | `docs/design/design-brief.md` in that repository; Pedro moved it there on 17 November. It is draft 3 with the decisions of 17 November added. Draft 4 (address and phone settled) was written on 16 November while the computer was unreachable and still has to be merged in |
| Design canvas                              | https://claude.ai/artifact/EcSi8PnRmjBdUBxQYmQtoC. A Delta thread cannot open it, so Pedro exported it into `docs/design/` on 17 November: `website-design.html` holds all eight boards (directions A, B and D), and there is a PNG of each of the four boards of direction D |
| Tech spec                                  | `docs/tech-spec.md`. Scaffold with seven sections; section 2, Architecture, is drafted and waiting for Pedro's review. Written on 16 November while the computer was unreachable, so it still has to be copied into the repository                                            |
| Decision records                           | `docs/adrs/0001` to `0009`, in the same state as the tech spec                                                                                                                                                                                                                |
| Build prompt for the Claude agent in Delta | Not started. Written last, after the tech spec                                                                                                                                                                                                                                |

Delta keeps its own clone of the repository under `.delta/` and pushes back to the local checkout. Its agent only sees committed files, so the documents in `docs/` must be committed before a Delta session starts.

## How the tech spec is being written

Section by section, at Pedro's request. For each section: a few decisions put to Pedro as choices, then a draft, then his changes. Order: 2 Architecture (drafted), then 3 Data and content, 4 The site, 5 The server side, 6 The trail page and the tracker, 7 Quality and delivery, and 1 Scope and constraints last. Pedro tells Claude what to change; he does not edit the file directly. Section 2 was drafted before 17 November and has to be redrafted against the decisions of that day.

Pedro was offered a cold read of the finished spec by a fresh agent and did not choose it. Do not start one without asking. On 17 November he asked for an adversarial review of this note and the design brief himself; see "Decisions".

## Decisions

On 17 November 2026 Pedro asked for an adversarial review of this note and the design brief. The decisions marked 17 November came out of it. They are written into the copy of the design brief in the repository. Draft 4 does not have them yet.

Product and design (15 November 2026; "17 Nov" marks what changed on 17 November 2026):

| Question      | Decision                                                                                                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Who sees what | Public story, private details. The public sees the last named place Pedro has passed and the part of the day. Kilometres for a day in progress, clock times and the map are for people who open the invite link (17 Nov)                                                             |
| Invite link   | One link in ordinary words, for everyone. When Pedro changes the words, people who had already opened the old link stay guests (17 Nov)                                                                                                                                              |
| Location      | Check-ins by hand, plus live tracking with OwnTracks on days when people are joining. OwnTracks sends the check-ins too if rehearsal 1 shows it is quick with one hand; if not, the trail page keeps its own button (17 Nov)                                                         |
| Journal       | Written on the trail page, in a form that keeps drafts on the phone, and kept in the site's own store. Contentful, in Pedro's existing account, is for what is written at a desk: the letter, the guide, the afterword. Visitors never call it; the site keeps its own copy (17 Nov) |
| Joining       | People message Pedro. No form and no list of names. Every one of the four parts of the route carries its own invitation and button                                                                                                                                                   |
| Words         | Content design practice                                                                                                                                                                                                                                                              |
| Languages     | English and Spanish. Spanish is Venezuelan Spanish, localised: informal "tú", kilometres only, times in the reader's own format and zone                                                                                                                                             |
| Look          | Direction D: the styles of Pedro's own blog, pataruco.dev. No font file is shipped (17 Nov)                                                                                                                                                                                          |
| Footer        | Fifty's own, not the blog's: a link to About, the journal's feed, a link to pataruco.dev and hola@pataruco.dev. No profile links, no blog feed, no "Updated on" line (17 Nov)                                                                                                        |

On the trail (17 November 2026):

| Question        | Decision                                                                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirements    | Pedro writes and edits during the walk, often with no signal, and uploads crawl. These are given, not things for a rehearsal to find out                                                                                                |
| Phone           | It never talks to Contentful on the trail. Contentful does not support mobile browsers, has no offline mode, and cannot resume an upload                                                                                                |
| Photos          | Shrunk on the phone to about 1600 px and 300 to 500 KB, with the location inside removed. The phone sends the small copy to the site, which passes it on to Contentful. Originals stay on Pedro's phone and go into The Book afterwards |
| Sending         | Words first, then photos in pieces that carry on after a break. An iPhone sends only while the page is open on screen, and the page says so                                                                                             |
| Changes of plan | From the trail page, with no deploy: a notice at the top of Home, where today's stage ends, a rest day or a travel day                                                                                                                  |
| Travel log      | A day keeps its date. Its page shows the plan until the day comes, then what Pedro did: walked from and to, rested or travelled                                                                                                         |

Technical (16 November 2026, each with an ADR; "17 Nov" marks what changed on 17 November 2026 and has no ADR yet):

| Question     | Decision                                                                                                                                                                                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Address      | fifty.pataruco.dev. The pataruco.dev zone is already on Cloudflare                                                                                                                                                                                                                                                   |
| Hosting      | Everything on Cloudflare: one Worker with Static Assets and a D1 database. No store for photos: the copies the site shows are kept in Contentful (17 Nov)                                                                                                                                                            |
| Language     | TypeScript only. No Rust, no WebAssembly                                                                                                                                                                                                                                                                             |
| Site build   | The Worker makes every page on request, from its own copy of the content. One renderer runs in the Worker and in Node, and escapes every piece of text it is given. The Node run writes The Book, and CI runs it from day one. The blog's styles and vanilla Web Components stay; its build script does not (17 Nov) |
| Content flow | Contentful sends each change to the Worker, which keeps its own copy. Making a page never calls Contentful (17 Nov)                                                                                                                                                                                                  |
| Publishing   | A change to data, never a deploy. The freeze on 23 April 2028 is a freeze of the code (17 Nov)                                                                                                                                                                                                                       |
| Live status  | Part of the page the Worker makes. It refreshes only while the page is on screen and the day is still open, and the reader can stop it (17 Nov)                                                                                                                                                                      |
| Times        | Kept in UTC. The page carries the walker's time and country; a custom element adds the reader's own time from the device's time zone, called "your time". The same page goes to everyone, and the site never names the reader's country (17 Nov)                                                                     |
| Safety nets  | The last good copy of every public page is kept and served on any error. A guest page is never cached, and a test checks that on each deploy (17 Nov)                                                                                                                                                                |
| Page weight  | As few requests as it can be: styles inside the page, no font file (17 Nov)                                                                                                                                                                                                                                          |
| Repository   | Monorepo with Moon, laid out like El Guacal: apps/web, apps/worker, packages/shared                                                                                                                                                                                                                                  |
| Environments | Production only, confirmed on 17 November. Rehearsals run on the real site behind a setting only Pedro can change                                                                                                                                                                                                    |
| Seasons      | Worked out on each request from the date. Pedro can override the season for his own device (17 Nov)                                                                                                                                                                                                                  |

The decisions of 16 November that these replace: pages built the way the blog is built, with a TypeScript build script; live status written into the page with HTMLRewriter and refreshed each minute; one season per build. Their ADRs, and section 2 of the tech spec, were written before 17 November.

Messaging (17 November 2026):

| Question           | Decision                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apps               | No WhatsApp, because it is a Meta product. Pedro and the site use email and text messages (SMS)                                                         |
| Join buttons       | They open an email to Pedro with the day or the part already written in it. It goes to an address made only for Fifty in his iCloud account             |
| Phone number       | Not on the site. Pedro gives it when he replies                                                                                                         |
| On the day         | Pedro and companions text each other (SMS)                                                                                                              |
| Telling the family | Pedro posts in no family chat. One relative shares the link in the chat the family already uses, whichever app that is. The site sends no notifications |

Pedro carries an iPhone 16 Pro Max and has an iCloud account.

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

In the tech spec, section 2: whether guests should see On the Way pages during the dress rehearsal, now that Pedro can switch the season for his own device alone; whether readers' browsers fetch photos from Contentful or through the Worker; whether the docs should move to El Guacal's layout.

In the brief: whether people should be invited onto the ferry; whether the Contentful account's free space is unused; whether companions may appear in public photos; "journal entry" or "postcard" as the one name; which relative shares each new entry in the family chat; which kind of address the join buttons write to, a Hide My Email address or a named one on pataruco.dev; whether the words of the itinerary move to Contentful.

## Next steps

1. Make the plan Pedro asked for on 17 November, from this note and the design brief.
2. Copy the tech spec, the nine ADRs and draft 4 of the brief into the repository's `docs/` once the computer is reachable. Merge draft 4 into the brief at `docs/design/design-brief.md`, and do not overwrite it: that copy carries the decisions of 17 November.
3. Write ADRs for the decisions of 17 November that replace earlier ones (site build, live status, seasons), and redraft section 2 of the tech spec against them.
4. Redraw the canvas to match the brief. The export in `docs/design/` was checked against the brief on 17 November, and the brief lists every difference under "Where the canvas and this brief differ". The largest: the line under the first button still says WhatsApp, and only a guest's screens are drawn, so the public's Home in both seasons is missing.
5. Pedro reviews section 2 of the tech spec.
6. Section 3, Data and content.
7. The remaining sections, then the build prompt for the Claude agent in Delta.
