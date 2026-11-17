// The one renderer: the Worker and the Book both call renderPage.

import type { Season } from '../time/season.ts';
import {
  contextFor,
  type PageRenderer,
  type RenderedPage,
  type RenderInput,
} from './context.ts';
import { layout } from './layout.ts';
import { inviteGone, notFound } from './pages/errors.ts';
import { invitationHome } from './pages/home.ts';
import { pathFor } from './routes.ts';

/** Each season's Home. Until their own are built, all show the invitation. */
export const homeBySeason: Readonly<Record<Season, PageRenderer>> = {
  invitation: invitationHome,
  'on-the-way': invitationHome,
  book: invitationHome,
};

export function renderPage(input: RenderInput): RenderedPage {
  const ctx = contextFor(input);
  const other = input.lang === 'en' ? 'es' : 'en';

  switch (input.page) {
    case 'home': {
      const page = homeBySeason[input.season](ctx);
      return {
        html: layout(ctx, page, pathFor('home', other)),
        status: page.status,
      };
    }
    case 'not-found':
    case 'invite-gone': {
      // An error page's counterpart is the other Home: the other
      // language's error address would only answer the same way, and an
      // invite path would be tried again.
      const page = input.page === 'not-found' ? notFound(ctx) : inviteGone(ctx);
      return {
        html: layout(ctx, page, pathFor('home', other)),
        status: page.status,
      };
    }
  }
}
