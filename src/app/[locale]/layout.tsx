import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';
import {siteName, siteUrl} from '@/lib/site';
import {themeInitScript, DEFAULT_THEME} from '@/lib/theme';
import Sidebar from '@/components/sidebar';
import {Noise} from '@/components/motion/noise';
import {bodyFont, jetbrainsMono} from '../fonts';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const t = await getTranslations({locale, namespace: 'metadata'});
  const title = t('title');
  const description = t('description');
  const homeUrl = `${siteUrl}/${locale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s · ${title}`
    },
    description,
    applicationName: siteName,
    authors: [{name: siteName, url: siteUrl}],
    creator: siteName,
    alternates: {
      canonical: homeUrl,
      languages: {
        id: `${siteUrl}/id`,
        en: `${siteUrl}/en`,
        'x-default': `${siteUrl}/id`
      }
    },
    openGraph: {
      type: 'website',
      siteName,
      locale,
      url: homeUrl,
      title,
      description
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // Only the sidebar's client components read messages on the client; ship just
  // those namespaces instead of the whole catalog (keeps initial JS down).
  const messages = await getMessages();
  const clientMessages = {
    nav: messages.nav,
    sidebar: messages.sidebar
  };

  return (
    <html
      lang={locale}
      data-theme={DEFAULT_THEME}
      className={`${bodyFont.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
        <Noise />
        <NextIntlClientProvider messages={clientMessages}>
          <div className="mx-auto max-w-[1190px] px-6 lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12">
            <Sidebar workCount={getAllCaseStudies(routing.defaultLocale).length} />
            <div className="min-w-0">{children}</div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
