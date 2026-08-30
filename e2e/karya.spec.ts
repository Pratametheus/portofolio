import {test, expect} from '@playwright/test';

test('all three case studies are reachable from the list', async ({page}) => {
  await page.goto('/id/karya');
  for (const name of ['SIAKAD Informatika', 'City Courier', 'MochiToon']) {
    await expect(page.getByRole('link', {name})).toBeVisible();
  }
  await page.getByRole('link', {name: 'City Courier'}).click();
  await expect(page).toHaveURL(/\/id\/karya\/city-courier$/);
  await expect(page.getByRole('heading', {level: 1, name: /City Courier/})).toBeVisible();
});

test('english list localises to /en/work', async ({page}) => {
  await page.goto('/en/work');
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
});
