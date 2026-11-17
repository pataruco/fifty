// Small pieces shared by the pages.

import type { Href } from '../html/href.ts';
import { type HtmlValue, html, type SafeHtml } from '../html/html.ts';

/** A list of facts: label on the left, value on the right. */
export function facts(
  rows: readonly (readonly [string, HtmlValue])[],
): SafeHtml {
  return html`<dl class="facts">${rows.map(
    ([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`,
  )}</dl>`;
}

/**
 * A link that looks like a button. `join` marks a button that writes an
 * email to Pedro, so tests and the smoke test can find it.
 */
export function buttonLink(o: {
  readonly href: Href;
  readonly label: string;
  readonly variant: 'primary' | 'secondary';
  readonly join?: string;
}): SafeHtml {
  const cls = o.variant === 'primary' ? 'btn' : 'btn btn-secondary';
  return html`<a class="${cls}" href="${o.href}"${
    o.join === undefined ? '' : html` data-join="${o.join}"`
  }>${o.label}</a>`;
}
