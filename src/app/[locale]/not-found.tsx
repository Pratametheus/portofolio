import {getLocale, getTranslations} from 'next-intl/server';
import {Reveal} from '@/components/motion/reveal';
import {localizedPath} from '@/i18n/paths';

// Renders when `notFound()` is thrown from within an already-resolved
// `/[locale]/...` route (e.g. an unknown case study slug, once a
// `work/[slug]` route exists). It's a child of `[locale]/layout.tsx`, so it
// inherits that layout's `<html lang>` and design tokens — it only needs to
// render its own content.
//
// Today there's no nested dynamic route under `[locale]` yet, so this file
// has no live trigger: any unmatched URL (even one with a valid /id or /en
// prefix, like /id/nonsense) is a fully-unmatched route and is caught by
// `app/global-not-found.tsx` instead — see that file's comment. This one is
// forward-looking infrastructure, verified by inspection rather than by an
// e2e request today; add an e2e assertion once a route that calls
// `notFound()` exists.
export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations('notFound');

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <Reveal className="flex flex-col items-center">
        <p className="font-mono text-sm text-fg-muted">404</p>
        <h1 className="mt-4 font-display text-3xl text-fg">{t('title')}</h1>
        <p className="mt-4 text-fg-muted">{t('description')}</p>
        <a
          href={localizedPath(locale, '/')}
          className="mt-8 font-mono text-sm text-accent underline underline-offset-4 hover:no-underline"
        >
          {t('back')}
        </a>
      </Reveal>
    </main>
  );
}
