import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {CaseStudyBody} from '@/components/case-study-body';
import {PageHeading} from '@/components/page-heading';
import {TechBadgeRow} from '@/components/tech-badge-row';
import {WorkCard} from '@/components/work-card';
import {SiteFooter} from '@/components/site-footer';
import {ParallaxY} from '@/components/motion/parallax-y.lazy';
import type {CaseStudy} from '@/content/types';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies, getCaseStudy} from '@/lib/content';
import {buildCaseStudyArticleSchema} from '@/lib/jsonld';
import {pageMetadata} from '@/lib/page-metadata';
import {SKILLS} from '@/lib/skills';
import {WORK_TYPE_LABEL_KEY, WORK_TOPIC_LABEL_KEY} from '@/lib/taxonomy-labels';

export function generateStaticParams() {
  const slugs = getAllCaseStudies('id').map((caseStudy) => caseStudy.slug);
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({locale, slug})));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  let caseStudy: CaseStudy;
  try {
    caseStudy = getCaseStudy(slug, locale);
  } catch {
    return {};
  }
  return pageMetadata({
    locale,
    href: {pathname: '/karya/[slug]', params: {slug}},
    title: caseStudy.title,
    description: caseStudy.tagline,
    images: [caseStudy.thumbnail.src]
  });
}

function firstParagraph(section: CaseStudy['sections'][number]): string {
  const block = section.blocks.find((b) => b.type === 'p');
  if (!block || block.type !== 'p') return '';
  return block.text.split('\n\n')[0];
}

export default async function CaseStudyPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale: requested, slug} = await params;
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }
  const locale = requested;
  setRequestLocale(locale);

  let caseStudy: CaseStudy;
  try {
    caseStudy = getCaseStudy(slug, locale);
  } catch {
    notFound();
  }

  const t = await getTranslations({locale});
  const schema = buildCaseStudyArticleSchema(slug, locale);
  const stackSlugs = caseStudy.stack
    .map((name) => SKILLS.find((s) => s.name === name)?.slug)
    .filter((s): s is string => Boolean(s));
  const otherCaseStudies = getAllCaseStudies(locale).filter((cs) => cs.slug !== slug);
  const [teaserA, teaserB] = caseStudy.sections;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(schema).replace(/</g, '\\u003c')}}
      />

      <Link href="/karya" className="mb-6 inline-block text-sm text-fg-muted transition-colors hover:text-fg">
        ← {t('work.detail.back')}
      </Link>

      <PageHeading title={caseStudy.title} description={caseStudy.tagline} />

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-fg-muted">
        <span>
          {`${t(WORK_TOPIC_LABEL_KEY[caseStudy.topic])} · ${t(WORK_TYPE_LABEL_KEY[caseStudy.type])}`}
        </span>
        <span>{caseStudy.stack.join(' · ')}</span>
      </div>
      <div className="mt-4">
        <TechBadgeRow slugs={stackSlugs} size={28} />
      </div>

      <figure className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl bg-surface-2">
        <ParallaxY className="absolute -inset-4">
          <Image
            src={caseStudy.thumbnail.src}
            alt={caseStudy.thumbnail.alt}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            priority
            className="object-cover"
          />
        </ParallaxY>
      </figure>

      <article className="mt-8 max-w-2xl">
        {teaserA ? (
          <section className="border-b border-border py-6">
            <h2 className="font-display text-xl text-fg">{teaserA.heading}</h2>
            <p className="mt-3 text-[15px] leading-8 text-fg-muted">{firstParagraph(teaserA)}</p>
          </section>
        ) : null}
        {teaserB ? (
          <section className="border-b border-border py-6">
            <h2 className="font-display text-xl text-fg">{teaserB.heading}</h2>
            <p className="mt-3 text-[15px] leading-8 text-fg-muted">{firstParagraph(teaserB)}</p>
          </section>
        ) : null}
        <section className="border-b border-border py-6">
          <h2 className="font-display text-xl text-fg">{t('work.detail.techTitle')}</h2>
          <p className="mt-3 text-[15px] leading-8 text-fg-muted">{caseStudy.stack.join(' · ')}</p>
        </section>
        <section className="py-6">
          <h2 className="font-display text-xl text-fg">{t('work.detail.fullCaseTitle')}</h2>
          <div className="mt-6">
            <CaseStudyBody sections={caseStudy.sections} />
          </div>
        </section>
      </article>

      <section className="mt-8 border-t border-border pt-8">
        <h2 className="font-display text-xl text-fg">{t('work.detail.relatedTitle')}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {otherCaseStudies.map((cs) => (
            <WorkCard key={cs.slug} caseStudy={cs} locale={locale} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
