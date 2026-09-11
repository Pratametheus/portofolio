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
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <a href={detailHref} className="group relative block overflow-hidden">
        <img
          src={caseStudy.thumbnail.src}
          alt={caseStudy.thumbnail.alt}
          loading="lazy"
          className="aspect-[1.8] w-full object-cover"
        />
        {caseStudy.featured ? (
          <span className="absolute right-0 top-0 rounded-bl-xl bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent">
            {t('work.featuredLabel')}
          </span>
        ) : null}
        <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/60 text-sm text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
          {t('work.coverAction')}
        </span>
      </a>
      <div className="p-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-fg-muted">
          {`${t(WORK_TOPIC_LABEL_KEY[caseStudy.topic])} · ${t(WORK_TYPE_LABEL_KEY[caseStudy.type])}`}
        </span>
        <h3 className="mt-2 font-display text-lg text-fg">
          <a href={detailHref} className="transition-colors hover:text-accent">
            {caseStudy.title}
          </a>
        </h3>
        <p className="mt-2 text-sm leading-7 text-fg-muted">{caseStudy.tagline}</p>
        <div className="mt-4">
          <TechBadgeRow slugs={stackSlugs} size={22} />
        </div>
        <a
          href={detailHref}
          className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-accent"
        >
          {t('work.cardCta')} <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
