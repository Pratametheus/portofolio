import {test, expect} from '@playwright/test';

/** Absolute rotation (deg) of ScrollSpin's inner layer inside the hero figure. */
async function heroRotationDeg(page: import('@playwright/test').Page) {
  const inner = page.locator('figure .relative.h-full.w-full').first();
  await inner.waitFor({state: 'attached', timeout: 10000});
  return inner.evaluate((el) => {
    const t = getComputedStyle(el).transform;
    if (!t || t === 'none') return 0;
    const m = t.match(/matrix\(([^)]+)\)/);
    if (!m) return Number.NaN;
    const [a, b] = m[1].split(',').map(Number);
    return Math.abs((Math.atan2(b, a) * 180) / Math.PI);
  });
}

test('hero copy is visible on load without scrolling', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  // Substring matches both the tagline and the statement paragraph; the point
  // is that the hero copy paints without a scroll, so the first is enough.
  await expect(page.getByText('Saya membangun perangkat lunak').first()).toBeVisible();
});

test('prefers-reduced-motion: hero art carries no rotation transform', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/id');
  const fig = page.locator('figure').first();
  const t = await fig.evaluate((el) => getComputedStyle(el).transform);
  expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(t);
});

test('hero art is scroll-bound: ~0deg at rest, drifting as the section scrolls out', async ({page}) => {
  await page.goto('/id');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  expect(await heroRotationDeg(page)).toBeLessThan(2);

  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(300);
  const drifted = await heroRotationDeg(page);
  expect(drifted).toBeGreaterThanOrEqual(4);
  expect(drifted).toBeLessThanOrEqual(14);
});

test('prefers-reduced-motion: hero art stays at 0deg at every scroll position', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/id');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  expect(await heroRotationDeg(page)).toBe(0);

  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(300);
  expect(await heroRotationDeg(page)).toBe(0);
});

test('research stat reaches its final value', async ({page}) => {
  await page.goto('/id');
  // Anchored: `/riset/i` alone also matches the contact heading ("… riset …").
  await page.getByRole('heading', {name: /^riset/i}).scrollIntoViewIfNeeded();
  await expect(page.getByText(/^\s*10\s*$/)).toBeVisible({timeout: 4000});
});

test('selected-work cards are all present and linked', async ({page}) => {
  await page.goto('/id');
  for (const name of ['SIAKAD Informatika', 'City Courier', 'MochiToon']) {
    await expect(page.getByRole('link', {name})).toBeVisible();
  }
});
