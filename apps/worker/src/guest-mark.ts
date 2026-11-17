// The guest mark: a signed cookie that says "this device opened the invite
// link". It is keyed with GUEST_KEY, not with the words, so changing the
// words keeps every guest, and rotating the key removes them all.
//
// Value: g1.<issued-at in seconds, base36>.<base64url HMAC-SHA-256 of the rest>

export const GUEST_COOKIE = '__Host-fifty-guest';
/** Midnight London time on 1 July 2028: nobody is a guest after the walk. */
export const MARK_END = Date.UTC(2028, 5, 30, 23);
/** 400 days, the longest a browser keeps a cookie. */
export const MAX_AGE_CAP_S = 34_560_000;
/** 30 days: older marks are signed again on the next visit. */
export const REFRESH_AFTER_S = 2_592_000;

const VERSION = 'g1';
/** How far ahead of our clock a mark may be, for clock skew. */
const FUTURE_SKEW_MS = 300_000;
const MIN_KEY_BYTES = 32;

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** GUEST_KEY is base64 of at least 32 random bytes. */
export async function importMarkKey(secret: string): Promise<CryptoKey> {
  const bytes = fromBase64(secret);
  if (bytes.length < MIN_KEY_BYTES) {
    throw new Error(`GUEST_KEY must be at least ${MIN_KEY_BYTES} bytes`);
  }
  return crypto.subtle.importKey(
    'raw',
    bytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

const payloadFor = (issuedAtS: number) =>
  `${VERSION}.${issuedAtS.toString(36)}`;

export async function signMark(
  issuedAt: number,
  key: CryptoKey,
): Promise<string> {
  const payload = payloadFor(Math.floor(issuedAt / 1000));
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload),
  );
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifyMark(
  value: string,
  key: CryptoKey,
  now: number,
): Promise<{ issuedAt: number } | null> {
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  const [version, issued = '', signature = ''] = parts;
  if (version !== VERSION || !/^[0-9a-z]{1,12}$/.test(issued)) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(signature)) return null;

  const issuedAtS = Number.parseInt(issued, 36);
  const issuedAt = issuedAtS * 1000;
  if (payloadFor(issuedAtS) !== `${version}.${issued}`) return null;
  if (issuedAt > now + FUTURE_SKEW_MS) return null;
  if (now - issuedAt > MAX_AGE_CAP_S * 1000) return null;
  if (now >= MARK_END) return null;

  let bytes: Uint8Array<ArrayBuffer>;
  try {
    bytes = fromBase64(signature);
  } catch {
    return null;
  }
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    bytes,
    encoder.encode(`${version}.${issued}`),
  );
  return valid ? { issuedAt } : null;
}

/** Lax, so the cookie rides on the first visit from a link in a message. */
export function guestCookie(value: string, now: number): string {
  const untilEnd = Math.max(0, Math.floor((MARK_END - now) / 1000));
  const maxAge = Math.min(MAX_AGE_CAP_S, untilEnd);
  return `${GUEST_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; Secure; HttpOnly; SameSite=Lax`;
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const pair of header.split(';')) {
    const at = pair.indexOf('=');
    if (at !== -1 && pair.slice(0, at).trim() === name) {
      return pair.slice(at + 1).trim();
    }
  }
  return null;
}

export function needsRefresh(issuedAt: number, now: number): boolean {
  return now - issuedAt > REFRESH_AFTER_S * 1000;
}
