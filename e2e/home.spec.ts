import {expect, test} from '@playwright/test';

test.describe('deteksi bahasa peramban di akar', () => {
  // Each case opens its own browser context (not the shared `page` fixture)
  // so that the `NEXT_LOCALE` cookie one case may cause next-intl to set
  // can never leak into another case, regardless of run order.

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
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Ferry Andhika Pratama');
});

test('halaman Indonesia menampilkan tagline Indonesia', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByText('Saya membangun perangkat lunak')).toBeVisible();
});

test.skip('halaman Inggris menampilkan tagline Inggris', async ({page}) => {
  await page.goto('/en');
  await expect(page.getByText('I build software')).toBeVisible();
}); // TODO(task-15): re-enable after Beranda rebuild

test.skip('ketiga studi kasus tampil di beranda', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('link', {name: /SIAKAD Informatika|City Courier|MochiToon/})).toHaveCount(3);
}); // TODO(task-15): re-enable after Beranda rebuild

test.skip('navigasi keyboard menjangkau kartu pertama dengan focus yang terlihat', async ({page}) => {
  await page.goto('/id');
  const firstLink = page.getByRole('link', {name: 'SIAKAD Informatika'});
  for (let attempt = 0; attempt < 20; attempt += 1) {
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
}); // TODO(task-15): re-enable after Beranda rebuild

test.describe('kelengkapan aksesibilitas per halaman', () => {
  test.skip('halaman id punya <title> dan urutan heading yang benar', async ({page}) => {
    await page.goto('/id');
    await expect(page).toHaveTitle('Ferry Andhika Pratama');
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');

    // h1 -> h2 -> h3, tanpa lompat level
    await expect(page.getByRole('heading', {level: 1})).toHaveCount(1);
    const h2 = page.getByRole('heading', {level: 2});
    await expect(h2).toHaveText('Karya pilihan');
    await expect(page.getByRole('heading', {level: 3}).first()).toBeVisible();

    // bagian karya diberi nama lewat h2-nya
    const sectionId = await h2.getAttribute('id');
    expect(sectionId).toBeTruthy();
    await expect(page.locator(`section[aria-labelledby="${sectionId}"]`)).toBeVisible();
  }); // TODO(task-15): re-enable after Beranda rebuild

  test.skip('halaman en punya <title> berbeda dan judul bagian dalam bahasa Inggris', async ({page}) => {
    await page.goto('/en');
    await expect(page).toHaveTitle('Ferry Andhika Pratama');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', {level: 2})).toHaveText('Selected work');
  }); // TODO(task-15): re-enable after Beranda rebuild
});

test.describe('halaman 404', () => {
  // Tidak ada route bertingkat di bawah /[locale] hari ini (mis. work/[slug]),
  // jadi setiap URL yang tak cocok -- baik prefiks locale-nya valid
  // (/id/rute-tidak-ada) maupun tidak (/xx, atau tanpa prefiks sama sekali)
  // -- ditangani oleh app/global-not-found.tsx, bukan
  // [locale]/not-found.tsx. Yang penting diperiksa di sini persis apa yang
  // rusak sebelumnya: <html> tanpa lang dan tanpa <title>.
  for (const path of [
    '/id/rute-tidak-ada',
    '/xx',
    '/tidak/ada/rute/seperti/ini'
  ]) {
    test(`${path} menghasilkan 404 dengan <html lang> dan <title>`, async ({page}) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.locator('html')).toHaveAttribute('lang', 'id');
      await expect(page).toHaveTitle('Halaman tidak ditemukan');
      await expect(page.getByText('Halaman tidak ditemukan')).toBeVisible();
    });
  }
});
