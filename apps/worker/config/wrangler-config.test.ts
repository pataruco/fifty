// Runs in Node: checks the deploy configuration itself.

import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';

const text = await readFile(
  new URL('../wrangler.jsonc', import.meta.url),
  'utf8',
);
// JSONC: drop whole-line comments, then parse as JSON.
const config = JSON.parse(text.replace(/^\s*\/\/.*$/gm, ''));

describe('wrangler.jsonc', () => {
  test('Workers Cache stays off', () => {
    // That cache keys on path and query and ignores the guest cookie.
    expect(config).not.toHaveProperty('cache');
  });

  test('secrets.required lists INVITE_WORDS, GUEST_KEY and JOIN_EMAIL', () => {
    expect([...config.secrets.required].sort()).toEqual([
      'GUEST_KEY',
      'INVITE_WORDS',
      'JOIN_EMAIL',
    ]);
  });

  test('workers_dev and preview_urls are false', () => {
    expect(config.workers_dev).toBe(false);
    expect(config.preview_urls).toBe(false);
  });

  test('assets.directory is ../web/public', () => {
    expect(config.assets.directory).toBe('../web/public');
  });
});
