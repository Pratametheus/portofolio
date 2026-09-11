import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Icon} from '@/components/icon';
import {PageHeading} from '@/components/page-heading';
import {SiteFooter} from '@/components/site-footer';
import {routing} from '@/i18n/routing';
import {pageMetadata} from '@/lib/page-metadata';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [nav, t] = await Promise.all([getTranslations({locale, namespace: 'nav'}), getTranslations({locale, namespace: 'links'})]);
  return pageMetadata({locale, href: '/links', title: nav('links'), description: t('meta.description')});
}

export default async function LinksPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'links'});
  const links = [
    {label: t('githubLabel'), description: t('githubDescription'), url: t('githubUrl'), badge: 'CODE'},
    {label: t('journalLabel'), description: t('journalDescription'), url: t('journalUrl'), badge: 'DOI'},
    {label: t('siakadLabel'), description: t('siakadDescription'), url: t('siakadUrl'), badge: 'WEB'}
  ];
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <PageHeading title={t('title')} description={t('intro')} />
      <ul className="space-y-3">
        {links.map((link) => <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"><Icon name="links" className="mt-0.5 size-5 shrink-0 text-accent" /><span className="min-w-0 flex-1"><span className="font-display text-lg text-fg group-hover:text-accent">{link.label} <span aria-hidden="true">↗</span></span><span className="mt-1.5 block text-sm leading-6 text-fg-muted">{link.description}</span></span><span className="rounded-full border border-border px-2 py-1 text-[9px] font-bold tracking-widest text-fg-muted">{link.badge}</span></a></li>)}
      </ul>
      <SiteFooter />
    </main>
  );
}
