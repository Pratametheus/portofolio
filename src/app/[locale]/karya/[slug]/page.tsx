import Image from 'next/image';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {CaseStudyBody} from '@/components/case-study-body';
import {ParallaxY} from '@/components/motion/parallax-y.lazy';
import type {CaseStudy} from '@/content/types';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies, getCaseStudy} from '@/lib/content';
import {buildCaseStudyArticleSchema} from '@/lib/jsonld';

export function generateStaticParams() {
  const slugs = getAllCaseStudies('id').map((caseStudy) => caseStudy.slug);
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({locale, slug})));
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

  const schema = buildCaseStudyArticleSchema(slug, locale);

  return (
    <main className="mx-auto max-w-4xl px-6 py-20 lg:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(schema).replace(/</g, '\\u003c')}}
      />
      <article>
        <header>
          {caseStudy.scope ? (
            <p className="font-mono text-sm text-accent">{caseStudy.scope}</p>
          ) : null}
          <h1 className="mt-3 font-display text-5xl text-fg">{caseStudy.title}</h1>
          <p className="mt-5 text-xl leading-8 text-fg-muted">{caseStudy.tagline}</p>
        </header>

        <figure className="relative mt-12 aspect-[16/10] overflow-hidden rounded-2xl bg-surface-2">
          <ParallaxY className="absolute -inset-4">
            <Image
              src={caseStudy.thumbnail.src}
              alt={caseStudy.thumbnail.alt}
              fill
              sizes="(min-width: 1024px) 896px, 100vw"
              priority
              className="object-cover"
            />
          </ParallaxY>
        </figure>

        <div className="mt-16">
          <CaseStudyBody sections={caseStudy.sections} />
        </div>
      </article>
    </main>
  );
}
