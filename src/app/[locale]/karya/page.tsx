import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ImageCard} from '@/components/image-card';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';

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
      <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {caseStudies.map((caseStudy, index) => (
          <ImageCard
            key={caseStudy.slug}
            caseStudy={caseStudy}
            locale={locale}
            priority={index === 0}
          />
        ))}
      </div>
    </main>
  );
}
