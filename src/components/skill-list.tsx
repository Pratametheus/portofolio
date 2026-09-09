'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {SectionHead} from './section-head';
import {SKILLS, SKILL_GROUPS, type SkillGroupFilter} from '@/lib/skills';

const GROUP_LABEL_KEY = {
  Semua: 'skills.groups.semua',
  Frontend: 'skills.groups.frontend',
  Backend: 'skills.groups.backend',
  Mobile: 'skills.groups.mobile',
  Database: 'skills.groups.database',
  Tools: 'skills.groups.tools'
} as const;

function countFor(group: SkillGroupFilter) {
  return group === 'Semua'
    ? SKILLS.length
    : SKILLS.filter((s) => s.group === group).length;
}

export function SkillList() {
  const t = useTranslations();
  const [active, setActive] = useState<SkillGroupFilter>('Semua');

  const visible = SKILLS.filter((s) => active === 'Semua' || s.group === active);

  return (
    <section>
      <SectionHead
        icon="code"
        title={t('skills.title')}
        description={t('skills.description')}
      />
      <div
        role="group"
        aria-label={t('skills.filterLabel')}
        className="mb-6 mt-6 flex flex-wrap gap-2"
      >
        {SKILL_GROUPS.map((group) => (
          <button
            key={group}
            type="button"
            aria-pressed={active === group}
            onClick={() => setActive(group)}
            className={`min-h-11 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs ${
              active === group
                ? 'bg-accent text-on-accent border-accent'
                : 'border-border text-fg-muted'
            }`}
          >
            {t(GROUP_LABEL_KEY[group])}
            <span>{countFor(group)}</span>
          </button>
        ))}
      </div>
      <ul aria-live="polite" className="flex flex-wrap gap-2.5">
        {visible.map((s) => (
          <li
            key={s.slug}
            style={
              {
                ['--brand' as string]: s.brandColor,
                background:
                  'color-mix(in srgb, var(--brand) 20%, var(--color-bg))',
                borderColor:
                  'color-mix(in srgb, var(--brand) 30%, var(--color-border))'
              } as React.CSSProperties
            }
            className="inline-flex items-center gap-2 rounded-3xl border px-3 py-1.5 text-sm text-fg"
          >
            <img
              src={`/tech/${s.slug}.svg`}
              alt=""
              width={19}
              height={19}
              loading="lazy"
            />
            {s.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
