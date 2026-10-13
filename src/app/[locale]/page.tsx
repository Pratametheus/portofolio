import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Reveal, Stagger} from '@/components/motion/reveal';
import {SectionHead} from '@/components/section-head';
import {SkillList} from '@/components/skill-list';
import {WorkCard} from '@/components/work-card';
import {TrueFocus} from '@/components/effects/true-focus';
import {SiteFooter} from '@/components/site-footer';
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
          <p className="font-mono text-xs text-fg-muted">
            {t('helloEyebrow')}
          </p>
        </Reveal>
        <Reveal>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            <TrueFocus sentence={t('helloHeading')} />
            <span className="text-accent">.</span>
          </h1>
        </Reveal>
        <Stagger className="mt-4 max-w-2xl space-y-3 text-sm leading-relaxed text-fg-muted sm:text-[15px]">
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
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-fg"
          >
            {t('aboutLink')} <span aria-hidden="true">↗</span>
          </Link>
        </Reveal>
      </section>

      <div className="mt-10">
        <SkillList />
      </div>

      <section className="mt-12 border-t border-border pt-8">
        <SectionHead
          title={t('selectedWork')}
          aside={
            <Link href="/karya" className="text-xs text-accent transition-colors hover:text-fg">
              {t('selectedWorkAll')} <span aria-hidden="true">↗</span>
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
        <section className="mt-12 border-t border-border pt-8">
          <div className="rounded-xl border border-border bg-surface p-6">
            <span className="font-mono text-xs text-fg-muted">
              {t('researchEyebrow')}
            </span>
            <h2 className="mt-2 font-display text-xl font-semibold text-fg">{t('researchHeadline')}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">{t('researchSummary')}</p>
            <Link
              href="/riset"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-fg"
            >
              {t('researchLink')} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </Reveal>

      <SiteFooter />
    </main>
  );
}
