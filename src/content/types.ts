export type {Locale} from '@/i18n/routing';

export type CaseStudy = {
  slug: string;
  title: string;
  tagline: string;
  scope?: string;
  liveUrl?: string;
  repositoryNote?: string;
  year: number;
  stack: string[];
  featured: boolean;
};
