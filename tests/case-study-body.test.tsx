import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CaseStudyBody} from '@/components/case-study-body';
import type {CaseStudySection} from '@/content/types';

const sections: CaseStudySection[] = [
  {
    heading: 'Problem',
    blocks: [
      {type: 'p', text: 'Dokumen tersebar.'},
      {type: 'list', items: ['Sulit dicari', 'Cepat tertinggal']}
    ]
  },
  {
    heading: 'Impact',
    blocks: [
      {type: 'table', rows: [['Sebelum', 'Sesudah']]},
      {type: 'quote', text: 'Dipakai setiap minggu.'}
    ]
  }
];

describe('CaseStudyBody', () => {
  it('renders section headings and mixed block types', () => {
    render(<CaseStudyBody sections={sections} />);

    expect(screen.getAllByRole('heading', {level: 2})).toHaveLength(2);
    expect(screen.getByText('Sulit dicari')).toBeInTheDocument();
    expect(screen.getByText('Cepat tertinggal')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Sebelum')).toBeInTheDocument();
    expect(screen.getByText('Sesudah')).toBeInTheDocument();
  });
});
