import Link from 'next/link';
import {themeInitScript, DEFAULT_THEME} from '@/lib/theme';
import {AdminThemeToggle} from '@/components/admin/admin-theme-toggle';
import {bodyFont, jetbrainsMono} from '../fonts';
import '../globals.css';

export const metadata = {
  title: 'Admin',
  robots: {index: false, follow: false}
};

const NAV_ITEMS = [
  {href: '/admin/career', label: 'Karier'},
  {href: '/admin/education', label: 'Pendidikan'},
  {href: '/admin/achievements', label: 'Pencapaian'},
  {href: '/admin/trash', label: 'Sampah'}
];

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="id"
      data-theme={DEFAULT_THEME}
      className={`${bodyFont.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-fg">
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
        <div className="mx-auto max-w-[960px] px-6 py-8">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="grid size-9 place-content-center rounded-[10px] border border-accent/40 bg-surface font-display text-sm font-semibold lowercase text-accent"
              >
                fa.
              </Link>
              <div>
                <p className="font-display text-sm font-semibold leading-tight text-fg">Ruang Kerja</p>
                <p className="text-xs text-fg-muted">Admin</p>
              </div>
            </div>
            <nav aria-label="Navigasi admin" className="flex flex-wrap items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="min-h-9 rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface hover:text-fg"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <AdminThemeToggle />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
