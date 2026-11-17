import { readFile } from 'node:fs/promises';
import * as csstree from 'css-tree';
import { JSDOM } from 'jsdom';
import { describe, expect, test } from 'vitest';
import { buildAssetsModule } from '../../scripts/build-styles.ts';
import { css } from '../generated/assets.ts';
import { emailAddress } from '../html/href.ts';
import { LANGS } from '../i18n/lang.ts';
import type { Viewer } from '../render/context.ts';
import { renderPage } from '../render/render-page.ts';
import { pathFor } from '../render/routes.ts';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

const VIEWERS: Viewer[] = [
  { kind: 'public' },
  { kind: 'guest', joinEmail: emailAddress('join@example.test') },
];
const PAGES = ['home', 'not-found', 'invite-gone'] as const;

/** Every page the slice renders, as a DOM. */
const docs = LANGS.flatMap((lang) =>
  VIEWERS.flatMap((viewer) =>
    PAGES.map(
      (page) =>
        new JSDOM(
          renderPage({
            page,
            lang,
            viewer,
            season: 'invitation',
            links: 'absolute',
            path: page === 'home' ? pathFor('home', lang) : '/somewhere/',
          }).html,
        ).window.document,
    ),
  ),
);

interface StyleRule {
  /** The selector as written. */
  readonly selector: string;
  /** With pseudo-classes and pseudo-elements removed, for querySelector. */
  readonly structural: string;
  readonly declarations: readonly { property: string; value: string }[];
  /** The preludes of the @media rules around it. */
  readonly media: readonly string[];
}

/** One entry per selector of every style rule, including those in @media. */
function styleRules(source: string): StyleRule[] {
  const ast = csstree.parse(source);
  const rules: StyleRule[] = [];

  function visit(node: csstree.CssNode, media: readonly string[]) {
    if (node.type === 'Atrule' && node.block) {
      const prelude = node.prelude ? csstree.generate(node.prelude) : '';
      for (const child of node.block.children) {
        visit(child, [...media, `@${node.name} ${prelude}`]);
      }
    } else if (node.type === 'StyleSheet') {
      for (const child of node.children) visit(child, media);
    } else if (node.type === 'Rule' && node.prelude.type === 'SelectorList') {
      const declarations = node.block.children
        .toArray()
        .filter((d): d is csstree.Declaration => d.type === 'Declaration')
        .map((d) => ({
          property: d.property,
          value: csstree.generate(d.value),
        }));
      for (const selector of node.prelude.children) {
        const written = csstree.generate(selector);
        const copy = csstree.clone(selector) as csstree.Selector;
        copy.children = copy.children.filter(
          (part) =>
            part.type !== 'PseudoClassSelector' &&
            part.type !== 'PseudoElementSelector',
        );
        const structural =
          csstree
            .generate(copy)
            .replace(/[>+~]\s*$/, '')
            .trim() || '*';
        rules.push({ selector: written, structural, declarations, media });
      }
    }
  }

  visit(ast, []);
  return rules;
}

const source = await read('./fifty.css');
const rules = styleRules(source);

describe('styles', () => {
  test('every selector in fifty.css matches an element on a rendered page', () => {
    const unmatched = rules
      .filter((r) => !docs.some((d) => d.querySelector(r.structural)))
      .map((r) => r.selector);

    expect(rules.length).toBeGreaterThan(20);
    expect(unmatched).toEqual([]);
  });

  test('the minified stylesheet stays under 6,000 bytes', () => {
    expect(new TextEncoder().encode(css).length).toBeLessThan(6000);
  });

  test.each([
    ['</style', 'p::after { content: "</style>"; }'],
    ['@import', '@import "x.css";'],
    ['@font-face', '@font-face { font-family: X; src: local(X); }'],
    ['url()', 'p { background: url(https://example.test/x.png); }'],
  ])('the generator refuses %s', async (_name, bad) => {
    const sources = {
      css: `${source}\n${bad}`,
      logoSvg: await read('../brand/logo.svg'),
      faviconSvg: await read('../brand/favicon.svg'),
    };

    await expect(buildAssetsModule(sources)).rejects.toThrow(/stylesheet/);
  });

  test('the generator allows data: urls', async () => {
    const sources = {
      css: `${source}\np { background: url("data:image/svg+xml,%3Csvg%2F%3E"); }`,
      logoSvg: await read('../brand/logo.svg'),
      faviconSvg: await read('../brand/favicon.svg'),
    };

    await expect(buildAssetsModule(sources)).resolves.toContain('data:');
  });

  test('transitions only appear under prefers-reduced-motion: no-preference', () => {
    const moving = rules.filter((r) =>
      r.declarations.some((d) => /^(transition|animation)/.test(d.property)),
    );
    const unguarded = moving
      .filter(
        (r) =>
          !r.media.some((m) =>
            /prefers-reduced-motion:\s*no-preference/.test(m),
          ),
      )
      .map((r) => r.selector);

    expect(moving.length).toBeGreaterThan(0);
    expect(unguarded).toEqual([]);
    expect(source).not.toMatch(/@keyframes/);
  });

  test('no rule hides the language link', () => {
    const hides = (d: { property: string; value: string }) =>
      (d.property === 'display' && d.value === 'none') ||
      (d.property === 'visibility' && d.value === 'hidden') ||
      (d.property === 'opacity' && Number(d.value) === 0) ||
      d.property === 'clip' ||
      d.property === 'clip-path';
    const hiding = rules.filter((r) => r.declarations.some(hides));

    for (const d of docs) {
      const link = d.querySelector('.lang-switch');
      expect(link).not.toBeNull();
      for (let el = link; el; el = el.parentElement) {
        const culprits = hiding.filter((r) => el?.matches(r.structural));
        expect(culprits.map((r) => r.selector)).toEqual([]);
      }
    }
  });

  test("focus styles use :focus-visible and the button's outline is not white", () => {
    const plainFocus = rules.filter((r) =>
      /:focus(?!-visible|-within)/.test(r.selector),
    );
    const buttonFocus = rules.filter(
      (r) =>
        r.selector.includes('.btn') && r.selector.includes(':focus-visible'),
    );
    const outlines = buttonFocus.flatMap((r) =>
      r.declarations.filter((d) => d.property.startsWith('outline')),
    );

    expect(plainFocus.map((r) => r.selector)).toEqual([]);
    expect(rules.some((r) => r.selector === ':focus-visible')).toBe(true);
    expect(outlines.length).toBeGreaterThan(0);
    for (const o of outlines) {
      expect(o.value).not.toMatch(/#fff\b|#ffffff|white|currentcolor/i);
    }
  });
});
