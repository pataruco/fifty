// Link targets. Each kind is checked where it is made, so a page template
// only ever receives an Href, never a bare string.

declare const hrefBrand: unique symbol;
export type Href = string & { readonly [hrefBrand]: true };

declare const emailBrand: unique symbol;
export type EmailAddress = string & { readonly [emailBrand]: true };

const asHref = (value: string) => value as Href;

export function pathHref(path: `/${string}`): Href {
  if (!/^\/(?!\/)[^\s"'<>\\]*$/.test(path)) {
    throw new TypeError(`pathHref: not a site path: ${path}`);
  }
  return asHref(path);
}

/** A link between two pages of the Book, written as files on disk. */
export function relativeHref(fromPath: string, toPath: string): Href {
  const segments = (p: string) => p.split('/').filter(Boolean);
  const from = segments(fromPath);
  const to = segments(toPath);
  let common = 0;
  while (
    common < from.length &&
    common < to.length &&
    from[common] === to[common]
  ) {
    common++;
  }
  const up = '../'.repeat(from.length - common);
  const down = to
    .slice(common)
    .map((s) => `${s}/`)
    .join('');
  return asHref(`${up}${down}index.html`);
}

export function fragmentHref(id: string): Href {
  if (!/^[A-Za-z][\w-]*$/.test(id)) {
    throw new TypeError(`fragmentHref: not an id: ${id}`);
  }
  return asHref(`#${id}`);
}

export function externalHref(url: `https://${string}`): Href {
  if (!/^https:\/\/[^\s"'<>\\]+$/.test(url)) {
    throw new TypeError(`externalHref: not an https address: ${url}`);
  }
  return asHref(url);
}

/** For src/generated/assets.ts only; the trust-boundary test enforces it. */
export function trustBuildHref(
  url: `data:${string}`,
  _source: 'generated/assets',
): Href {
  return asHref(url);
}

const EMAIL_PART = String.raw`[^\s"'<>()\[\]\\,;:@]+`;
const EMAIL = new RegExp(`^${EMAIL_PART}@${EMAIL_PART}\\.${EMAIL_PART}$`);

export function emailAddress(value: string): EmailAddress {
  if (!EMAIL.test(value)) {
    throw new TypeError('emailAddress: not a plain email address');
  }
  return value as EmailAddress;
}

// encodeURIComponent, never URLSearchParams: its "+" for a space shows
// literally in iOS Mail.
const encodeMailPart = (text: string) =>
  encodeURIComponent(text.replace(/\r?\n/g, '\r\n'));

export function mailtoHref(
  o: { to: EmailAddress } | { to: EmailAddress; subject: string; body: string },
): Href {
  if (!('subject' in o)) return asHref(`mailto:${o.to}`);
  return asHref(
    [
      `mailto:${o.to}`,
      '?subject=',
      encodeMailPart(o.subject),
      '&body=',
      encodeMailPart(o.body),
    ].join(''),
  );
}
