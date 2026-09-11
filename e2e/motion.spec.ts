import {test, expect} from '@playwright/test';

test('hero copy is visible on load without scrolling', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  await expect(page.getByText('Saya membangun perangkat lunak', {exact: false}).first()).toBeVisible();
});

test('research story preserves the ten-scenario evidence', async ({page}) => {
  await page.goto('/id/riset');
  await expect(page.getByText(/Sepuluh skenario pengujian/).first()).toBeVisible();
});

test('selected-work cards are all present and linked', async ({page}) => {
  await page.goto('/id');
  for (const name of ['SIAKAD Informatika', 'City Courier']) {
    await expect(page.getByRole('link', {name, exact: true})).toBeVisible();
  }
});
