import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';

export default async function AboutPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'about'});

  return (
    <main className="mx-auto max-w-4xl px-6 py-20 lg:px-12">
      <h1 className="font-display text-5xl text-fg">{t('title')}</h1>
      <div className="mt-10 space-y-6 text-lg leading-8 text-fg-muted">
        <p>{t('body1')}</p>
        <p>{t('body2')}</p>
        <p>{t('body3')}</p>
      </div>
    </main>
  );
}
