import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

// Fixed test values. None of them is a real secret, word or address.
const TEST_GUEST_KEY = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=';

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        bindings: {
          INVITE_WORDS: 'otter lantern meadow harbour',
          GUEST_KEY: TEST_GUEST_KEY,
          JOIN_EMAIL: 'join@example.test',
        },
      },
    }),
  ],
  test: {
    include: ['test/**/*.test.ts'],
  },
});
