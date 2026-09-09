import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {SectionHead} from '@/components/section-head';

describe('SectionHead', () => {
  it('renders the title as an h2 and the optional description', () => {
    render(<SectionHead title="Keahlian" description="Teknologi yang digunakan" />);
    expect(screen.getByRole('heading', {level: 2, name: /Keahlian/})).toBeInTheDocument();
    expect(screen.getByText('Teknologi yang digunakan')).toBeInTheDocument();
  });

  it('renders the aside node when given', () => {
    render(<SectionHead title="x" aside={<a href="/y">Semua →</a>} />);
    expect(screen.getByRole('link', {name: 'Semua →'})).toBeInTheDocument();
  });

  it('renders a leading icon when the icon prop is given', () => {
    const {container} = render(<SectionHead icon="work" title="Karya" />);
    expect(container.querySelector('h2 svg')).toBeInTheDocument();
  });
});
