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

export function buildScholarlyArticleSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle' as const,
    headline:
      'Security Assessment of JWKS-Based Authentication: Mitigating JWT Attack Vectors Through Penetration Testing',
    identifier: '10.52436/1.jutif.2026.7.2.5662',
    url: 'https://doi.org/10.52436/1.jutif.2026.7.2.5662',
    datePublished: '2026-04-18',
    author: [
      {'@type': 'Person', name: 'Ferry Andhika Pratama'},
      {'@type': 'Person', name: 'Agus Hermanto'},
      {'@type': 'Person', name: 'Geri Kusnanto'}
    ],
    isPartOf: {'@type': 'Periodical', name: 'Jurnal Teknik Informatika (JUTIF)'},
    pagination: '1834-1852'
  };
}
