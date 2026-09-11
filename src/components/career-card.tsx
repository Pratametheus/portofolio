import {useTranslations} from 'next-intl';
import type {ReactNode} from 'react';
import type {CareerEntry} from '@/content/career';

export function CareerCard({entry}: {entry: CareerEntry}) {
  const t = useTranslations();

  return (
    <article className="flex gap-4 rounded-2xl border border-border bg-surface p-6">
      <div
        className="grid size-12 shrink-0 place-items-center rounded-lg border border-border bg-bg text-sm font-bold text-accent"
        aria-hidden="true"
      >
        {entry.mark}
      </div>
      <div>
        <h3 className="font-display text-[17px] text-fg">{entry.role}</h3>
        <p className="mt-1.5 text-sm text-fg-muted">{entry.organization}</p>
        <small className="mt-1.5 block text-xs text-fg-muted">
          {`${entry.period} · ${entry.category}`}
        </small>
        <details className="mt-4">
          <summary className="inline-flex min-h-11 items-center cursor-pointer text-xs text-fg-muted transition-colors hover:text-accent">
            {t('about.career.detailSummary')}
          </summary>
          <p className="mt-3 text-sm leading-7 text-fg-muted">{entry.description}</p>
        </details>
      </div>
    </article>
  );
}

export function Timeline({entries, children}: {entries: CareerEntry[]; children?: ReactNode}) {
  if (entries.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {entries.map((e) => (
        <CareerCard key={e.role + e.organization} entry={e} />
      ))}
    </div>
  );
}
