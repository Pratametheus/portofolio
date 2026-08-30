import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['id', 'en'],
  defaultLocale: 'id',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/tentang': {id: '/tentang', en: '/about'},
    '/karya': {id: '/karya', en: '/work'},
    '/karya/[slug]': {id: '/karya/[slug]', en: '/work/[slug]'},
    '/riset': {id: '/riset', en: '/research'},
    '/pencapaian': {id: '/pencapaian', en: '/achievements'},
    '/buku-tamu': {id: '/buku-tamu', en: '/guestbook'},
    '/kontak': {id: '/kontak', en: '/contact'},
    '/links': {id: '/links', en: '/links'}
  }
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
export type NavPathname = Exclude<AppPathname, '/karya/[slug]'>;
