import type {CaseStudy, Locale} from '../types';

export const caseStudies: Record<Locale, CaseStudy[]> = {
  id: [
    {
      slug: 'siakad-informatika',
      title: 'SIAKAD Informatika',
      tagline: 'Saya mengajar informatika di sekolah dasar. Sistem akademik yang saya gunakan, saya bangun sendiri.',
      scope: 'Sistem Akademik Ekstrakurikuler Informatika · SDN Ujung XIII',
      liveUrl: 'https://jurnal-mengajar-blond.vercel.app/',
      repositoryNote: 'Repositori privat untuk melindungi struktur data akademik siswa.',
      year: 2026,
      stack: ['Next.js', 'React', 'Supabase', 'Tailwind CSS', 'TypeScript'],
      featured: true
    },
    {
      slug: 'city-courier',
      title: 'City Courier',
      tagline: 'Saya menyerang sistem autentikasi saya sendiri sepuluh kali, lalu menerbitkan hasilnya.',
      year: 2026,
      stack: ['Flutter', 'Laravel', 'JWKS', 'RS256'],
      featured: true
    },
    {
      slug: 'mochitoon',
      title: 'MochiToon',
      tagline: 'Saya membangun alat produksinya, dan saya juga yang menulis ceritanya.',
      year: 2026,
      stack: ['React', 'Vite', 'Supabase', 'Tiptap', 'GSAP'],
      featured: false
    }
  ],
  en: [
    {
      slug: 'siakad-informatika',
      title: 'SIAKAD Informatika',
      tagline: 'I teach computing at a primary school. I built the academic system I use.',
      scope: 'Computing extracurricular academic system · SDN Ujung XIII',
      liveUrl: 'https://jurnal-mengajar-blond.vercel.app/',
      repositoryNote: 'Private repository to protect the structure of student academic data.',
      year: 2026,
      stack: ['Next.js', 'React', 'Supabase', 'Tailwind CSS', 'TypeScript'],
      featured: true
    },
    {
      slug: 'city-courier',
      title: 'City Courier',
      tagline: 'I attacked my own authentication system ten times, then published what I found.',
      year: 2026,
      stack: ['Flutter', 'Laravel', 'JWKS', 'RS256'],
      featured: true
    },
    {
      slug: 'mochitoon',
      title: 'MochiToon',
      tagline: 'I built the production tool, and I write the story it manages.',
      year: 2026,
      stack: ['React', 'Vite', 'Supabase', 'Tiptap', 'GSAP'],
      featured: false
    }
  ]
};
