import {test, expect} from '@playwright/test';

test('no theme flash: <html data-theme> is set before first paint', async ({page}) => {
  await page.goto('/id');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /night|light/);
});

test('desktop shows the rail with identity and route links', async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/id');
  // availability link is unique to the rail (the page <h1> also carries the name)
  await expect(page.getByRole('link', {name: /Terbuka untuk kolaborasi/})).toBeVisible();
  await expect(
    page.getByRole('navigation', {name: 'Navigasi utama'}).getByRole('link', {name: /Beranda/})
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', {name: 'Navigasi utama'}).getByRole('link', {name: /Karya/})
  ).toContainText('3');
});

test('mobile opens the navigation panel and restores focus on Escape', async ({page}) => {
  await page.setViewportSize({width: 390, height: 800});
  await page.goto('/id');
  const trigger = page.getByRole('button', {name: /menu/i});
  await expect(trigger).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Navigasi utama'})).toBeHidden();
  await trigger.click();
  await expect(page.getByRole('navigation', {name: 'Navigasi utama'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('navigation', {name: 'Navigasi utama'})).toBeHidden();
});

test('theme toggle flips data-theme and survives reload', async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/id');
  await page.getByRole('button', {name: /terang/i}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
