import { describe, expect, test } from 'vitest';
import { escapeHtml, type HtmlValue, html, SafeHtml } from './html.ts';

describe('html', () => {
  test('escapes the five special characters', () => {
    expect(String(html`<p>${'<a href="x">&\''}</p>`)).toBe(
      '<p>&lt;a href=&quot;x&quot;&gt;&amp;&#39;</p>',
    );
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;');
  });

  test('never escapes SafeHtml twice', () => {
    const inner = html`<b>${'&'}</b>`;

    expect(String(html`<p>${inner}</p>`)).toBe('<p><b>&amp;</b></p>');
  });

  test('renders null, undefined and false as nothing and flattens arrays', () => {
    const items: HtmlValue[] = [
      'a',
      ['b', html`<i>c</i>`],
      null,
      undefined,
      false,
      4,
    ];

    expect(String(html`<p>${null}${undefined}${false}</p>`)).toBe('<p></p>');
    expect(String(html`<ul>${items}</ul>`)).toBe('<ul>ab<i>c</i>4</ul>');
  });

  test('refuses NaN, Infinity, true and objects', () => {
    const bad: unknown[] = [Number.NaN, Number.POSITIVE_INFINITY, true, {}];

    for (const value of bad) {
      // biome-ignore lint/suspicious/noExplicitAny: the point is to bypass the type
      expect(() => html`<p>${value as any}</p>`).toThrow(TypeError);
    }
  });

  test('a SafeHtml cannot be forged from a plain object', () => {
    const fake = { toString: () => '<script>alert(1)</script>' };
    const proto = Object.create(SafeHtml.prototype) as SafeHtml;

    // biome-ignore lint/suspicious/noExplicitAny: the point is to bypass the type
    expect(() => html`${fake as any}`).toThrow(TypeError);
    expect(() => html`${proto}`).toThrow(TypeError);
    expect(SafeHtml.is(fake)).toBe(false);
    expect(SafeHtml.is(html`<p></p>`)).toBe(true);
  });
});
