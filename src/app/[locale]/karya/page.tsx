import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeading} from '@/components/page-heading';
import {WorkFilters} from '@/components/work-filters';
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
  const t = await getTranslations({locale, namespace: 'work'});
  const caseStudies = getAllCaseStudies(locale);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <PageHeading title={t('title')} description={t('intro')} />
      <WorkFilters caseStudies={caseStudies} locale={locale} />
    </main>
  );
}
