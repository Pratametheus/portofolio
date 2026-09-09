'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {usePathname} from '@/i18n/navigation';
import LocaleSwitcher from './locale-switcher';
import Nav from './nav';
import ThemeToggle from './theme-toggle';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
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
    <div className="lg:w-[280px]">
      <div className="flex min-h-14 items-center border-b border-border bg-surface px-4 lg:hidden">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls="sidebar-drawer"
          aria-label="Buka menu"
          onClick={() => setOpen((current) => !current)}
          className="min-h-11 rounded-lg px-3 font-mono text-sm text-fg"
        >
          Menu
        </button>
      </div>

      {open ? (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={closeDrawer}
          className="fixed inset-0 z-40 bg-bg/70 lg:hidden"
        />
      ) : null}

      <aside
        ref={drawerRef}
        id="sidebar-drawer"
        aria-label="Sidebar"
        className={`${open ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-50 w-[280px] flex-col border-r border-border bg-surface p-6 lg:flex lg:w-[280px]`}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-accent text-sm font-semibold text-on-accent">
            FA
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-fg">Ferry Andhika Pratama</p>
            <p className="text-xs text-fg-muted">{t('sidebar.role')}</p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-2">
          <ThemeToggle />
          <LocaleSwitcher />
        </div>

        <Nav />

        <footer className="mt-auto border-t border-border pt-4 font-mono text-xs text-fg-muted">
          © 2026 Ferry Andhika Pratama
        </footer>
      </aside>
    </div>
  );
}
