// The invite words: ordinary words, so the link can be read out over the
// phone. Case and separators do not matter.

/** Fewer words than this and the secret is treated as unset. */
export const MIN_WORDS = 3;

/** "Otter Lantern_meadow" → "otter-lantern-meadow". Malformed → "". */
export function normaliseWords(raw: string): string {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return '';
  }
  return decoded
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\-_.+,]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const digest = (text: string) =>
  crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));

/**
 * Compares digests in constant time. Fails closed: no secret, or a secret
 * of fewer than MIN_WORDS words, matches nothing, so a missing setting can
 * never turn /hello/-/ into a key.
 */
export async function wordsMatch(
  candidate: string,
  secret: string | undefined,
): Promise<boolean> {
  if (secret === undefined) return false;
  const expected = normaliseWords(secret);
  if (expected.split('-').filter(Boolean).length < MIN_WORDS) return false;
  const given = normaliseWords(candidate);
  if (given === '') return false;
  return crypto.subtle.timingSafeEqual(
    await digest(given),
    await digest(expected),
  );
}
