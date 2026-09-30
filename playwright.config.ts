import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for Discipline-OS
 * Tests the complete flow: Landing -> Today -> Complete Task -> Entertainment Gate -> Rewards Catalog
 * Also audits responsive viewports (Mobile 375px, Tablet 768px, Desktop 1200px+)
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: 'npx next start -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
