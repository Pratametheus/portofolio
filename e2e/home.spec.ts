import {expect, test} from '@playwright/test';

test.describe('deteksi bahasa peramban di akar', () => {
  test('peramban berbahasa Indonesia dialihkan ke /id', async ({browser}) => {
    const context = await browser.newContext({locale: 'id-ID'});
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/id$/);
    await context.close();
  });

  test('peramban berbahasa Inggris dialihkan ke /en', async ({browser}) => {
    const context = await browser.newContext({locale: 'en-US'});
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await context.close();
  });

  test('peramban berbahasa yang tidak didukung jatuh ke /id', async ({browser}) => {
    const context = await browser.newContext({locale: 'ja-JP'});
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/id$/);
    await context.close();
  });
});

test('judul utama terlihat', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('heading', {level: 1})).toContainText('Halo, saya Ferry');
});

test('halaman Indonesia menampilkan intro Indonesia', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByText('Saya membangun perangkat lunak untuk pekerjaan yang saya jalani sendiri.', {exact: false})).toBeVisible();
});

test('halaman Inggris menampilkan intro Inggris', async ({page}) => {
  await page.goto('/en');
  await expect(page.getByText('I build software for the work I do myself', {exact: false})).toBeVisible();
});

test('dua karya pilihan tampil di beranda, dengan tautan ke semua karya', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('link', {name: 'SIAKAD Informatika', exact: true})).toBeVisible();
  await expect(page.getByRole('link', {name: 'City Courier', exact: true})).toBeVisible();
  await expect(page.getByRole('link', {name: /Semua karya/})).toHaveAttribute('href', '/id/karya');
});

test('keahlian berfilter tampil di beranda', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('group', {name: /Filter kategori keahlian/})).toBeVisible();
});

test('navigasi keyboard menjangkau kartu pertama dengan focus yang terlihat', async ({page}) => {
  await page.goto('/id');
  const firstLink = page.getByRole('link', {name: 'SIAKAD Informatika', exact: true});
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await page.keyboard.press('Tab');
    if (await firstLink.evaluate((element) => document.activeElement === element)) break;
  }
  await expect(firstLink).toBeFocused();

  const outline = await firstLink.evaluate((el) => {
    const style = getComputedStyle(el);
    return {outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth};
  });
  expect(outline.outlineStyle).not.toBe('none');
  expect(parseFloat(outline.outlineWidth)).toBeGreaterThan(0);
});

test.describe('kelengkapan aksesibilitas per halaman', () => {
  test('halaman id punya <title> dan urutan heading yang benar', async ({page}) => {
    await page.goto('/id');
    await expect(page).toHaveTitle('Ferry Andhika Pratama');
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');

    await expect(page.getByRole('heading', {level: 1})).toHaveCount(1);
    const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) =>
      headings.map((heading) => Number(heading.tagName.slice(1)))
    );
    expect(levels[0]).toBe(1);
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1);
    }
    await expect(page.getByRole('heading', {level: 2, name: 'Karya terpilih'})).toBeVisible();
  });

  test('halaman en punya <title> dan judul bagian dalam bahasa Inggris', async ({page}) => {
    await page.goto('/en');
    await expect(page).toHaveTitle('Ferry Andhika Pratama');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', {level: 2, name: 'Selected work'})).toBeVisible();
  });
});

test.describe('halaman 404', () => {
  for (const path of ['/id/rute-tidak-ada', '/xx', '/tidak/ada/rute/seperti/ini']) {
    test(`${path} menghasilkan 404 dengan <html lang> dan <title>`, async ({page}) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.locator('html')).toHaveAttribute('lang', 'id');
      await expect(page).toHaveTitle('Halaman tidak ditemukan');
      await expect(page.getByText('Halaman tidak ditemukan')).toBeVisible();
    });
  }
});
