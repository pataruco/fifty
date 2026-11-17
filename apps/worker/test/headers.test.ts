import { contentSecurityPolicy } from '@fifty/shared';
import { describe, expect, test } from 'vitest';
import { get, sha256Base64, styleTexts } from './helpers.ts';

const HTML_PATHS = ['/', '/es/', '/nowhere/', '/es/nowhere/'];

describe('headers', () => {
  test('every HTML response carries the CSP, X-Robots-Tag, Referrer-Policy and nosniff', async () => {
    for (const path of HTML_PATHS) {
      for (const method of ['GET', 'HEAD']) {
        const h = (await get(path, { method })).headers;
        const where = `${method} ${path}`;

        expect(h.get('Content-Type'), where).toBe('text/html; charset=utf-8');
        expect(h.get('Content-Security-Policy'), where).toBe(
          contentSecurityPolicy(),
        );
        expect(h.get('X-Robots-Tag'), where).toBe('noindex, nofollow');
        expect(h.get('Referrer-Policy'), where).toBe('no-referrer');
        expect(h.get('X-Content-Type-Options'), where).toBe('nosniff');
      }
    }
  });

  test('redirects and refusals carry the robots and referrer headers too', async () => {
    for (const response of [
      await get('/es', { redirect: 'manual' }),
      await get('/', { method: 'POST' }),
    ]) {
      expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
      expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    }
  });

  test('the CSP hash matches every <style> in the body', async () => {
    for (const path of HTML_PATHS) {
      const response = await get(path);
      const csp = response.headers.get('Content-Security-Policy') ?? '';
      const allowed = [...csp.matchAll(/'sha256-([A-Za-z0-9+/=]+)'/g)].map(
        (m) => m[1],
      );
      const styles = await styleTexts(await response.text());

      expect(styles.length, path).toBeGreaterThan(0);
      for (const style of styles) {
        expect(allowed, path).toContain(await sha256Base64(style));
      }
    }
  });
});
