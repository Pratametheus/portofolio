import {describe, expect, it} from 'vitest';
import {routing} from '@/i18n/routing';

describe('routing locale', () => {
  it('mendukung bahasa Indonesia dan Inggris', () => {
    expect(routing.locales).toEqual(['id', 'en']);
  });

  it('memakai bahasa Indonesia sebagai bawaan', () => {
    expect(routing.defaultLocale).toBe('id');
  });

  it('selalu menampilkan prefiks locale di URL', () => {
    expect(routing.localePrefix).toBe('always');
  });
});

describe('localised pathnames', () => {
  it('maps every nav route for both locales', () => {
    const p = routing.pathnames as unknown as Record<string, {id: string; en: string}>;
    expect(p['/tentang']).toEqual({id: '/tentang', en: '/about'});
    expect(p['/karya']).toEqual({id: '/karya', en: '/work'});
    expect(p['/karya/[slug]']).toEqual({id: '/karya/[slug]', en: '/work/[slug]'});
    expect(p['/riset']).toEqual({id: '/riset', en: '/research'});
    expect(p['/pencapaian']).toEqual({id: '/pencapaian', en: '/achievements'});
    expect(p['/buku-tamu']).toEqual({id: '/buku-tamu', en: '/guestbook'});
    expect(p['/kontak']).toEqual({id: '/kontak', en: '/contact'});
    expect(p['/links']).toEqual({id: '/links', en: '/links'});
  });
});
