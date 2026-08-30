import {useTranslations} from 'next-intl';
import type {Locale} from '@/content/types';

const DOI_URL = 'https://doi.org/10.52436/1.jutif.2026.7.2.5662';

export function ResearchCard({locale}: {locale: Locale}) {
  const t = useTranslations('research.paper');

  return (
    <article lang={locale} className="rounded-xl border border-border bg-surface p-6">
      <h2 className="font-display text-xl text-fg">{t('title')}</h2>
      <p className="mt-3 font-mono text-xs leading-6 text-accent">{t('meta')}</p>
      <p className="mt-4 leading-7 text-fg-muted">{t('summary')}</p>
      <a
        href={DOI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block font-mono text-sm text-accent transition-colors hover:text-fg"
      >
        {t('doiLabel')}
      </a>
    </article>
  );
}
