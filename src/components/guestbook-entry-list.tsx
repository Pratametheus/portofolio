import {useTranslations} from 'next-intl';
import type {GuestbookEntry} from '@/lib/repositories/guestbook';
import {DataEmpty} from '@/components/data-empty';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(isoString: string, locale: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return isoString;
  }
}

export function GuestbookEntryList({
  entries,
  locale
}: {
  entries: GuestbookEntry[];
  locale: string;
}) {
  const t = useTranslations('guestbook');

  if (entries.length === 0) {
    return (
      <DataEmpty
        icon="guestbook"
        title={t('emptyTitle')}
        description={t('empty')}
        headingLevel={2}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-wider text-fg-muted">{t('count', {n: entries.length})}</h2>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
          >
            <div className="flex items-start gap-3.5">
              <div
                aria-hidden="true"
                className="grid size-9 shrink-0 place-content-center rounded-lg border border-border bg-bg font-mono text-xs font-semibold text-accent"
              >
                {getInitials(entry.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-semibold text-fg">
                      {entry.name}
                    </span>
                    {entry.website ? (
                      <a
                        href={entry.website}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-xs text-accent transition-colors hover:text-fg"
                        title={t('form.websiteVisit')}
                      >
                        ↗
                      </a>
                    ) : null}
                  </div>
                  <time className="font-mono text-xs text-fg-muted">
                    {formatDate(entry.createdAt, locale)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-fg-muted">
                  {entry.message}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
