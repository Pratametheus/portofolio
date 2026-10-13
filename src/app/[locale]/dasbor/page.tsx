import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ConnectionState, DashboardStat, RepoGrid} from '@/components/dashboard-stat';
import {ContributionCalendar} from '@/components/dashboard/contribution-calendar';
import {WakaTimeStats} from '@/components/dashboard/wakatime-stats';
import {PageHeading} from '@/components/page-heading';
import {SectionHead} from '@/components/section-head';
import {SiteFooter} from '@/components/site-footer';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';
import {pageMetadata} from '@/lib/page-metadata';
import {fetchGitHubContributions, fetchWakaTimeStats} from '@/lib/services/telemetry';
import {getCloudflareContext} from '@opennextjs/cloudflare';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [nav, t] = await Promise.all([
    getTranslations({locale, namespace: 'nav'}),
    getTranslations({locale, namespace: 'dashboard'})
  ]);
  return pageMetadata({
    locale,
    href: '/dasbor',
    title: nav('dashboard'),
    description: t('meta.description')
  });
}

export default async function DashboardPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;
  setRequestLocale(locale);
  const [nav, t] = await Promise.all([
    getTranslations({locale, namespace: 'nav'}),
    getTranslations({locale, namespace: 'dashboard'})
  ]);
  let githubData = null;
  let wakaData = null;

  try {
    const {env} = await getCloudflareContext({async: true});
    const cfEnv = env as unknown as Record<string, string | undefined>;
    const [gh, waka] = await Promise.all([
      fetchGitHubContributions('Pratametheus', cfEnv.GITHUB_TOKEN),
      fetchWakaTimeStats(cfEnv.WAKATIME_API_KEY)
    ]);
    githubData = gh;
    wakaData = waka;
  } catch {
    // Graceful fallback when cloudflare context is not initialized (e.g. static tests)
  }

  const sections = [
    {key: 'github', labels: ['github.stats.followers', 'github.stats.repositories', 'github.stats.stars']},
    {key: 'wakatime', labels: ['wakatime.stats.codingTime', 'wakatime.stats.topLanguage', 'wakatime.stats.dailyAverage']},
    {key: 'monkeytype', labels: ['monkeytype.stats.wpm', 'monkeytype.stats.accuracy', 'monkeytype.stats.tests']}
  ] as const;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <PageHeading title={nav('dashboard')} description={t('intro')} />
      {sections.map(({key, labels}, index) => (
        <section key={key} className={index === 0 ? '' : 'mt-12 border-t border-border pt-8'}>
          <SectionHead
            icon="dashboard"
            title={t(`${key}.title`)}
            aside={key === 'github' ? (
              <a
                href="https://github.com/Pratametheus"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent transition-colors hover:text-fg"
              >
                {t('github.link')} <span aria-hidden="true">↗</span>
              </a>
            ) : undefined}
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {labels.map((label) => <DashboardStat key={label} label={t(label)} />)}
          </div>
          {key === 'github' ? (
            <>
              <div className="mt-6">
                {githubData ? (
                  <ContributionCalendar data={githubData} />
                ) : (
                  <ConnectionState
                    title={t('github.calendarEmpty.title')}
                    description={t('github.calendarEmpty.description')}
                  />
                )}
              </div>
              <div className="mt-10">
                <SectionHead title={t('repos.title')} />
                <RepoGrid caseStudies={getAllCaseStudies(locale)} locale={locale} />
              </div>
            </>
          ) : null}
          {key === 'wakatime' && wakaData ? (
            <div className="mt-6">
              <WakaTimeStats stats={wakaData} />
            </div>
          ) : null}
        </section>
      ))}
      <SiteFooter />
    </main>
  );
}
