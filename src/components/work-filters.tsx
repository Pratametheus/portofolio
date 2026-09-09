'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {WorkCard} from '@/components/work-card';
import {DataEmpty} from '@/components/data-empty';
import type {CaseStudy, Locale} from '@/content/types';

const TYPE_OPTIONS = ['Semua', 'Web', 'Mobile'] as const;
const TOPIC_OPTIONS = ['Semua', 'Pendidikan', 'Keamanan', 'Penulisan'] as const;

type TypeFilter = (typeof TYPE_OPTIONS)[number];
type TopicFilter = (typeof TOPIC_OPTIONS)[number];

const TYPE_LABEL_KEY = {
  Semua: 'work.filters.type.semua',
  Web: 'work.filters.type.web',
  Mobile: 'work.filters.type.mobile'
} as const;

const TOPIC_LABEL_KEY = {
  Semua: 'work.filters.category.semua',
  Pendidikan: 'work.filters.category.pendidikan',
  Keamanan: 'work.filters.category.keamanan',
  Penulisan: 'work.filters.category.penulisan'
} as const;

const PILL_BASE = 'min-h-11 rounded-full border px-4 py-1.5 text-xs';

export function WorkFilters({
  caseStudies,
  locale
}: {
  caseStudies: CaseStudy[];
  locale: Locale;
}) {
  const t = useTranslations();
  const [type, setType] = useState<TypeFilter>('Semua');
  const [topic, setTopic] = useState<TopicFilter>('Semua');

  const filtered = caseStudies.filter(
    (c) =>
      (type === 'Semua' || c.type === type) &&
      (topic === 'Semua' || c.topic === topic)
  );

  return (
    <div>
      <div
        role="group"
        aria-label={t('work.filters.typeLabel')}
        className="mb-3 flex flex-wrap items-center gap-2"
      >
        <span className="w-16 text-xs text-fg-muted">{t('work.filters.typeLabel')}</span>
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            aria-pressed={type === opt}
            onClick={() => setType(opt)}
            className={`${PILL_BASE} ${
              type === opt
                ? 'bg-accent text-on-accent border-accent'
                : 'border-border text-fg-muted'
            }`}
          >
            {t(TYPE_LABEL_KEY[opt])}
          </button>
        ))}
      </div>
      <div
        role="group"
        aria-label={t('work.filters.categoryLabel')}
        className="mb-3 flex flex-wrap items-center gap-2"
      >
        <span className="w-16 text-xs text-fg-muted">{t('work.filters.categoryLabel')}</span>
        {TOPIC_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            aria-pressed={topic === opt}
            onClick={() => setTopic(opt)}
            className={`${PILL_BASE} ${
              topic === opt
                ? 'bg-accent text-on-accent border-accent'
                : 'border-border text-fg-muted'
            }`}
          >
            {t(TOPIC_LABEL_KEY[opt])}
          </button>
        ))}
      </div>

      <p role="status" className="my-4 text-sm text-fg-muted">
        {t('work.count', {n: filtered.length})}
      </p>

      {filtered.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2">
          {filtered.map((c) => (
            <li key={c.slug}>
              <WorkCard caseStudy={c} locale={locale} />
            </li>
          ))}
        </ul>
      ) : (
        <DataEmpty
          icon="work"
          title={t('work.empty.title')}
          description={t('work.empty.body')}
        />
      )}
    </div>
  );
}
