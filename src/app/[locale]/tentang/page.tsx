import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Reveal, Stagger} from '@/components/motion/reveal';
import {PageHeading} from '@/components/page-heading';
import {SectionHead} from '@/components/section-head';
import {Timeline} from '@/components/career-card';
import {DataEmpty} from '@/components/data-empty';
import {SkillList} from '@/components/skill-list';
import {SiteFooter} from '@/components/site-footer';
import {routing, type Locale} from '@/i18n/routing';
import {pageMetadata} from '@/lib/page-metadata';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listPublicCareerEntries} from '@/lib/repositories/career';

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
    getTranslations({locale, namespace: 'about'})
  ]);
  return pageMetadata({
    locale,
    href: '/tentang',
    title: nav('about'),
    description: t('meta.description')
  });
}

export default async function AboutPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'about'});
  const {env} = await getCloudflareContext({async: true});
  const [career, education] = await Promise.all([
    listPublicCareerEntries(env.DB, 'career', locale),
    listPublicCareerEntries(env.DB, 'education', locale)
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <PageHeading title={t('title')} description={t('biography1')} />

      <Stagger className="max-w-2xl space-y-5 text-sm leading-8 text-fg-muted">
        <Reveal>
          <p>{t('biography2')}</p>
        </Reveal>
        <Reveal>
          <p>{t('biography3')}</p>
        </Reveal>
        <Reveal>
          <p>{t('biography4')}</p>
        </Reveal>
        <Reveal>
          <p className="text-fg-muted">
            {t('signoff')}
            <br />
            <strong className="text-accent">Ferry Andhika Pratama</strong>
          </p>
        </Reveal>
      </Stagger>

      <section className="mt-8 border-t border-border pt-8">
        <SectionHead icon="work" title={t('career.title')} description={t('career.description')} />
        <div className="mt-6">
          <Timeline entries={career} />
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-8">
        <SectionHead icon="teach" title={t('education.title')} description={t('education.description')} />
        <div className="mt-6">
          <Timeline entries={education}>
            <DataEmpty
              icon="teach"
              title={t('education.emptyTitle')}
              description={t('education.emptyBody')}
            />
          </Timeline>
        </div>
      </section>

      <div className="mt-8 border-t border-border pt-8">
        <SkillList />
      </div>

      <SiteFooter />
    </main>
  );
}
