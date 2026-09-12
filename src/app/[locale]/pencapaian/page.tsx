import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {AchievementFilters} from '@/components/achievement-filters';
import {PageHeading} from '@/components/page-heading';
import {SiteFooter} from '@/components/site-footer';
import {routing} from '@/i18n/routing';
import {pageMetadata} from '@/lib/page-metadata';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listPublicAchievements} from '@/lib/repositories/achievements';

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
    getTranslations({locale, namespace: 'achievements'})
  ]);
  return pageMetadata({
    locale,
    href: '/pencapaian',
    title: nav('achievements'),
    description: t('meta.description')
  });
}

export default async function AchievementsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'achievements'});
  const {env} = await getCloudflareContext({async: true});
  const achievements = await listPublicAchievements(env.DB, locale);
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <PageHeading title={t('title')} description={t('intro')} />
      <section aria-labelledby="achievement-list-title">
        <h2 id="achievement-list-title" className="sr-only">
          {t('listTitle')}
        </h2>
        <AchievementFilters items={achievements} />
      </section>
      <SiteFooter />
    </main>
  );
}
