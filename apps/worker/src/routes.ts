// Which page a path asks for. Only the addresses below exist; everything
// else is a 404 in the language its path suggests.

import { type Lang, langOfPath } from '@fifty/shared';

export type Match =
  | { readonly kind: 'page'; readonly page: 'home'; readonly lang: Lang }
  | { readonly kind: 'hello'; readonly lang: Lang; readonly words: string }
  | { readonly kind: 'redirect'; readonly location: string }
  | { readonly kind: 'not-found'; readonly lang: Lang };

/** The invite link: /hello/<words>/ or /es/hello/<words>/. */
const HELLO = /^(\/es)?\/hello\/([^/]*)\/?$/;

export function matchRoute(pathname: string): Match {
  switch (pathname) {
    case '/':
      return { kind: 'page', page: 'home', lang: 'en' };
    case '/es/':
      return { kind: 'page', page: 'home', lang: 'es' };
    case '/es':
      return { kind: 'redirect', location: '/es/' };
  }
  const hello = HELLO.exec(pathname);
  if (hello) {
    return {
      kind: 'hello',
      lang: hello[1] ? 'es' : 'en',
      words: hello[2] ?? '',
    };
  }
  return { kind: 'not-found', lang: langOfPath(pathname) };
}
