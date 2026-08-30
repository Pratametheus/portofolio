import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CaseStudyCard} from '@/components/case-study-card';
import type {CaseStudy} from '@/content/types';

const sample = {
  slug: 'siakad-informatika',
  title: 'SIAKAD Informatika',
  tagline: 'Saya mengajar informatika di sekolah dasar. Sistem akademik yang saya gunakan, saya bangun sendiri.',
  scope: 'Sistem Akademik Ekstrakurikuler Informatika · SDN Ujung XIII',
  liveUrl: 'https://jurnal-mengajar-blond.vercel.app/',
  repositoryNote: 'Repositori privat untuk melindungi struktur data akademik siswa.',
  year: 2026,
  stack: ['Next.js', 'Supabase'],
  featured: true
} satisfies CaseStudy;

describe('CaseStudyCard', () => {
  it('menampilkan judul dan tagline', () => {
    render(<CaseStudyCard caseStudy={sample} locale="id" />);
    expect(screen.getByRole('heading', {name: 'SIAKAD Informatika'})).toBeInTheDocument();
    expect(screen.getByText(sample.tagline)).toBeInTheDocument();
  });

  it('menampilkan cakupan produk dan keterangan repositori privat', () => {
    render(<CaseStudyCard caseStudy={sample} locale="id" />);
    expect(screen.getByText(sample.scope)).toBeInTheDocument();
    expect(screen.getByText(sample.repositoryNote)).toBeInTheDocument();
  });

  it('menampilkan setiap teknologi', () => {
    render(<CaseStudyCard caseStudy={sample} locale="id" />);
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Supabase')).toBeInTheDocument();
  });

  it('menautkan ke halaman studi kasus dengan prefiks locale', () => {
    render(<CaseStudyCard caseStudy={sample} locale="id" />);
    expect(screen.getByRole('link', {name: 'SIAKAD Informatika'})).toHaveAttribute(
      'href',
      '/id/work/siakad-informatika'
    );
  });

  it('menautkan ke aplikasi publik secara aman', () => {
    render(<CaseStudyCard caseStudy={sample} locale="id" />);
    expect(screen.getByRole('link', {name: 'Kunjungi aplikasi'})).toHaveAttribute(
      'href',
      sample.liveUrl
    );
    expect(screen.getByRole('link', {name: 'Kunjungi aplikasi'})).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  it('merender tahun dengan font monospace', () => {
    render(<CaseStudyCard caseStudy={sample} locale="id" />);
    expect(screen.getByText('2026')).toHaveClass('font-mono');
  });
});
