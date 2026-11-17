// The two answers that are not pages: an unknown address, and an invite
// link whose words have changed.

import { html } from '../../html/html.ts';
import type { Context, PageContent } from '../context.ts';
import { pathFor } from '../routes.ts';

export function notFound(ctx: Context): PageContent {
  const e = ctx.m.errors.notFound;
  return {
    title: e.heading,
    description: e.heading,
    main: html`<h1>${e.heading}</h1>
<p><a href="${ctx.link(pathFor('home', ctx.lang))}">${e.link}</a></p>`,
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
<p><a href="${ctx.link(pathFor('home', ctx.lang))}">${e.link}</a></p>`,
    status: 404,
  };
}
