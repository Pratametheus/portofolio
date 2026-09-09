import type {Locale} from '@/content/types';

export type Achievement = {
  title: string;
  issuer: string;
  year: string;
  type: 'Publikasi' | 'Sertifikat';
  category: 'Keamanan' | 'Pendidikan' | 'Pengembangan';
  description: string;
  url?: string;
};

// One real entry for now (the JUTIF publication), from
// public/design-preview/profile-sections.js `profileAchievements[0]`.
// The page passes the locale-appropriate list in Phase 5.
export const ACHIEVEMENTS: Record<Locale, Achievement[]> = {
  id: [
    {
      title:
        'Analisis Kerentanan Keamanan Aplikasi Web Menggunakan Metode Black Box Testing',
      issuer: 'JUTIF · Vol. 7 No. 2',
      year: '2026',
      type: 'Publikasi',
      category: 'Keamanan',
      description:
        'Artikel penelitian dengan sepuluh skenario pengujian. Terbit pada halaman 1834–1852 di jurnal terakreditasi SINTA 2.',
      url: 'https://doi.org/10.52436/1.jutif.2026.7.2.5662'
    }
  ],
  en: [
    {
      title: 'Web Application Security Vulnerability Analysis Using Black Box Testing',
      issuer: 'JUTIF · Vol. 7 No. 2',
      year: '2026',
      type: 'Publikasi',
      category: 'Keamanan',
      description:
        'A research article with ten test scenarios. Published on pages 1834–1852 in a SINTA 2 accredited journal.',
      url: 'https://doi.org/10.52436/1.jutif.2026.7.2.5662'
    }
  ]
};
