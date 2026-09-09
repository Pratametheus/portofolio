import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  getPathname: ({href}: any) => (typeof href === 'string' ? href : `/karya/${href.params.slug}`)
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => k
}));

import {WorkCard} from '@/components/work-card';

const cs = {
  slug: 'city-courier', title: 'City Courier', tagline: 'Kurir + keamanan.',
  year: 2026, stack: ['Flutter', 'Laravel'], featured: true, type: 'Mobile', topic: 'Keamanan',
  thumbnail: {src: '/karya/city-courier.webp', alt: 'x'}, sections: []
} as any;

describe('WorkCard', () => {
  it('links the cover + title to the localised case study and shows topic · type', () => {
    render(<WorkCard caseStudy={cs} locale="id" />);
    const links = screen.getAllByRole('link');
    expect(links.every((a) => a.getAttribute('href') === '/karya/city-courier')).toBe(true);
    expect(screen.getByRole('heading', {level: 3, name: 'City Courier'})).toBeInTheDocument();
    expect(screen.getByText(/Keamanan · Mobile/)).toBeInTheDocument();
  });

  it('shows the featured label only when featured', () => {
    render(<WorkCard caseStudy={{...cs, featured: false}} locale="id" />);
    expect(screen.queryByText('work.featuredLabel')).toBeNull();
  });

  it('renders the cover image from /karya and tech logos from /tech', () => {
    render(<WorkCard caseStudy={cs} locale="id" />);
    expect(screen.getByAltText('x')).toHaveAttribute('src', '/karya/city-courier.webp');
    expect(screen.getByAltText('Flutter')).toHaveAttribute('src', '/tech/flutter.svg');
  });
});
