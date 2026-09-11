import {useTranslations} from 'next-intl';
import type {Achievement} from '@/content/achievements';
import {PublicationCover} from './publication-cover';
import {RecordTags} from './record-tags';
import {ACHIEVEMENT_TYPE_LABEL_KEY, ACHIEVEMENT_CATEGORY_LABEL_KEY} from '@/lib/taxonomy-labels';

/**
 * A single achievement record: static JUTIF cover, title, issuer, a row of
 * tags, the publication year with an optional DOI link, and a collapsed
 * `<details>` for the longer description. Server-safe — `useTranslations` is
 * isomorphic.
 */
export function AchievementCard({item}: {item: Achievement}) {
  const t = useTranslations();

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <PublicationCover size="grid" />
      <div className="p-5">
        <h3 className="font-display text-[17px] leading-6 text-fg">{item.title}</h3>
        <p className="mt-2.5 text-sm text-fg-muted">{item.issuer}</p>
        <RecordTags
          tags={[
            t(ACHIEVEMENT_TYPE_LABEL_KEY[item.type]),
            t(ACHIEVEMENT_CATEGORY_LABEL_KEY[item.category]),
            'SINTA 2'
          ]}
        />
        <div className="mt-4 flex justify-between border-y border-border py-3 text-[11px] text-fg-muted">
          <span>{item.year}</span>
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent"
            >
              DOI ↗
            </a>
          ) : null}
        </div>
        <details className="mt-3">
          <summary className="inline-flex min-h-11 items-center cursor-pointer text-xs text-fg-muted transition-colors hover:text-accent">
            {t('achievements.detailSummary')}
          </summary>
          <p className="mt-2 text-sm leading-7 text-fg-muted">
            {item.description}
          </p>
        </details>
      </div>
    </article>
  );
}
