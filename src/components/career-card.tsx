import {useTranslations} from 'next-intl';
import type {ReactNode} from 'react';
import type {CareerEntry} from '@/lib/repositories/career';

export function CareerCard({entry}: {entry: CareerEntry}) {
  const t = useTranslations();

  return (
    <article className="flex gap-4 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex shrink-0 items-start gap-2 pt-0.5">
        {entry.logoUrl ? (
          <img
            src={entry.logoUrl}
            alt=""
            aria-hidden="true"
            className="size-11 rounded-lg border border-border object-cover"
          />
        ) : null}
        <div
          className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-bg font-mono text-xs font-semibold text-accent"
          aria-hidden="true"
        >
          {entry.mark}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-semibold text-fg sm:text-lg">{entry.role}</h3>
        <p className="mt-1 text-sm text-fg-muted">{entry.organization}</p>
        <span className="mt-1 block font-mono text-xs text-fg-muted">
          {`${entry.period} · ${entry.category}`}
        </span>
        <details className="mt-3">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-xs font-medium text-fg-muted transition-colors hover:text-accent">
            {t('about.career.detailSummary')}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{entry.description}</p>
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
