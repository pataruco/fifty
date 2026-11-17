// Shared by the Worker tests, which run inside workerd.

import { exports } from 'cloudflare:workers';
import {
  type Lang,
  pathFor,
  renderPage,
  seasonAt,
  type Viewer,
} from '@fifty/shared';

export const ORIGIN = 'https://fifty.test';
export const JOIN = 'join@example.test';
export const WORDS = 'otter lantern meadow harbour';

export function get(path: string, init?: RequestInit): Promise<Response> {
  return exports.default.fetch(new Request(`${ORIGIN}${path}`, init));
}

/** What the renderer makes for this page right now. */
export function expectedHome(lang: Lang, viewer: Viewer = { kind: 'public' }) {
  return renderPage({
    page: 'home',
    lang,
    season: seasonAt(Date.now()),
    viewer,
    links: 'absolute',
    path: pathFor('home', lang),
  }).html;
}

/** The text of every <style> element in the body, in order. */
export async function styleTexts(markup: string): Promise<string[]> {
  const found: string[] = [];
  let current = '';
  await new HTMLRewriter()
    .on('style', {
      text(chunk) {
        current += chunk.text;
        if (chunk.lastInTextNode) {
          found.push(current);
          current = '';
        }
      },
    })
    .transform(new Response(markup))
    .text();
  return found;
}

export async function sha256Base64(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

/** Every form the join address could take in a page or a header. */
export const JOIN_FORMS = [
  JOIN,
  'join&#64;example.test',
  'join&#x40;example.test',
  'join%40example.test',
  'join%40example%2Etest',
];
