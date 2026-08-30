import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';

export default async function AchievementsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'achievements'});

  return (
    <main className="mx-auto max-w-5xl px-6 py-20 lg:px-12">
      <h1 className="font-display text-5xl text-fg">{t('title')}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-fg-muted">{t('intro')}</p>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-xl text-fg">{t('publicationTitle')}</h2>
          <p className="mt-3 leading-7 text-fg-muted">{t('publicationBody')}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-xl text-fg">{t('teachingTitle')}</h2>
          <p className="mt-3 leading-7 text-fg-muted">{t('teachingBody')}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-xl text-fg">{t('productTitle')}</h2>
          <p className="mt-3 leading-7 text-fg-muted">{t('productBody')}</p>
        </article>
      </div>
    </main>
  );
}
