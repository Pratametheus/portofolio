import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Reveal, Stagger} from '@/components/motion/reveal';
import {SectionHead} from '@/components/section-head';
import {SkillList} from '@/components/skill-list';
import {WorkCard} from '@/components/work-card';
import {SiteFooter} from '@/components/site-footer';
import {Icon} from '@/components/icon';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }
  const locale = requested;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'home'});
  const featured = getAllCaseStudies(locale).filter((cs) => cs.featured);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <section>
        <Reveal>
          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-muted">
            {t('helloEyebrow')}
          </p>
        </Reveal>
        <Reveal>
          <h1 className="mt-3 font-display text-[34px] font-semibold leading-tight tracking-tight text-fg">
            {t('helloHeading')}
            <span className="text-accent">.</span>
          </h1>
        </Reveal>
        <Stagger className="mt-5 max-w-xl space-y-3 text-sm leading-8 text-fg-muted">
          <Reveal>
            <p>{t('intro1')}</p>
          </Reveal>
          <Reveal>
            <p>{t('intro2')}</p>
          </Reveal>
        </Stagger>
        <Reveal>
          <Link
            href="/tentang"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-fg"
          >
            {t('aboutLink')} <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </section>

      <div className="mt-8">
        <SkillList />
      </div>

      <section className="mt-8 border-t border-border pt-8">
        <SectionHead
          title={t('selectedWork')}
          aside={
            <Link href="/karya" className="text-xs text-accent hover:text-fg">
              {t('selectedWorkAll')} <span aria-hidden="true">→</span>
            </Link>
          }
        />
        <Stagger className="mt-6 grid gap-6 sm:grid-cols-2">
          {featured.map((caseStudy) => (
            <Reveal key={caseStudy.slug}>
              <WorkCard caseStudy={caseStudy} locale={locale} />
            </Reveal>
          ))}
        </Stagger>
      </section>

      <Reveal>
        <section className="mt-8 flex gap-5 border-t border-border pt-8">
          <div className="mt-1 grid size-10 shrink-0 place-items-center rounded-xl border border-border text-accent">
            <Icon name="research" className="size-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-fg-muted">
              {t('researchEyebrow')}
            </span>
            <h2 className="mt-2 font-display text-[19px] text-fg">{t('researchHeadline')}</h2>
            <p className="mt-2 max-w-lg text-sm leading-7 text-fg-muted">{t('researchSummary')}</p>
            <Link
              href="/riset"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-fg"
            >
              {t('researchLink')} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </Reveal>

      <SiteFooter />
    </main>
  );
}
