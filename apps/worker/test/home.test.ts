import { describe, expect, test } from 'vitest';
import { expectedHome, get, JOIN_FORMS } from './helpers.ts';

describe('Home', () => {
  test('GET / and /es/ return the public Home in the right language', async () => {
    const en = await get('/');
    const es = await get('/es/');

    expect(en.status).toBe(200);
    expect(await en.text()).toBe(expectedHome('en'));
    expect(es.status).toBe(200);
    expect(await es.text()).toBe(expectedHome('es'));
  });

  test('public pages are no-cache with Vary: Cookie', async () => {
    for (const path of ['/', '/es/', '/nowhere/', '/es/nowhere/']) {
      const response = await get(path);

      expect(response.headers.get('Cache-Control'), path).toBe('no-cache');
      expect(response.headers.get('Vary'), path).toBe('Cookie');
    }
  });

  test('public responses never contain the join address or join buttons', async () => {
    const paths = ['/', '/es/', '/nowhere/', '/es/nowhere/', '/hello/x/'];
    for (const path of paths) {
      for (const method of ['GET', 'HEAD']) {
        const response = await get(path, { method });
        const body = await response.text();
        const headers = [...response.headers].map(([k, v]) => `${k}: ${v}`);
        const everything = [body, ...headers].join('\n');

        for (const form of JOIN_FORMS) {
          expect(everything, `${method} ${path} ${form}`).not.toContain(form);
        }
        expect(body, `${method} ${path}`).not.toContain('data-join');
      }
    }
  });
});
