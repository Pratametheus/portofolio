import type {Locale} from '@/content/types';

export type CareerEntry = {
  role: string;
  organization: string;
  period: string;
  category: string;
  mark: string;
  description: string;
};

// Content from public/design-preview/profile-sections.js `profileCareer` (id),
// translated for `en`.
export const CAREER: Record<Locale, CareerEntry[]> = {
  id: [
    {
      role: 'Guru Informatika',
      organization: 'SDN Ujung XIII/38',
      period: 'Mulai April 2026',
      category: 'Pendidikan',
      mark: 'SD',
      description:
        'Mengajar komputer untuk kelas 4, 5, dan 6. Menyusun materi sesuai kebutuhan dan keterbatasan sekolah, serta membangun SIAKAD Informatika untuk mendukung kegiatan mengajar.'
    }
  ],
  en: [
    {
      role: 'Computing Teacher',
      organization: 'SDN Ujung XIII/38',
      period: 'Since April 2026',
      category: 'Education',
      mark: 'SD',
      description:
        "Teaching computing to grades 4, 5 and 6. Building the syllabus around the school's real needs and constraints, and building SIAKAD Informatika to support the teaching."
    }
  ]
};

// Education history is intentionally empty; the page renders a placeholder.
export const EDUCATION: Record<Locale, CareerEntry[]> = {
  id: [],
  en: []
};
