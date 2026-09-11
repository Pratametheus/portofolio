import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeading} from '@/components/page-heading';
import {PaperStory, PublicationListCard} from '@/components/publication-list-card';
import {SiteFooter} from '@/components/site-footer';
import {routing} from '@/i18n/routing';
import {buildScholarlyArticleSchema} from '@/lib/jsonld';
import {pageMetadata} from '@/lib/page-metadata';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {getFeaturedPublication, listPublicAchievements} from '@/lib/repositories/achievements';

export const dynamic = 'force-dynamic';

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
  const {env} = await getCloudflareContext({async: true});
  const [publication, achievements] = await Promise.all([
    getFeaturedPublication(env.DB, locale),
    listPublicAchievements(env.DB, locale)
  ]);
  if (!publication) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildScholarlyArticleSchema()).replace(/</g, '\\u003c')
        }}
      />
      <PageHeading title={t('title')} description={t('paper.summary')} />
      <section aria-labelledby="publication-count">
        <h2 id="publication-count" className="mb-4 font-display text-lg text-fg">{t('count', {n: achievements.length})}</h2>
        <PublicationListCard item={publication} href="#paper-story" />
      </section>
      <section id="paper-story" className="mt-10 scroll-mt-8 border-t border-border pt-8">
        <h2 className="font-display text-2xl text-fg">{t('paper.title')}</h2>
        <p className="mt-2 text-xs text-fg-muted">{t('paper.meta')}</p>
        <p className="mt-4 max-w-2xl text-[15px] leading-8 text-fg-muted">{t('paper.summary')}</p>
        <PaperStory item={publication} locale={locale} />
      </section>
      <SiteFooter />
    </main>
  );
}
