import {test, expect} from '@playwright/test';

test('no theme flash: <html data-theme> is set before first paint', async ({page}) => {
  await page.goto('/id');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /night|light/);
});

test('desktop shows the sidebar rail', async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/id');
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByRole('link', {name: /Beranda/})).toBeVisible();
});

test('mobile collapses the sidebar to a drawer', async ({page}) => {
  await page.setViewportSize({width: 390, height: 800});
  await page.goto('/id');
  const trigger = page.getByRole('button', {name: /menu/i});
  await expect(trigger).toBeVisible();
  await expect(page.getByRole('navigation')).toBeHidden();
  await trigger.click();
  await expect(page.getByRole('navigation')).toBeVisible();
});

test('theme toggle flips data-theme and survives reload', async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/id');
  await page.getByRole('button', {name: /terang/i}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
