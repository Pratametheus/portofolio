import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({useTranslations: () => (k: string) => k}));
vi.mock('@/i18n/navigation', () => ({getPathname: ({href}: any) => `/karya/${href.params.slug}`}));

import {PublicationListCard, PaperStory} from '@/components/publication-list-card';

const item = {title: 'Judul Riset', issuer: 'JUTIF · Vol. 7 No. 2', year: '2026', type: 'Publikasi', category: 'Keamanan', description: 'Deskripsi.', url: 'https://doi.org/x'} as const;

describe('PublicationListCard', () => {
  it('renders the title as an h3 linking to href, plus the CTA', () => {
    render(<PublicationListCard item={item as never} href="/id/riset/paper" />);
    const heading = screen.getByRole('heading', {level: 3, name: 'Judul Riset'});
    expect(heading.querySelector('a')).toHaveAttribute('href', '/id/riset/paper');
    expect(screen.getByText(/research\.listCardCta/)).toBeInTheDocument();
  });
});

describe('PaperStory', () => {
  it('renders four sections and links the publisher + related project', () => {
    render(<PaperStory item={item as never} locale="id" />);
    expect(screen.getAllByRole('heading', {level: 2})).toHaveLength(4);
    expect(screen.getByRole('link', {name: /research\.paper\.readAtPublisher/})).toHaveAttribute('href', 'https://doi.org/x');
    expect(screen.getByRole('link', {name: /City Courier/})).toHaveAttribute('href', '/karya/city-courier');
  });
});
