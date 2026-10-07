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

function SkillIcon({slug}: {slug: string}) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span aria-hidden="true" className="text-xs leading-none">
        ◈
      </span>
    );
  }

  return (
    <img
      src={`/tech/${slug}.svg`}
      alt=""
      width={19}
      height={19}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
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
            className={`min-h-11 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
              active === group
                ? 'border-accent bg-accent text-on-accent'
                : 'border-border text-fg-muted hover:border-accent/50 hover:text-fg'
            }`}
          >
            {t(GROUP_LABEL_KEY[group])}
            <span className="opacity-75">{countFor(group)}</span>
          </button>
        ))}
      </div>
      <ul aria-live="polite" className="flex flex-wrap gap-2">
        {visible.map((s) => (
          <li
            key={s.slug}
            style={
              {
                ['--brand' as string]: s.brandColor,
                background:
                  'color-mix(in srgb, var(--brand) 12%, var(--color-surface))',
                borderColor:
                  'color-mix(in srgb, var(--brand) 24%, var(--color-border))'
              } as React.CSSProperties
            }
            className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium text-fg"
          >
            <SkillIcon slug={s.slug} />
            {s.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
