import { messages } from '@fifty/shared';
import { describe, expect, test } from 'vitest';
import { get } from './helpers.ts';

describe('routing', () => {
  test('/es redirects 308 to /es/', async () => {
    const response = await get('/es', { redirect: 'manual' });

    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe('/es/');
  });

  test('unknown paths get the 404 page in the right language', async () => {
    const cases = [
      ['/nowhere', 'en'],
      ['/index.html', 'en'],
      ['/es/nowhere/', 'es'],
      ['/es/index.html', 'es'],
    ] as const;
    for (const [path, lang] of cases) {
      const response = await get(path);
      const body = await response.text();

      expect(response.status, path).toBe(404);
      expect(body, path).toContain(
        `<h1>${messages[lang].errors.notFound.heading}</h1>`,
      );
      expect(body, path).toContain(`<html lang="${messages[lang].htmlLang}">`);
    }
  });

  test('POST returns 405 with Allow: GET, HEAD', async () => {
    for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
      const response = await get('/', { method });

      expect(response.status, method).toBe(405);
      expect(response.headers.get('Allow'), method).toBe('GET, HEAD');
    }
  });

  test('HEAD returns the same headers and no body', async () => {
    for (const path of ['/', '/es/', '/nowhere/']) {
      const full = await get(path);
      const head = await get(path, { method: 'HEAD' });
      const headers = (r: Response) =>
        [...r.headers].filter(([name]) => name !== 'content-length');

      expect(head.status, path).toBe(full.status);
      expect(headers(head), path).toEqual(headers(full));
      expect(await head.text(), path).toBe('');
    }
  });

  test('a query string does not change the page', async () => {
    const plain = await (await get('/')).text();

    expect(await (await get('/?utm_source=chat')).text()).toBe(plain);
  });
});
