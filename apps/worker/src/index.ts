import { css, styleHash } from '@fifty/shared';

const page = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Fifty</title><style>${css}</style></head><body><p>Fifty</p></body></html>`;

export default {
  async fetch(): Promise<Response> {
    return new Response(page, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': `default-src 'none'; style-src '${styleHash}'`,
      },
    });
  },
} satisfies ExportedHandler<Env>;
