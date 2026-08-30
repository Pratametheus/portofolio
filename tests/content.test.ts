import {describe, expect, it} from 'vitest';
import {getAllCaseStudies, getCaseStudy} from '@/lib/content';

describe('getAllCaseStudies', () => {
  it('mengembalikan tiga studi kasus', () => {
    expect(getAllCaseStudies('id')).toHaveLength(3);
  });

  it('mengembalikan identitas SIAKAD Informatika untuk locale id', () => {
    const siakad = getAllCaseStudies('id').find((c) => c.slug === 'siakad-informatika');
    expect(siakad).toMatchObject({
      title: 'SIAKAD Informatika',
      tagline: 'Saya mengajar informatika di sekolah dasar. Sistem akademik yang saya gunakan, saya bangun sendiri.',
      scope: 'Sistem Akademik Ekstrakurikuler Informatika · SDN Ujung XIII',
      liveUrl: 'https://jurnal-mengajar-blond.vercel.app/',
      repositoryNote: 'Repositori privat untuk melindungi struktur data akademik siswa.'
    });
  });

  it('mengembalikan identitas SIAKAD Informatika untuk locale en', () => {
    const siakad = getAllCaseStudies('en').find((c) => c.slug === 'siakad-informatika');
    expect(siakad).toMatchObject({
      title: 'SIAKAD Informatika',
      tagline: 'I teach computing at a primary school. I built the academic system I use.',
      scope: 'Computing extracurricular academic system · SDN Ujung XIII',
      liveUrl: 'https://jurnal-mengajar-blond.vercel.app/',
      repositoryNote: 'Private repository to protect the structure of student academic data.'
    });
  });
});

describe('getCaseStudy', () => {
  it('mengembalikan studi kasus berdasarkan slug', () => {
    expect(getCaseStudy('city-courier', 'id').slug).toBe('city-courier');
  });

  it('melempar galat untuk slug tak dikenal', () => {
    expect(() => getCaseStudy('tidak-ada', 'id')).toThrow('Studi kasus tidak ditemukan: tidak-ada');
  });
});

describe('case study shape', () => {
  it.each(['id', 'en'] as const)('%s: every study has a thumbnail and eight sections', (locale) => {
    for (const cs of getAllCaseStudies(locale)) {
      expect(cs.thumbnail.src).toMatch(/^\/karya\//);
      expect(cs.thumbnail.alt.length).toBeGreaterThan(8);
      expect(cs.sections).toHaveLength(8);
      for (const s of cs.sections) expect(s.blocks.length).toBeGreaterThan(0);
    }
  });
});
