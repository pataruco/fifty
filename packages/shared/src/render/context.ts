import {
  type EmailAddress,
  type Href,
  pathHref,
  relativeHref,
} from '../html/href.ts';
import type { SafeHtml } from '../html/html.ts';
import type { Lang } from '../i18n/lang.ts';
import { type Messages, messages } from '../i18n/messages.ts';
import type { Season } from '../time/season.ts';
import type { PageId } from './routes.ts';

/** A public render is never given the join address. */
export type Viewer =
  | { readonly kind: 'public' }
  | { readonly kind: 'guest'; readonly joinEmail: EmailAddress };

export interface RenderInput {
  readonly page: PageId;
  readonly lang: Lang;
  readonly season: Season;
  readonly viewer: Viewer;
  /** Absolute for the Worker; relative for the Book, read from disk. */
  readonly links: 'absolute' | 'relative';
  /** The path the page answers, such as / or /es/. */
  readonly path: string;
}

export interface RenderedPage {
  readonly html: string;
  readonly status: 200 | 404;
}

/** What a page template needs to know. */
export interface Context {
  readonly lang: Lang;
  readonly m: Messages;
  readonly viewer: Viewer;
  /** A link to a site path, written the way this render writes links. */
  link(to: `/${string}`): Href;
}

export interface PageContent {
  readonly title: string;
  readonly description: string;
  readonly main: SafeHtml;
  readonly status: 200 | 404;
}

export type PageRenderer = (ctx: Context) => PageContent;

export function contextFor(input: RenderInput): Context {
  return {
    lang: input.lang,
    m: messages[input.lang],
    viewer: input.viewer,
    link: (to) =>
      input.links === 'relative' ? relativeHref(input.path, to) : pathHref(to),
  };
}
