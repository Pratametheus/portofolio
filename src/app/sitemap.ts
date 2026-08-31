import type {MetadataRoute} from 'next';
import {getPathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';
import {siteUrl} from '@/lib/site';

type StaticHref = Parameters<typeof getPathname>[0]['href'];

const STATIC_ROUTES: Array<{
  href: StaticHref;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  {href: '/', changeFrequency: 'monthly', priority: 1},
  {href: '/karya', changeFrequency: 'monthly', priority: 0.9},
  {href: '/tentang', changeFrequency: 'yearly', priority: 0.7},
  {href: '/riset', changeFrequency: 'yearly', priority: 0.7},
  {href: '/pencapaian', changeFrequency: 'yearly', priority: 0.6},
  {href: '/links', changeFrequency: 'yearly', priority: 0.6},
  {href: '/kontak', changeFrequency: 'yearly', priority: 0.6},
  {href: '/buku-tamu', changeFrequency: 'yearly', priority: 0.4}
];

function entry(
  href: StaticHref,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
  lastModified: Date
): MetadataRoute.Sitemap[number] {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      new URL(getPathname({locale, href}), siteUrl).toString()
    ])
  );
  return {
    url: new URL(getPathname({locale: routing.defaultLocale, href}), siteUrl).toString(),
    lastModified,
    changeFrequency,
    priority,
    alternates: {languages}
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries = STATIC_ROUTES.map(({href, changeFrequency, priority}) =>
    entry(href, changeFrequency, priority, lastModified)
  );

  const caseStudyEntries = getAllCaseStudies(routing.defaultLocale).map((caseStudy) =>
    entry(
      {pathname: '/karya/[slug]', params: {slug: caseStudy.slug}},
      'yearly',
      0.8,
      lastModified
    )
  );

  return [...staticEntries, ...caseStudyEntries];
}
