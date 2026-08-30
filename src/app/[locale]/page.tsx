import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';
import {CaseStudyCard} from '@/components/case-study-card';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const caseStudies = getAllCaseStudies(locale);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-display text-4xl text-fg">Ferry Andhika Pratama</h1>
      <p className="mt-4 text-lg text-fg-muted">{t('tagline')}</p>

      <section aria-labelledby="selected-work-heading" className="mt-16">
        <h2 id="selected-work-heading" className="font-display text-2xl text-fg">
          {t('selectedWork')}
        </h2>
        <div className="mt-4 grid gap-4">
          {caseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} locale={locale} />
          ))}
        </div>
      </section>
    </main>
  );
}
