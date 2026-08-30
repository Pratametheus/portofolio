import {expect, test} from '@playwright/test';

const routes = [
  '/id/tentang',
  '/id/riset',
  '/id/pencapaian',
  '/id/buku-tamu',
  '/id/kontak',
  '/id/links',
  '/en/about',
  '/en/research',
  '/en/achievements',
  '/en/guestbook',
  '/en/contact',
  '/en/links'
];

for (const route of routes) {
  test(`${route} resolves with exactly one visible h1`, async ({page}) => {
    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', {level: 1})).toHaveCount(1);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  });
}

test('research page exposes ScholarlyArticle JSON-LD', async ({page}) => {
  await page.goto('/en/research');
  const schema = await page.locator('script[type="application/ld+json"]').textContent();

  expect(JSON.parse(schema ?? '{}')['@type']).toBe('ScholarlyArticle');
});

test('links page opens every external link safely', async ({page}) => {
  await page.goto('/id/links');
  const links = page.locator('main a[href^="http"]');

  await expect(links).toHaveCount(3);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
});
