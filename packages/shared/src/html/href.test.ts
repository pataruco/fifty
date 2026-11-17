import { describe, expect, test } from 'vitest';
import {
  emailAddress,
  externalHref,
  fragmentHref,
  mailtoHref,
  pathHref,
  relativeHref,
} from './href.ts';

describe('href', () => {
  test('mailtoHref encodes spaces as %20 and line breaks as %0D%0A', () => {
    const href = mailtoHref({
      to: emailAddress('a@b.test'),
      subject: 'Día 5',
      body: 'a\nb',
    });

    expect(href).toBe('mailto:a@b.test?subject=D%C3%ADa%205&body=a%0D%0Ab');
  });

  test('mailtoHref with no subject or body is the bare address', () => {
    expect(mailtoHref({ to: emailAddress('hola@pataruco.dev') })).toBe(
      'mailto:hola@pataruco.dev',
    );
  });

  test('emailAddress rejects spaces, quotes and angle brackets', () => {
    for (const bad of [
      'a b@c.test',
      'a"b@c.test',
      "a'b@c.test",
      '<a@b.test>',
    ]) {
      expect(() => emailAddress(bad)).toThrow(TypeError);
    }
    expect(emailAddress('hola@pataruco.dev')).toBe('hola@pataruco.dev');
  });

  test('relativeHref works between the two Homes', () => {
    expect(relativeHref('/es/', '/')).toBe('../index.html');
    expect(relativeHref('/', '/es/')).toBe('es/index.html');
    expect(relativeHref('/', '/')).toBe('index.html');
  });

  test('pathHref, fragmentHref and externalHref refuse what they should', () => {
    expect(pathHref('/es/')).toBe('/es/');
    expect(() => pathHref('//evil.test/' as `/${string}`)).toThrow(TypeError);
    expect(fragmentHref('route')).toBe('#route');
    expect(() => fragmentHref('a b')).toThrow(TypeError);
    expect(externalHref('https://pataruco.dev')).toBe('https://pataruco.dev');
    expect(() => externalHref('https://a b' as `https://${string}`)).toThrow(
      TypeError,
    );
  });
});
