import {expect, test} from '@playwright/test';

for (const route of ['/id/riset', '/id/pencapaian', '/id/kontak', '/id/links', '/id/buku-tamu']) {
  test(`${route} uses sequential heading levels`, async ({page}) => {
    await page.goto(route);
    const levels = await page.locator('main h1, main h2, main h3').evaluateAll((headings) =>
      headings.map((heading) => Number(heading.tagName.slice(1)))
    );
    expect(levels[0]).toBe(1);
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index]).toBeLessThanOrEqual(levels[index - 1] + 1);
    }
  });
}

test('achievement search filters the real publication and reset restores it', async ({page}) => {
  await page.goto('/id/pencapaian');

  await expect(page.getByRole('status')).toHaveText('Total: 1');
  await page.getByRole('searchbox', {name: 'Cari pencapaian'}).fill('tidak ada');
  await expect(page.getByRole('heading', {name: 'Tidak ada hasil yang cocok'})).toBeVisible();
  await page.getByRole('button', {name: 'Hapus filter'}).click();
  await expect(page.getByRole('status')).toHaveText('Total: 1');
  await expect(page.getByRole('heading', {name: /Analisis Kerentanan Keamanan/})).toBeVisible();
});

test('contact copies a draft without submitting a request', async ({page}) => {
  const requests: string[] = [];
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText: (value: string) => (window as unknown as {copied: string}).copied = value}
    });
  });
  await page.goto('/id/kontak');
  page.on('request', (request) => {
    if (request.method() !== 'GET') requests.push(request.url());
  });
  await page.getByLabel('Nama').fill('Rin');
  await page.getByLabel('Email').fill('rin@example.com');
  await page.getByLabel('Pesan').fill('Halo');
  await page.getByRole('button', {name: 'Salin draf pesan'}).click();

  await expect(page.getByRole('status')).toHaveText('Draf disalin. Belum ada pesan yang dikirim.');
  expect(await page.evaluate(() => (window as unknown as {copied: string}).copied)).toBe(
    'Dari: Rin <rin@example.com>\n\nHalo'
  );
  expect(requests).toEqual([]);
});

test('contact explains clipboard failure without submitting a request', async ({page}) => {
  const requests: string[] = [];
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText: () => Promise.reject(new Error('blocked'))}
    });
  });
  await page.goto('/en/contact');
  page.on('request', (request) => {
    if (request.method() !== 'GET') requests.push(request.url());
  });
  await page.getByLabel('Name').fill('Rin');
  await page.getByLabel('Email').fill('rin@example.com');
  await page.getByLabel('Message').fill('Hello');
  await page.getByRole('button', {name: 'Copy message draft'}).click();

  await expect(page.getByRole('status')).toHaveText(
    'Clipboard blocked by the browser. Copy the message manually.'
  );
  expect(requests).toEqual([]);
});

test('research list opens its story on-page and links to the localized related project', async ({page}) => {
  await page.goto('/en/research');

  await expect(page.getByText('1 publication', {exact: true})).toBeVisible();
  const storyLink = page.getByRole('link', {name: /See the research/});
  await expect(storyLink).toHaveAttribute('href', '#paper-story');
  await storyLink.click();
  await expect(page).toHaveURL(/\/en\/research#paper-story$/);
  await expect(page.getByRole('heading', {level: 2, name: 'Research focus'})).toBeVisible();
  await expect(page.getByRole('link', {name: /City Courier/})).toHaveAttribute(
    'href',
    '/en/work/city-courier'
  );
});
