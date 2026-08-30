import type {Locale} from './routing';

/**
 * Builds a locale-prefixed path (e.g. `/id/work/siakad-informatika`).
 *
 * `next-intl`'s `Link` from `@/i18n/navigation` depends on `next/navigation`
 * client hooks, which can't be exercised in a plain jsdom render without
 * wiring the full App Router + `NextIntlClientProvider` stack. Presentational
 * components that need a locale-prefixed `href` (e.g. for a plain `<a>`)
 * should build it with this helper instead of hand-rolling the prefix
 * themselves, so the routing knowledge stays in one place.
 */
export function localizedPath(locale: Locale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized}`;
}
