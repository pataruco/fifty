// Home in the Invitation season: the invitation itself.

import { EASIEST_DAY, PARTS, TOTALS, WALK } from '../../content/itinerary.ts';
import { fragmentHref, mailtoHref } from '../../html/href.ts';
import { html, type SafeHtml } from '../../html/html.ts';
import { formatDateRange } from '../../i18n/format.ts';
import { toIso } from '../../time/plain-date.ts';
import { buttonLink, facts } from '../components.ts';
import type { Context, PageContent } from '../context.ts';

const [part1, part2, part3, part4] = PARTS;
const partDates = { weekday: true, year: false } as const;

/** Each part's invitation sentence, from its own facts. */
function invitation(ctx: Context, n: 1 | 2 | 3 | 4): string {
  const parts = ctx.m.home.parts;
  switch (n) {
    case 1:
      return parts[1].invite(part1);
    case 2:
      return parts[2].invite({ departs: part2.from, arrives: part2.to });
    case 3:
      return parts[3].invite(part3);
    case 4:
      return parts[4].invite(part4);
  }
}

/** A guest's join button, or nothing for the public. */
function joinButton(
  ctx: Context,
  o: {
    readonly id: string;
    readonly label: string;
    readonly variant: 'primary' | 'secondary';
    readonly subject: string;
    readonly body: string;
  },
): SafeHtml | null {
  if (ctx.viewer.kind !== 'guest') return null;
  const href = mailtoHref({
    to: ctx.viewer.joinEmail,
    subject: o.subject,
    body: o.body,
  });
  return html`<p>${buttonLink({ href, label: o.label, variant: o.variant, join: o.id })}</p>`;
}

function parts(ctx: Context): SafeHtml {
  const { m, lang } = ctx;
  return html`<ol class="parts">${PARTS.map((part) => {
    const text = m.home.parts[part.number];
    const about =
      typeof text.about === 'string'
        ? text.about
        : text.about({ km: part.km ?? 0 });
    const button = joinButton(ctx, {
      id: `part-${part.number}`,
      label: m.home.joinPart({ part: part.number }),
      variant: 'secondary',
      subject: m.joinEmail.partSubject({ part: part.number }),
      body: m.joinEmail.partBody({
        part: part.number,
        inSentence: text.inSentence,
        from: part.from,
        to: part.to,
      }),
    });
    // The line that says what the buttons do comes once, under the first.
    const mailLine =
      button && part.number === 1 ? html`<p>${m.home.mailLine}</p>` : null;
    return html`<li class="part">
<h3>${part.number}. ${text.name}</h3>
<p>${about}</p>
<p>${formatDateRange(part.from, part.to, lang, partDates)}</p>
<p><strong class="label-invite">${m.home.youCanJoin}</strong></p>
<p>${invitation(ctx, part.number)}</p>
${button}${mailLine}
</li>`;
  })}</ol>`;
}

function easiestDay(ctx: Context): SafeHtml {
  const { m } = ctx;
  const e = m.home.easiest;
  return html`<h2>${e.heading}</h2>
<p>${e.intro}</p>
<article class="card-outline">
<p><span>${e.date(EASIEST_DAY)}</span> <span class="tag">${e.tag}</span></p>
<h3>${e.title}</h3>
${facts([
  [e.walk, e.walkValue(EASIEST_DAY)],
  [e.gettingThere, e.gettingThereValue],
  [e.gettingHome, e.gettingHomeValue],
])}
${joinButton(ctx, {
  id: `day-${toIso(EASIEST_DAY.date)}`,
  label: e.join,
  variant: 'primary',
  subject: m.joinEmail.daySubject(EASIEST_DAY),
  body: m.joinEmail.dayBody({ date: EASIEST_DAY.date, title: e.title }),
})}
</article>`;
}

export function invitationHome(ctx: Context): PageContent {
  const { m } = ctx;
  const h = m.home;
  const plan = h.plan;

  const main = html`<h1>${h.h1}</h1>
<p class="lead">${h.lead}</p>
<p>${buttonLink({ href: fragmentHref('route'), label: h.seeWhere, variant: 'primary' })}</p>
<h2>${plan.heading}</h2>
${facts([
  [plan.when, plan.whenValue({ from: WALK.start, to: WALK.flightHome })],
  [plan.start, plan.startValue],
  [plan.finish, plan.finishValue],
  [plan.distance, plan.distanceValue(TOTALS)],
  [plan.days, plan.daysValue(TOTALS)],
])}
<div class="notice">
<h3>${h.notice.heading(WALK.provisional)}</h3>
<p>${h.notice.body(WALK.provisional)}</p>
</div>
<p>${h.camino}</p>
<h2 id="route">${h.route.heading({ parts: PARTS.length })}</h2>
<p>${h.route.intro}</p>
${ctx.viewer.kind === 'public' ? html`<p>${h.route.publicLine}</p>` : null}
${parts(ctx)}
<p>${h.flyHome({ date: WALK.flightHome })}</p>
${easiestDay(ctx)}
<h2>${h.follow.heading}</h2>
<p>${h.follow.body({ from: WALK.start })}</p>`;

  return { title: h.title, description: h.description, main, status: 200 };
}
