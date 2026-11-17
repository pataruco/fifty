// The shell every page sits in: head, header, main and footer.

import { faviconHref, inlineStyle, logoSvg } from '../generated/assets.ts';
import {
  emailAddress,
  externalHref,
  type Href,
  mailtoHref,
} from '../html/href.ts';
import { html, type SafeHtml } from '../html/html.ts';
import type { Lang } from '../i18n/lang.ts';
import { messages } from '../i18n/messages.ts';
import type { Context, PageContent } from './context.ts';
import { pathFor } from './routes.ts';

const CONTACT = emailAddress('hola@pataruco.dev');

function logoLink(ctx: Context, home: Href): SafeHtml {
  return html`<a class="branding" href="${home}"><span class="sr-only">${ctx.m.site.ownerName}</span>${logoSvg}</a>`;
}

export function layout(
  ctx: Context,
  page: PageContent,
  /** The same page in the other language. */
  counterpart: `/${string}`,
): string {
  const { m } = ctx;
  const otherLang: Lang = ctx.lang === 'en' ? 'es' : 'en';
  const other = messages[otherLang];
  const home = ctx.link(pathFor('home', ctx.lang));
  const title = `${page.title} – ${m.site.name}`;

  return `<!doctype html>\n${html`<html lang="${m.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="${page.description}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${page.description}">
<link rel="icon" type="image/svg+xml" href="${faviconHref}">
${inlineStyle}
</head>
<body>
<!--email_off-->
<div class="site">
<header class="header">
${logoLink(ctx, home)}
<a class="lang-switch" href="${ctx.link(counterpart)}" lang="${otherLang}" hreflang="${otherLang}">${other.languageName}</a>
</header>
<main id="content">
${page.main}
</main>
<footer class="footer">
${logoLink(ctx, home)}
<ul class="footer-links">
<li><a href="${externalHref('https://pataruco.dev/')}">pataruco.dev</a></li>
<li>${m.footer.contact}: <a href="${mailtoHref({ to: CONTACT })}">hola@pataruco.dev</a></li>
</ul>
</footer>
</div>
<!--/email_off-->
</body>
</html>
`}`;
}
