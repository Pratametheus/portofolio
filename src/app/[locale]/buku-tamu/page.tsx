import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeading} from '@/components/page-heading';
import {SiteFooter} from '@/components/site-footer';
import {GuestbookForm} from '@/components/guestbook-form';
import {GuestbookEntryList} from '@/components/guestbook-entry-list';
import {routing} from '@/i18n/routing';
import {pageMetadata} from '@/lib/page-metadata';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listPublicGuestbookEntries} from '@/lib/repositories/guestbook';

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
    getTranslations({locale, namespace: 'guestbook'})
  ]);
  return pageMetadata({
    locale,
    href: '/buku-tamu',
    title: nav('guestbook'),
    description: t('meta.description')
  });
}

export default async function GuestbookPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'guestbook'});
  const {env} = await getCloudflareContext({async: true});
  const entries = await listPublicGuestbookEntries(env.DB);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <PageHeading title={t('title')} description={t('intro')} />
      <GuestbookForm />
      <GuestbookEntryList entries={entries} locale={locale} />
      <SiteFooter />
    </main>
  );
}
