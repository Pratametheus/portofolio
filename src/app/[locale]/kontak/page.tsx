import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ContactDraftForm} from '@/components/contact-draft-form';
import {PageHeading} from '@/components/page-heading';
import {SectionHead} from '@/components/section-head';
import {SiteFooter} from '@/components/site-footer';
import {SocialCard} from '@/components/social-card';
import {routing} from '@/i18n/routing';
import {pageMetadata} from '@/lib/page-metadata';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [nav, t] = await Promise.all([getTranslations({locale, namespace: 'nav'}), getTranslations({locale, namespace: 'contact'})]);
  return pageMetadata({locale, href: '/kontak', title: nav('contact'), description: t('meta.description')});
}

export default async function ContactPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'contact'});
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <PageHeading title={t('title')} description={t('intro')} />
      <section><SectionHead icon="contact" title={t('connectTitle')} /><div className="mt-5 grid gap-5 sm:grid-cols-2"><SocialCard variant="github" /><SocialCard variant="email" /></div></section>
      <section className="mt-8 border-t border-border pt-8"><SectionHead icon="build" title={t('form.prepareTitle')} description={t('form.note')} /><div className="mt-5"><ContactDraftForm /></div></section>
      <SiteFooter />
    </main>
  );
}
