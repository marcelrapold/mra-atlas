// E2E smoke over the static export (apps/docs/out). Build first: npm run build.
import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 4173);
const ci = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: /\.spec\.mjs$/,
  // AXE_BASELINE_UPDATE=1 rewrites tests/e2e/axe-baseline.json from this run.
  globalSetup: './tests/e2e/axe-baseline-update.mjs',
  outputDir: 'node_modules/.cache/playwright/results',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  workers: ci ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: ci ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    locale: 'de-CH',
    timezoneId: 'Europe/Zurich',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium-light', use: { ...devices['Desktop Chrome'], colorScheme: 'light' } },
    { name: 'chromium-dark', use: { ...devices['Desktop Chrome'], colorScheme: 'dark' } },
  ],
  webServer: {
    command: `node scripts/serve-out.mjs --port ${port}`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !ci,
    timeout: 30_000,
  },
});
