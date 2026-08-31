import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ImageCard} from '@/components/image-card';
import {Reveal, Stagger} from '@/components/motion/reveal';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';
import {pageMetadata} from '@/lib/page-metadata';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [nav, t] = await Promise.all([
    getTranslations({locale, namespace: 'nav'}),
    getTranslations({locale, namespace: 'work'})
  ]);
  return pageMetadata({
    locale,
    href: '/karya',
    title: nav('work'),
    description: t('meta.description')
  });
}

export default async function WorkPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'nav'});
  const caseStudies = getAllCaseStudies(locale);

  return (
    <main className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
      <h1 className="font-display text-5xl text-fg">{t('work')}</h1>
      <Stagger className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {caseStudies.map((caseStudy, index) => (
          <Reveal key={caseStudy.slug}>
            <ImageCard caseStudy={caseStudy} locale={locale} priority={index === 0} />
          </Reveal>
        ))}
      </Stagger>
    </main>
  );
}
