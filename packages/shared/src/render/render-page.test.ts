import { JSDOM } from 'jsdom';
import { describe, expect, test } from 'vitest';
import { styleHash } from '../generated/assets.ts';
import { emailAddress, relativeHref } from '../html/href.ts';
import { LANGS, type Lang } from '../i18n/lang.ts';
import { messages } from '../i18n/messages.ts';
import type { RenderInput, Viewer } from './context.ts';
import { contentSecurityPolicy } from './csp.ts';
import { renderPage } from './render-page.ts';
import { BUILT_PAGES, counterpartPath, pathFor } from './routes.ts';

const JOIN = 'join@example.test';
const PUBLIC: Viewer = { kind: 'public' };
const GUEST: Viewer = { kind: 'guest', joinEmail: emailAddress(JOIN) };
const PAGES = ['home', 'not-found', 'invite-gone'] as const;

function input(o: Partial<RenderInput> & { lang: Lang }): RenderInput {
  const page = o.page ?? 'home';
  const path =
    page === 'home'
      ? pathFor('home', o.lang)
      : `${o.lang === 'es' ? '/es' : ''}/somewhere/`;
  return {
    page,
    season: 'invitation',
    viewer: PUBLIC,
    links: 'absolute',
    path,
    ...o,
  };
}

const render = (o: Partial<RenderInput> & { lang: Lang }) =>
  renderPage(input(o));
const parse = (markup: string) => new JSDOM(markup).window.document;
const doc = (o: Partial<RenderInput> & { lang: Lang }) => parse(render(o).html);

/** Every language, viewer, page and link style. */
const variants = LANGS.flatMap((lang) =>
  [PUBLIC, GUEST].flatMap((viewer) =>
    PAGES.flatMap((page) =>
      (['absolute', 'relative'] as const).map((links) => ({
        lang,
        viewer,
        page,
        links,
      })),
    ),
  ),
);
const builtPaths = new Set<string>(
  BUILT_PAGES.flatMap((page) => LANGS.map((lang) => pathFor(page, lang))),
);

describe('renderPage', () => {
  test.each(
    LANGS.flatMap(
      (lang) =>
        [
          [lang, PUBLIC],
          [lang, GUEST],
        ] as const,
    ),
  )(
    'public and guest Home match their snapshots: %s %o',
    async (lang, viewer) => {
      const markup = render({ lang, viewer }).html.replace(
        /<style>[\s\S]*?<\/style>/,
        '<style>/* fifty.css */</style>',
      );

      await expect(markup).toMatchFileSnapshot(
        `__snapshots__/home.${lang}.${viewer.kind}.html`,
      );
    },
  );

  test.each(LANGS)(
    'guest Home has 4 part buttons and 1 day button, each a mailto: to the join address (%s)',
    (lang) => {
      const buttons = [
        ...doc({ lang, viewer: GUEST }).querySelectorAll('a[data-join]'),
      ];

      expect(buttons.map((b) => b.getAttribute('data-join'))).toEqual([
        'part-1',
        'part-2',
        'part-3',
        'part-4',
        'day-2028-05-12',
      ]);
      for (const button of buttons) {
        const href = new URL(button.getAttribute('href') ?? '');
        const subject = href.searchParams.get('subject') ?? '';
        const body = href.searchParams.get('body') ?? '';
        const id = button.getAttribute('data-join') ?? '';

        expect(href.protocol).toBe('mailto:');
        expect(href.pathname).toBe(JOIN);
        if (id.startsWith('part-')) {
          const n = id.slice(5);
          const word = lang === 'es' ? 'parte' : 'part';
          expect(subject).toContain(`${word} ${n}`);
          expect(body).toContain(`${word} ${n}`);
        } else {
          const day =
            lang === 'es' ? 'viernes 12 de mayo de 2028' : 'Friday 12 May 2028';
          expect(subject).toContain(day);
          expect(body).toContain(day);
        }
        expect(body).toMatch(/\r\n\r\n/);
      }
      expect(buttons[1]?.getAttribute('href')).toBe(
        lang === 'en'
          ? `mailto:${JOIN}?subject=Joining%20part%202%20of%20your%20walk&body=Hi%20Pedro%2C%0D%0A%0D%0AI'd%20like%20to%20join%20part%202%3A%20Ferry%20to%20Spain%2C%20Portsmouth%20to%20Ferrol%2C%20Monday%2015%20to%20Wednesday%2017%20May%202028.`
          : `mailto:${JOIN}?subject=Ir%20a%20la%20parte%202%20de%20tu%20caminata&body=Hola%2C%20Pedro%3A%0D%0A%0D%0AMe%20gustar%C3%ADa%20ir%20a%20la%20parte%202%3A%20ferry%20a%20Espa%C3%B1a%2C%20de%20Portsmouth%20a%20Ferrol%2C%20del%20lunes%2015%20al%20mi%C3%A9rcoles%2017%20de%20mayo%20de%202028.`,
      );
    },
  );

  test.each(LANGS)(
    'the mail line appears once, right after the first join button (%s)',
    (lang) => {
      const d = doc({ lang, viewer: GUEST });
      const line = messages[lang].home.mailLine;
      const matches = [...d.querySelectorAll('p')].filter(
        (p) => p.textContent === line,
      );
      const first = d.querySelector('a[data-join]');

      expect(matches).toHaveLength(1);
      expect(first?.parentElement?.nextElementSibling).toBe(matches[0]);
    },
  );

  test.each(LANGS)(
    'public Home shows the open-letter line once, has no data-join, and has no mailto: except hola@pataruco.dev (%s)',
    (lang) => {
      const d = doc({ lang });
      const line = messages[lang].home.route.publicLine;
      const mailtos = [...d.querySelectorAll('a[href^="mailto:"]')].map((a) =>
        a.getAttribute('href'),
      );

      expect(
        [...d.querySelectorAll('p')].filter((p) => p.textContent === line),
      ).toHaveLength(1);
      expect(d.querySelectorAll('[data-join]')).toHaveLength(0);
      expect(mailtos).toEqual(['mailto:hola@pataruco.dev']);
      expect(d.body.textContent).not.toContain(messages[lang].home.mailLine);
      expect(doc({ lang, viewer: GUEST }).body.textContent).not.toContain(line);
    },
  );

  test.each(variants)(
    'the language link is named in the other language, has lang and hreflang, and points to the counterpart',
    (v) => {
      const other: Lang = v.lang === 'en' ? 'es' : 'en';
      const link = doc(v).querySelector('header a[hreflang]');
      const path = input(v).path;
      const target =
        v.page === 'home' ? counterpartPath(path) : pathFor('home', other);
      const expected =
        v.links === 'absolute' ? target : relativeHref(path, target);

      expect(link?.textContent).toBe(messages[other].languageName);
      expect(link?.getAttribute('lang')).toBe(other);
      expect(link?.getAttribute('hreflang')).toBe(other);
      expect(link?.getAttribute('href')).toBe(expected);
    },
  );

  test.each(variants)(
    'every internal link targets a built page or an id on the page',
    (v) => {
      const d = doc(v);
      for (const a of d.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href') ?? '';
        if (/^(mailto:|https:)/.test(href)) continue;
        if (href.startsWith('#')) {
          expect(d.getElementById(href.slice(1)), href).not.toBeNull();
        } else if (v.links === 'relative') {
          expect(href, 'relative links end in .html or #id').toMatch(
            /\.html(#[\w-]+)?$/,
          );
          const base = new URL(`file:///book${input(v).path}`);
          const file = new URL(href, base).pathname.replace(/^\/book/, '');
          expect(builtPaths.has(file.replace(/index\.html$/, '')), href).toBe(
            true,
          );
        } else {
          expect(builtPaths.has(href), href).toBe(true);
        }
      }
    },
  );

  test.each(variants)('no element has a style attribute ($lang $page)', (v) => {
    expect(doc(v).querySelectorAll('[style]')).toHaveLength(0);
  });

  test.each(variants)(
    'there is one h1 and headings never skip a level',
    (v) => {
      const levels = [...doc(v).querySelectorAll('h1, h2, h3, h4, h5, h6')].map(
        (h) => Number(h.tagName[1]),
      );

      expect(levels.filter((l) => l === 1)).toHaveLength(1);
      expect(levels[0]).toBe(1);
      levels.forEach((level, i) => {
        if (i > 0) expect(level - (levels[i - 1] ?? 1)).toBeLessThanOrEqual(1);
      });
    },
  );

  test.each(variants)(
    'the body content is wrapped in email_off markers',
    (v) => {
      expect(render(v).html).toMatch(
        /<body>\s*<!--email_off-->[\s\S]*<!--\/email_off-->\s*<\/body>/,
      );
    },
  );

  test.each(variants)(
    'the head carries the language, robots and inline style',
    (v) => {
      const d = doc(v);

      expect(d.documentElement.lang).toBe(messages[v.lang].htmlLang);
      expect(
        d.querySelector('meta[name="robots"]')?.getAttribute('content'),
      ).toBe('noindex, nofollow');
      expect(d.querySelectorAll('style')).toHaveLength(1);
      expect(d.querySelector('meta[property="og:title"]')).not.toBeNull();
      expect(d.querySelector('link[rel="icon"]')?.getAttribute('href')).toMatch(
        /^data:image\/svg\+xml,/,
      );
    },
  );

  test('status is 200 for Home and 404 for the error pages', () => {
    expect(PAGES.map((page) => render({ lang: 'en', page }).status)).toEqual([
      200, 404, 404,
    ]);
  });

  test('error pages say what happened and link to Home', () => {
    for (const lang of LANGS) {
      const m = messages[lang].errors;
      const gone = doc({ lang, page: 'invite-gone' });
      const missing = doc({ lang, page: 'not-found' });

      expect(gone.querySelector('h1')?.textContent).toBe(m.inviteGone.heading);
      expect(gone.querySelector('main')?.textContent).toContain(
        'hola@pataruco.dev',
      );
      expect(missing.querySelector('h1')?.textContent).toBe(m.notFound.heading);
      expect(
        missing.querySelector(`main a[href="${pathFor('home', lang)}"]`)
          ?.textContent,
      ).toBe(m.notFound.link);
    }
  });

  test('contentSecurityPolicy() allows exactly styleHash for styles and data: for images', () => {
    const directives = new Map(
      contentSecurityPolicy()
        .split(';')
        .map((d) => d.trim().split(/\s+/))
        .map(([name = '', ...values]) => [name, values]),
    );

    expect(directives.get('default-src')).toEqual(["'none'"]);
    expect(directives.get('style-src')).toEqual([`'${styleHash}'`]);
    expect(directives.get('img-src')).toEqual(['data:']);
    expect(directives.has('script-src')).toBe(false);
  });

  test('pathFor and counterpartPath', () => {
    expect(pathFor('home', 'en')).toBe('/');
    expect(pathFor('home', 'es')).toBe('/es/');
    expect(counterpartPath('/')).toBe('/es/');
    expect(counterpartPath('/es/')).toBe('/');
    expect(counterpartPath('/walk/')).toBe('/es/walk/');
    expect(counterpartPath('/es/walk/')).toBe('/walk/');
  });
});
