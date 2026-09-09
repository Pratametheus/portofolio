'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import type {Achievement} from '@/content/achievements';
import {AchievementCard} from './achievement-card';
import {DataEmpty} from './data-empty';

// Explicit key maps — next-intl's typed `t()` rejects template-literal keys,
// so the option labels are resolved through `as const` lookups instead.
const TYPE_OPTION_KEY = {
  '': 'achievements.filters.type.semua',
  Publikasi: 'achievements.filters.type.publikasi',
  Sertifikat: 'achievements.filters.type.sertifikat'
} as const;

const CATEGORY_OPTION_KEY = {
  '': 'achievements.filters.category.semua',
  Keamanan: 'achievements.filters.category.keamanan',
  Pendidikan: 'achievements.filters.category.pendidikan',
  Pengembangan: 'achievements.filters.category.pengembangan'
} as const;

const FIELD_CLASS =
  'mt-1.5 min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg';

export function AchievementFilters({items}: {items: Achievement[]}) {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');

  const visible = items.filter(
    (a) =>
      (!type || a.type === type) &&
      (!category || a.category === category) &&
      `${a.title} ${a.issuer}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  );

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="grid gap-4 sm:grid-cols-3"
      >
        <label className="text-sm text-fg-muted">
          <span>{t('achievements.filters.searchLabel')}</span>
          <input
            type="search"
            name="search"
            aria-label={t('achievements.filters.searchLabel')}
            placeholder={t('achievements.filters.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${FIELD_CLASS} py-2`}
          />
        </label>
        <label className="text-sm text-fg-muted">
          <span>{t('achievements.filters.typeLabel')}</span>
          <select
            name="type"
            aria-label={t('achievements.filters.typeLabel')}
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={FIELD_CLASS}
          >
            {Object.entries(TYPE_OPTION_KEY).map(([value, key]) => (
              <option key={value} value={value}>
                {t(key)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-fg-muted">
          <span>{t('achievements.filters.categoryLabel')}</span>
          <select
            name="category"
            aria-label={t('achievements.filters.categoryLabel')}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={FIELD_CLASS}
          >
            {Object.entries(CATEGORY_OPTION_KEY).map(([value, key]) => (
              <option key={value} value={value}>
                {t(key)}
              </option>
            ))}
          </select>
        </label>
      </form>

      <p role="status" className="my-4 text-sm text-fg-muted">
        {t('achievements.total', {n: visible.length})}
      </p>

      {visible.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {visible.map((a, i) => (
            <AchievementCard key={a.title + i} item={a} />
          ))}
        </div>
      ) : (
        <DataEmpty
          title={t('achievements.empty.title')}
          description={t('achievements.empty.body')}
          action={
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setType('');
                setCategory('');
              }}
              className="min-h-11 rounded-lg border border-border px-4 text-sm text-fg transition-colors hover:bg-surface"
            >
              {t('achievements.reset')}
            </button>
          }
        />
      )}

      <p className="mt-6 max-w-xl text-xs text-fg-muted">
        {t('achievements.dataNote')}
      </p>
    </div>
  );
}
