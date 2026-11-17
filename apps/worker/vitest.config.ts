import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

// Fixed test values. None of them is a real secret, word or address.
const TEST_GUEST_KEY = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=';

export default defineConfig({
  test: {
    projects: [
      {
        // The Worker itself, inside workerd.
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
          name: 'worker',
          include: ['test/**/*.test.ts'],
        },
      },
      {
        // The deploy configuration, read from disk in Node.
        test: {
          name: 'node',
          include: ['config/**/*.test.ts', 'scripts/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
