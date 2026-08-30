import {caseStudies} from '@/content/case-studies';
import type {CaseStudy, Locale} from '@/content/types';

export function getAllCaseStudies(locale: Locale): CaseStudy[] {
  return caseStudies[locale];
}

export function getCaseStudy(slug: string, locale: Locale): CaseStudy {
  const found = caseStudies[locale].find((c) => c.slug === slug);
  if (!found) {
    throw new Error(`Studi kasus tidak ditemukan: ${slug}`);
  }
  return found;
}
