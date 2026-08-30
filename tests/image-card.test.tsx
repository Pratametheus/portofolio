import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';

vi.mock('next/image', () => ({
  default: (p: any) => <img alt={p.alt} src={typeof p.src === 'string' ? p.src : p.src.src} />
}));
vi.mock('@/i18n/navigation', () => ({
  getPathname: ({href}: any) => (typeof href === 'string' ? href : `/karya/${href.params.slug}`),
  Link: ({children, href}: any) => <a href={href}>{children}</a>
}));

import {ImageCard} from '@/components/image-card';

const cs = {
  slug: 'city-courier',
  title: 'City Courier',
  tagline: 'JWKS, diserang lalu diterbitkan.',
  year: 2026,
  stack: ['Flutter', 'Laravel'],
  featured: true,
  liveUrl: undefined,
  thumbnail: {src: '/karya/city-courier.webp', alt: 'Ilustrasi City Courier'},
  sections: []
} as any;

describe('ImageCard', () => {
  it('renders the thumbnail alt, title link, year and tags', () => {
    render(<ImageCard caseStudy={cs} locale="id" />);
    expect(screen.getByRole('img', {name: 'Ilustrasi City Courier'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'City Courier'})).toHaveAttribute(
      'href',
      '/karya/city-courier'
    );
    expect(screen.getByText('2026')).toHaveClass('font-mono');
    expect(screen.getByText('Flutter')).toBeInTheDocument();
  });

  it('omits the visit link when there is no liveUrl', () => {
    render(<ImageCard caseStudy={cs} locale="id" />);
    expect(screen.queryByRole('link', {name: /kunjungi/i})).toBeNull();
  });
});
