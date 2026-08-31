import type {Metadata} from 'next';
import {getPathname} from '@/i18n/navigation';
import {routing, type Locale} from '@/i18n/routing';
import {siteName, siteUrl} from '@/lib/site';

type Href = Parameters<typeof getPathname>[0]['href'];

function absolute(path: string): string {
  return new URL(path, siteUrl).toString();
}

/**
 * Per-page metadata: canonical + hreflang alternates for the localised route,
 * plus matching Open Graph and Twitter blocks. Page titles are plain strings so
 * the root layout's title template ("%s · Ferry Andhika Pratama") still applies.
 */
export function pageMetadata(opts: {
  locale: Locale;
  href: Href;
  title: string;
  description: string;
  images?: string[];
}): Metadata {
  const {locale, href, title, description, images} = opts;

  const url = absolute(getPathname({locale, href}));
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = absolute(getPathname({locale: l, href}));
  }
  languages['x-default'] = languages[routing.defaultLocale];

  // A deeper segment's `openGraph`/`twitter` replaces the parent's wholesale, so
  // the [locale] layout's auto-injected social image is lost unless each page
  // re-declares one. Fall back to the generated per-locale card.
  const ogImages = (images ?? [`/${locale}/opengraph-image`]).map(absolute);
  const twitterImages = (images ?? [`/${locale}/twitter-image`]).map(absolute);

  return {
    title,
    description,
    alternates: {canonical: url, languages},
    openGraph: {
      type: 'website',
      siteName,
      locale,
      url,
      title,
      description,
      images: ogImages
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: twitterImages
    }
  };
}
