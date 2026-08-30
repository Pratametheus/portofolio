import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';

export default async function LinksPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'links'});

  return (
    <main className="mx-auto max-w-4xl px-6 py-20 lg:px-12">
      <h1 className="font-display text-5xl text-fg">{t('title')}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-fg-muted">{t('intro')}</p>
      <ul className="mt-10 space-y-4">
        <li className="rounded-xl border border-border bg-surface p-6">
          <a
            href={t('githubUrl')}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-xl text-fg transition-colors hover:text-accent"
          >
            {t('githubLabel')}
          </a>
          <p className="mt-2 leading-7 text-fg-muted">{t('githubDescription')}</p>
        </li>
        <li className="rounded-xl border border-border bg-surface p-6">
          <a
            href={t('journalUrl')}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-xl text-fg transition-colors hover:text-accent"
          >
            {t('journalLabel')}
          </a>
          <p className="mt-2 leading-7 text-fg-muted">{t('journalDescription')}</p>
        </li>
        <li className="rounded-xl border border-border bg-surface p-6">
          <a
            href={t('siakadUrl')}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-xl text-fg transition-colors hover:text-accent"
          >
            {t('siakadLabel')}
          </a>
          <p className="mt-2 leading-7 text-fg-muted">{t('siakadDescription')}</p>
        </li>
      </ul>
    </main>
  );
}
