// Browser checks against `wrangler dev`, served over https so the
// __Host- guest cookie behaves as it does in production.

import { defineConfig, devices } from '@playwright/test';

const PORT = 8788;
export const BASE_URL = `https://localhost:${PORT}`;

// Sample values only. None of them is a real secret, word or address.
export const SAMPLE = {
  INVITE_WORDS: 'otter lantern meadow harbour',
  GUEST_KEY: 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=',
  JOIN_EMAIL: 'join@example.test',
} as const;

const vars = Object.entries(SAMPLE)
  .map(([name, value]) => `--var "${name}:${value}"`)
  .join(' ');

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'pixel-7', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-15', use: { ...devices['iPhone 15'] } },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: `pnpm exec wrangler dev --local-protocol https --port ${PORT} --show-interactive-dev-session=false ${vars}`,
    cwd: '..',
    url: `${BASE_URL}/`,
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
