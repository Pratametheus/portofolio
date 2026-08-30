import {test, expect} from '@playwright/test';

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
