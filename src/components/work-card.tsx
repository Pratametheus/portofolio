import {useTranslations} from 'next-intl';
import {getPathname} from '@/i18n/navigation';
import {TechBadgeRow} from '@/components/tech-badge-row';
import {SKILLS} from '@/lib/skills';
import {WORK_TYPE_LABEL_KEY, WORK_TOPIC_LABEL_KEY} from '@/lib/taxonomy-labels';
import type {CaseStudy, Locale} from '@/content/types';

export function WorkCard({caseStudy, locale}: {caseStudy: CaseStudy; locale: Locale}) {
  const t = useTranslations();
  const detailHref = getPathname({
    locale,
    href: {pathname: '/karya/[slug]', params: {slug: caseStudy.slug}}
  });
  const stackSlugs = caseStudy.stack
    .map((name) => SKILLS.find((s) => s.name === name)?.slug)
    .filter((s): s is string => Boolean(s));

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/60">
      <a href={detailHref} className="relative block overflow-hidden border-b border-border">
        <img
          src={caseStudy.thumbnail.src}
          alt={caseStudy.thumbnail.alt}
          loading="lazy"
          className="aspect-[1.8] w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
        />
        {caseStudy.featured ? (
          <span className="absolute right-3 top-3 rounded border border-border bg-bg/90 px-2 py-0.5 font-mono text-[10px] font-medium text-accent">
            {t('work.featuredLabel')}
          </span>
        ) : null}
      </a>
      <div className="flex flex-1 flex-col p-5">
        <span className="font-mono text-xs text-fg-muted">
          {`${t(WORK_TOPIC_LABEL_KEY[caseStudy.topic])} · ${t(WORK_TYPE_LABEL_KEY[caseStudy.type])}`}
        </span>
        <h3 className="mt-1.5 font-display text-lg font-semibold text-fg">
          <a href={detailHref} className="transition-colors hover:text-accent">
            {caseStudy.title}
          </a>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">{caseStudy.tagline}</p>
        <div className="mt-auto pt-4">
          <TechBadgeRow slugs={stackSlugs} size={20} />
        </div>
      </div>
    </article>
  );
}
