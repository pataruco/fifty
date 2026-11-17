import { styleHash } from '../generated/assets.ts';

/**
 * Nothing loads from the network. The one inline style element is allowed
 * by its hash, and the logo and favicon are data: images.
 */
export function contentSecurityPolicy(): string {
  return [
    "default-src 'none'",
    `style-src '${styleHash}'`,
    'img-src data:',
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}
