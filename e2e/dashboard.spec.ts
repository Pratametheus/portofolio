import {expect, test} from '@playwright/test';

for (const {route, title, unavailable, disconnected, workPrefix} of [
  {route: '/id/dasbor', title: 'Dasbor', unavailable: 'Belum tersedia', disconnected: 'Belum terhubung', workPrefix: '/id/karya'},
  {route: '/en/dashboard', title: 'Dashboard', unavailable: 'Not available', disconnected: 'Not connected', workPrefix: '/en/work'}
]) {
  test(`${route} shows unavailable statistics and real localised work links`, async ({page}) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', {level: 1})).toHaveText(title);
    await expect(main.getByRole('heading', {level: 1})).toHaveCount(1);
    for (const provider of ['GitHub', 'WakaTime', 'Monkeytype']) {
      await expect(main.getByRole('heading', {level: 2, name: provider, exact: true})).toBeVisible();
    }
    const values = main.locator(`strong[aria-label="${unavailable}"]`);
    await expect(values).toHaveCount(9);
    expect(await values.allTextContents()).toEqual(Array(9).fill('—'));
    await expect(main.getByText(disconnected, {exact: true})).toHaveCount(9);
    for (const slug of ['siakad-informatika', 'city-courier', 'mochitoon']) {
      await expect(main.locator(`a[href="${workPrefix}/${slug}"]`)).toHaveCount(1);
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://ferryandhikapratama.com${route}`);
  });
}

test('dashboard navigation and locale switching retain the current page', async ({page}) => {
  await page.goto('/id');
  const menu = page.getByRole('button', {name: /menu/i});
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('navigation').getByRole('link', {name: 'Dasbor', exact: true}).click();
  await expect(page).toHaveURL(/\/id\/dasbor$/);
  if (await menu.isVisible()) await menu.click();
  await expect(page.getByRole('navigation').getByRole('link', {name: 'Dasbor', exact: true})).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', {name: 'EN', exact: true}).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);
  await expect(page.getByRole('main').getByRole('heading', {level: 1})).toHaveText('Dashboard');
});
