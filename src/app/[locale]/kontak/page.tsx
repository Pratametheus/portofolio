import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ContactRow} from '@/components/contact-row';
import {routing} from '@/i18n/routing';

export default async function ContactPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'contact'});

  return (
    <main className="mx-auto max-w-4xl px-6 py-20 lg:px-12">
      <h1 className="font-display text-5xl text-fg">{t('title')}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-fg-muted">{t('intro')}</p>
      <div className="mt-10 rounded-xl border border-border bg-surface px-6">
        <ContactRow label={t('emailLabel')} value={t('emailValue')} />
        <ContactRow
          label={t('githubLabel')}
          value={t('githubValue')}
          href="https://github.com/Pratametheus"
        />
      </div>
      <p className="mt-6 font-mono text-sm text-accent">{t('availability')}</p>
    </main>
  );
}
