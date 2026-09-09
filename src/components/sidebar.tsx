'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import LocaleSwitcher from './locale-switcher';
import Nav from './nav';
import ThemeToggle from './theme-toggle';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const drawer = drawerRef.current;
    const focusable = Array.from(drawer?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    focusable[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab' || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function closeDrawer() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <header className="relative z-50 lg:sticky lg:top-8 lg:h-[calc(100dvh-64px)]">
      <div className="flex min-h-16 items-center justify-between border-b border-border px-6 lg:hidden">
        <Link href="/" aria-label={t('nav.home')} className="font-display text-xl font-semibold tracking-tight text-fg">
          ferry<span className="text-accent">.</span>
        </Link>
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls="sidebar-drawer"
          aria-label="Buka menu"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex min-h-11 items-center gap-3 rounded-full border border-border px-5 text-sm text-fg transition-colors hover:bg-surface"
        >
          Menu
          <span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
      </div>

      {open ? (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={closeDrawer}
          className="fixed inset-0 top-20 z-40 bg-bg/70 backdrop-blur-sm"
        />
      ) : null}

      <div
        ref={drawerRef}
        id="sidebar-drawer"
        aria-label="Menu"
        className={`${open ? 'flex' : 'hidden'} absolute right-4 top-20 z-50 max-h-[calc(100dvh-96px)] w-[min(440px,calc(100vw-32px))] flex-col overflow-y-auto rounded-2xl border border-border bg-bg p-6 shadow-xl lg:static lg:flex lg:max-h-full lg:w-auto lg:rounded-none lg:border-0 lg:p-0 lg:shadow-none`}
      >
        <div className="mb-6 flex flex-col items-start gap-4 pt-3">
          <div className="grid size-16 place-items-center rounded-full border border-accent/40 bg-accent-dim text-xl font-semibold text-accent">
            FA
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-fg">Ferry Andhika Pratama</p>
            <p className="mt-1 text-sm leading-5 text-fg-muted">{t('sidebar.role')}</p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-2">
          <ThemeToggle />
          <LocaleSwitcher />
        </div>

        <Nav />

        <footer className="mt-8 border-t border-border pt-4 text-xs text-fg-muted">
          © 2026 Ferry Andhika Pratama
        </footer>
      </div>
    </header>
  );
}
