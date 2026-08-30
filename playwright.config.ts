import {existsSync} from 'node:fs';
import {defineConfig, devices} from '@playwright/test';

// Some sandboxed dev environments pre-install Chromium outside Playwright's
// expected revision path. When that fixed location exists, launch from it
// instead of the auto-detected one; otherwise (e.g. CI, after a normal
// `playwright install`) fall back to Playwright's default resolution.
const sandboxChromium = '/opt/pw-browsers/chromium';
const launchOptions = existsSync(sandboxChromium)
  ? {executablePath: sandboxChromium}
  : {};

export default defineConfig({
  testDir: './e2e',
  // Next dev can race while compiling the same cold route for both projects.
  workers: 1,
  use: {baseURL: 'http://localhost:3000'},
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome'], launchOptions}},
    {name: 'mobile', use: {...devices['Pixel 5'], launchOptions}}
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true
  }
});
