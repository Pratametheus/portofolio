export type {Locale} from '@/i18n/routing';

export type CaseStudySection = {
  heading: string;
  blocks: Array<
    | {type: 'p'; text: string}
    | {type: 'list'; items: string[]}
    | {type: 'table'; rows: Array<[string, string]>}
    | {type: 'quote'; text: string}
  >;
};

export type CaseStudy = {
  slug: 'siakad-informatika' | 'city-courier' | 'mochitoon';
  title: string;
  tagline: string;
  scope?: string;
  year: number;
  stack: string[];
  featured: boolean;
  liveUrl?: string;
  repositoryNote?: string;
  thumbnail: {src: string; alt: string};
  sections: CaseStudySection[];
};
