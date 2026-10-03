import type {Locale} from '@/content/types';
import {getCaseStudy} from '@/lib/content';
import {siteName, siteUrl} from './site';

export function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person' as const,
    name: siteName,
    url: siteUrl,
    jobTitle: 'Software Engineer',
    alumniOf: {'@type': 'CollegeOrUniversity', name: 'Universitas 17 Agustus 1945 Surabaya'},
    sameAs: ['https://github.com/Pratametheus']
  };
}

export function buildScholarlyArticleSchema(locale: Locale = 'id') {
  const headline =
    locale === 'en'
      ? 'Web Application Security Vulnerability Analysis Using Black Box Testing'
      : 'Analisis Kerentanan Keamanan Aplikasi Web Menggunakan Metode Black Box Testing';

  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle' as const,
    headline,
    identifier: '10.52436/1.jutif.2026.7.2.5662',
    url: 'https://doi.org/10.52436/1.jutif.2026.7.2.5662',
    datePublished: '2026-04-18',
    inLanguage: locale,
    author: [
      {'@type': 'Person', name: 'Ferry Andhika Pratama'},
      {'@type': 'Person', name: 'Agus Hermanto'},
      {'@type': 'Person', name: 'Geri Kusnanto'}
    ],
    isPartOf: {'@type': 'Periodical', name: 'Jurnal Teknik Informatika (JUTIF)'},
    pagination: '1834-1852'
  };
}

export function buildCaseStudyArticleSchema(slug: string, locale: Locale) {
  const caseStudy = getCaseStudy(slug, locale);
  const route = locale === 'en' ? 'work' : 'karya';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article' as const,
    headline: caseStudy.title,
    about: caseStudy.tagline,
    datePublished: `${caseStudy.year}-01-01`,
    author: {'@type': 'Person' as const, name: siteName},
    inLanguage: locale,
    url: `${siteUrl}/${locale}/${route}/${caseStudy.slug}`
  };
}
