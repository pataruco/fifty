// The two answers that are not pages: an unknown address, and an invite
// link whose words have changed.

import { html, type SafeHtml } from '../../html/html.ts';
import { buttonLink } from '../components.ts';
import type { Context, PageContent } from '../context.ts';
import { pathFor } from '../routes.ts';

/** The page's one action, sized as a button so it is easy to tap. */
const homeButton = (ctx: Context, label: string): SafeHtml =>
  buttonLink({
    href: ctx.link(pathFor('home', ctx.lang)),
    label,
    variant: 'primary',
  });

export function notFound(ctx: Context): PageContent {
  const e = ctx.m.errors.notFound;
  return {
    title: e.heading,
    description: e.heading,
    main: html`<h1>${e.heading}</h1>
<p>${homeButton(ctx, e.link)}</p>`,
    status: 404,
  };
}

export function inviteGone(ctx: Context): PageContent {
  const e = ctx.m.errors.inviteGone;
  return {
    title: e.heading,
    description: e.heading,
    main: html`<h1>${e.heading}</h1>
<p>${e.body}</p>
<p>${homeButton(ctx, e.link)}</p>`,
    status: 404,
  };
}
