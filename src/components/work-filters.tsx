'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {WorkCard} from '@/components/work-card';
import {DataEmpty} from '@/components/data-empty';
import {WORK_TYPE_LABEL_KEY, WORK_TOPIC_LABEL_KEY} from '@/lib/taxonomy-labels';
import type {CaseStudy, Locale} from '@/content/types';

const TYPE_OPTIONS = ['Semua', 'Web', 'Mobile'] as const;
const TOPIC_OPTIONS = ['Semua', 'Pendidikan', 'Keamanan', 'Penulisan'] as const;

type TypeFilter = (typeof TYPE_OPTIONS)[number];
type TopicFilter = (typeof TOPIC_OPTIONS)[number];

const PILL_BASE = 'min-h-11 rounded-full border px-4 py-1.5 text-xs';

function FilterRow<T extends string>({
  label,
  options,
  labelFor,
  value,
  onChange
}: {
  label: string;
  options: readonly T[];
  labelFor: (option: T) => string;
  value: T;
  onChange: (option: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="mb-3 flex flex-wrap items-center gap-2">
      <span className="w-16 text-xs text-fg-muted">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          aria-pressed={value === opt}
          onClick={() => onChange(opt)}
          className={`${PILL_BASE} ${
            value === opt
              ? 'bg-accent text-on-accent border-accent'
              : 'border-border text-fg-muted'
          }`}
        >
          {labelFor(opt)}
        </button>
      ))}
    </div>
  );
}

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
      <FilterRow
        label={t('work.filters.typeLabel')}
        options={TYPE_OPTIONS}
        labelFor={(opt) => t(WORK_TYPE_LABEL_KEY[opt])}
        value={type}
        onChange={setType}
      />
      <FilterRow
        label={t('work.filters.categoryLabel')}
        options={TOPIC_OPTIONS}
        labelFor={(opt) => t(WORK_TOPIC_LABEL_KEY[opt])}
        value={topic}
        onChange={setTopic}
      />

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
