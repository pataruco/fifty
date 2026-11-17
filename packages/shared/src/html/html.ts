// The one way markup is made. Every interpolated string is escaped; only a
// SafeHtml passes through as it is, and a SafeHtml comes only from this
// template or from the generated build assets.

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

let createSafeHtml: (markup: string) => SafeHtml;

export class SafeHtml {
  readonly #html: string;

  private constructor(markup: string) {
    this.#html = markup;
  }

  static {
    createSafeHtml = (markup) => new SafeHtml(markup);
  }

  static is(value: unknown): value is SafeHtml {
    return typeof value === 'object' && value !== null && #html in value;
  }

  toString(): string {
    return this.#html;
  }
}

export type HtmlValue =
  | SafeHtml
  | string
  | number
  | false
  | null
  | undefined
  | readonly HtmlValue[];

function render(value: HtmlValue): string {
  if (value === null || value === undefined || value === false) return '';
  if (typeof value === 'string') return escapeHtml(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(`html: refusing the number ${value}`);
    }
    return String(value);
  }
  if (Array.isArray(value)) return value.map(render).join('');
  if (SafeHtml.is(value)) return value.toString();
  throw new TypeError(`html: refusing a value of type ${typeof value}`);
}

export function html(
  strings: TemplateStringsArray,
  ...values: readonly HtmlValue[]
): SafeHtml {
  let out = strings[0] ?? '';
  values.forEach((value, i) => {
    out += render(value) + (strings[i + 1] ?? '');
  });
  return createSafeHtml(out);
}

/** For src/generated/assets.ts only; the trust-boundary test enforces it. */
export function trustBuildOutput(
  markup: string,
  _source: 'generated/assets',
): SafeHtml {
  return createSafeHtml(markup);
}
