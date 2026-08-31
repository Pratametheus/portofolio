import {describe, expect, it} from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import manifest from '@/app/manifest';
import {pageMetadata} from '@/lib/page-metadata';

const HOST = 'https://ferryandhikapratama.com';

describe('sitemap', () => {
  const entries = sitemap();

  it('covers home, every nav route, and every case study', () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${HOST}/id`);
    expect(urls).toContain(`${HOST}/id/karya`);
    expect(urls).toContain(`${HOST}/id/tentang`);
    expect(urls).toContain(`${HOST}/id/riset`);
    expect(urls).toContain(`${HOST}/id/pencapaian`);
    expect(urls).toContain(`${HOST}/id/links`);
    expect(urls).toContain(`${HOST}/id/kontak`);
    expect(urls).toContain(`${HOST}/id/buku-tamu`);
    expect(urls).toContain(`${HOST}/id/karya/city-courier`);
    expect(entries).toHaveLength(8 + 3);
  });

  it('emits only absolute URLs on the canonical host, no duplicates', () => {
    const urls = entries.map((e) => e.url);
    for (const url of urls) expect(url.startsWith(`${HOST}/`)).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('carries id + en hreflang alternates for every entry', () => {
    for (const entry of entries) {
      expect(entry.alternates?.languages?.id).toMatch(/^https:\/\/ferryandhikapratama\.com\/id/);
      expect(entry.alternates?.languages?.en).toMatch(/^https:\/\/ferryandhikapratama\.com\/en/);
    }
  });

  it('localises the english alternate (/karya -> /work)', () => {
    const work = entries.find((e) => e.url === `${HOST}/id/karya`);
    expect(work?.alternates?.languages?.en).toBe(`${HOST}/en/work`);
  });
});

describe('robots', () => {
  const result = robots();

  it('allows every crawler', () => {
    expect(result.rules).toMatchObject({userAgent: '*', allow: '/'});
  });

  it('points at the sitemap', () => {
    expect(result.sitemap).toBe(`${HOST}/sitemap.xml`);
  });
});

describe('manifest', () => {
  const result = manifest();

  it('names the app and starts at the root in standalone mode', () => {
    expect(result.name).toBe('Ferry Andhika Pratama');
    expect(result.start_url).toBe('/');
    expect(result.display).toBe('standalone');
  });

  it('declares icons and a hex theme colour', () => {
    expect(result.icons?.length).toBeGreaterThan(0);
    expect(result.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe('pageMetadata', () => {
  it('builds a localised canonical and hreflang set', () => {
    const meta = pageMetadata({
      locale: 'en',
      href: '/tentang',
      title: 'About',
      description: 'x'
    });
    expect(meta.alternates?.canonical).toBe(`${HOST}/en/about`);
    expect(meta.alternates?.languages?.id).toBe(`${HOST}/id/tentang`);
    expect(meta.alternates?.languages?.en).toBe(`${HOST}/en/about`);
    expect(meta.alternates?.languages?.['x-default']).toBe(`${HOST}/id/tentang`);
  });

  it('carries matching Open Graph and Twitter blocks', () => {
    const meta = pageMetadata({
      locale: 'id',
      href: '/kontak',
      title: 'Kontak',
      description: 'desc'
    });
    expect(meta.openGraph?.title).toBe('Kontak');
    expect(meta.openGraph?.url).toBe(`${HOST}/id/kontak`);
    expect(meta.twitter?.title).toBe('Kontak');
    expect((meta.twitter as {card?: string}).card).toBe('summary_large_image');
  });

  it('falls back to the generated per-locale social card when no image is given', () => {
    const meta = pageMetadata({
      locale: 'id',
      href: '/kontak',
      title: 'Kontak',
      description: 'desc'
    });
    expect(meta.openGraph?.images).toEqual([`${HOST}/id/opengraph-image`]);
    expect(meta.twitter?.images).toEqual([`${HOST}/id/twitter-image`]);
  });

  it('resolves relative OG image paths against the site URL', () => {
    const meta = pageMetadata({
      locale: 'id',
      href: '/karya',
      title: 'x',
      description: 'y',
      images: ['/karya/city-courier.webp']
    });
    expect(meta.openGraph?.images).toEqual([`${HOST}/karya/city-courier.webp`]);
  });
});
