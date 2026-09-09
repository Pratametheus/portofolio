'use client';

import {useTranslations} from 'next-intl';
import {usePathname} from '@/i18n/navigation';
import type {NavPathname} from '@/i18n/routing';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';
import {NavIndicatorGroup} from '@/components/motion/nav-indicator';
import {NavItem} from './nav-item';

type NavKey = 'home' | 'about' | 'work' | 'research' | 'achievements' | 'guestbook' | 'contact' | 'links';

const WORK_COUNT = getAllCaseStudies(routing.defaultLocale).length;

export const NAV_ITEMS: ReadonlyArray<{href: NavPathname; key: NavKey}> = [
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
  const t = useTranslations('nav');

  return (
    <nav aria-label="Navigasi utama">
      <NavIndicatorGroup>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({href, key}, index) => {
            const active = href === '/' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={href}>
                <NavItem
                  href={href}
                  index={String(index + 1).padStart(2, '0')}
                  label={t(key)}
                  icon={key}
                  count={key === 'work' ? WORK_COUNT : undefined}
                  active={active}
                />
              </li>
            );
          })}
        </ul>
      </NavIndicatorGroup>
    </nav>
  );
}
