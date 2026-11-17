# Secrets, invite words and going live

Status: Draft
Author: Pedro (with Claude as editor)
Date: 17 November 2026

How to set the Worker's three secrets, change the invite words, remove every guest, and make the first deploy. Nothing here has been run yet: no secret, word or join address exists.

## The three secrets

The Worker refuses to deploy without all three (`secrets.required` in `apps/worker/wrangler.jsonc`).

| Secret | What it is | How to make it |
| --- | --- | --- |
| `INVITE_WORDS` | The words in the invite link, such as four ordinary words. At least 3, or no link works | Choose them. Case and separators do not matter: "Otter Lantern" and `otter-lantern` match |
| `GUEST_KEY` | Signs the guest cookie. At least 32 bytes, written as base64 | `openssl rand -base64 32` |
| `JOIN_EMAIL` | The address the join buttons write to: the one made for Fifty in iCloud | Create it in iCloud first |

The join address appears only on guest pages. It is never in the repository, in a public page, in the Book or in a test (tests use `join@example.test`).

Set or replace one secret:

```sh
cd apps/worker
pnpm exec wrangler secret put INVITE_WORDS
```

Wrangler asks for the value, so it never sits in shell history.

## The first deploy

The first deploy has to carry the secrets, because the Worker refuses to deploy without them. Write them to a file **outside the repository**, deploy, then delete the file:

```sh
cat > ~/fifty-secrets.json   # {"INVITE_WORDS": "…", "GUEST_KEY": "…", "JOIN_EMAIL": "…"}
cd apps/worker
pnpm exec wrangler deploy --secrets-file ~/fifty-secrets.json --tag v0.1.0 --message "First deploy"
rm ~/fifty-secrets.json
```

Then run the smoke test against the real site:

```sh
SMOKE_BASE_URL=https://fifty.pataruco.dev SMOKE_INVITE_WORDS="…" pnpm exec moon run worker:smoke
```

Later deploys go through the **Deploy** workflow in GitHub Actions, started by hand with a release tag. It verifies the tag, deploys, runs the smoke test and rolls back if the smoke test fails.

## Changing the words

If the link leaks, change the words:

```sh
pnpm exec wrangler secret put INVITE_WORDS
```

The old link then shows "This invite link no longer works". Devices that had already opened the old link stay guests, because the guest cookie is signed with `GUEST_KEY`, not with the words. Send the new link to whoever still needs it. Update the `INVITE_WORDS` secret of the GitHub `production` environment too, or the next smoke test fails.

## Removing every guest

Replace `GUEST_KEY`:

```sh
openssl rand -base64 32 | pnpm exec wrangler secret put GUEST_KEY
```

Every guest cookie stops working at once, and every device sees the public site until it opens the invite link again. All guest marks also end on their own at midnight London time on 1 July 2028.

## Email Address Obfuscation

Cloudflare's Email Address Obfuscation rewrites `mailto:` links, which would break every join button. Two things guard against it:

- Every page wraps its content in `<!--email_off-->` and `<!--/email_off-->`.
- The smoke test compares the live public pages byte for byte with the renderer, and fails on any `/cdn-cgi/` address.

If the smoke test reports `/cdn-cgi/`, turn the feature off for the zone: Scrape Shield → Email Address Obfuscation.

## Go-live checklist

1. The join address exists in iCloud.
2. Four words are chosen.
3. `GUEST_KEY` is generated.
4. The itinerary corrections are settled (see the design brief, "Corrections to carry back into the itinerary").
5. The GitHub `production` environment exists, with `CLOUDFLARE_API_TOKEN` (scoped to Workers and the pataruco.dev zone), `CLOUDFLARE_ACCOUNT_ID` and `INVITE_WORDS`.
6. Pedro makes the first deploy by hand, as above, then runs the smoke test.
