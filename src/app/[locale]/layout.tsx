import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {siteUrl} from '@/lib/site';
import {themeInitScript, DEFAULT_THEME} from '@/lib/theme';
import Sidebar from '@/components/sidebar';
import {inter, interTight, jetbrainsMono} from '../fonts';
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

  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: {
        id: '/id',
        en: '/en'
      }
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
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
        <NextIntlClientProvider messages={clientMessages}>
          <div className="lg:grid lg:grid-cols-[280px_1fr]">
            <Sidebar />
            <div className="min-w-0">{children}</div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
