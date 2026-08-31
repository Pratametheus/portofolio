import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ResearchCard} from '@/components/research-card';
import {Reveal} from '@/components/motion/reveal';
import {routing} from '@/i18n/routing';
import {buildScholarlyArticleSchema} from '@/lib/jsonld';
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
    getTranslations({locale, namespace: 'research'})
  ]);
  return pageMetadata({
    locale,
    href: '/riset',
    title: nav('research'),
    description: t('meta.description')
  });
}

export default async function ResearchPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'research'});
  const schema = buildScholarlyArticleSchema();

  return (
    <main className="mx-auto max-w-4xl px-6 py-20 lg:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(schema).replace(/</g, '\\u003c')}}
      />
      <h1 className="font-display text-5xl text-fg">{t('title')}</h1>
      <Reveal className="mt-10 block">
        <ResearchCard locale={locale} />
      </Reveal>
    </main>
  );
}
