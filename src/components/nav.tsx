'use client';

import {useTranslations} from 'next-intl';
import {usePathname} from '@/i18n/navigation';
import type {NavPathname} from '@/i18n/routing';
import {NavItem} from './nav-item';

export const NAV_ITEMS: ReadonlyArray<{href: NavPathname; key: string}> = [
  {href: '/', key: 'home'},
  {href: '/tentang', key: 'about'},
  {href: '/karya', key: 'work'},
  {href: '/riset', key: 'research'},
  {href: '/pencapaian', key: 'achievements'},
  {href: '/buku-tamu', key: 'guestbook'},
  {href: '/kontak', key: 'contact'},
  {href: '/links', key: 'links'}
];

export default function Nav() {
  const pathname = usePathname();
  const t = useTranslations('nav') as unknown as ((key: string) => string) & {
    has?: (key: string) => boolean;
  };

  return (
    <nav aria-label="Navigasi utama">
      <ul className="space-y-1">
        {NAV_ITEMS.map(({href, key}, index) => {
          const active = href === '/' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href}>
              <NavItem
                href={href}
                index={String(index + 1).padStart(2, '0')}
                label={!t.has || t.has(key) ? t(key) : key}
                active={active}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
