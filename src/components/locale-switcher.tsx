'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export default function LocaleSwitcher() {
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div role="group" aria-label="Bahasa" className="inline-flex rounded-lg border border-border p-0.5">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          aria-pressed={locale === active}
          onClick={() => router.replace(pathname as Parameters<typeof router.replace>[0], {locale})}
          className="min-h-6 rounded-md px-2 py-1 font-mono text-xs uppercase text-fg-muted transition-colors aria-pressed:bg-surface-2 aria-pressed:text-fg"
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
