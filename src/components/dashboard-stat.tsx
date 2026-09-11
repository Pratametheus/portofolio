import {useTranslations} from 'next-intl';
import {getPathname} from '@/i18n/navigation';
import type {CaseStudy, Locale} from '@/content/types';

export function DashboardStat({label}: {label: string}) {
  const t = useTranslations();
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <span className="text-xs text-fg-muted">{label}</span>
      <strong aria-label={t('dashboard.statValueLabel')} className="mt-2 block font-display text-3xl text-fg">
        —
      </strong>
      <small className="mt-1 block text-[11px] text-fg-muted">{t('dashboard.notConnected')}</small>
    </div>
  );
}

export function ConnectionState({title, description}: {title: string; description: string}) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-fg-muted">
      <h3 className="font-display text-base text-fg">{title}</h3>
      <p className="mt-2 max-w-lg text-sm leading-7 text-fg-muted">{description}</p>
    </div>
  );
}

export function RepoGrid({caseStudies, locale}: {caseStudies: CaseStudy[]; locale: Locale}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {caseStudies.map((cs) => {
        const href = getPathname({locale, href: {pathname: '/karya/[slug]', params: {slug: cs.slug}}});
        return (
          <a
            key={cs.slug}
            href={href}
            className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <h3 className="font-display text-base text-fg">
              {cs.title} <span aria-hidden="true">↗</span>
            </h3>
            <p className="mt-2 text-sm leading-7 text-fg-muted">{cs.tagline}</p>
            <small className="mt-3 block text-xs text-fg-muted">{cs.stack.join(' · ')}</small>
          </a>
        );
      })}
    </div>
  );
}
