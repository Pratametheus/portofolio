import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({useTranslations: () => (k: string) => k}));

import {PublicationCover} from '@/components/publication-cover';

describe('PublicationCover', () => {
  it('renders the JUTIF label and volume', () => {
    render(<PublicationCover />);
    expect(screen.getByText('JUTIF')).toBeInTheDocument();
    expect(screen.getByText(/Vol\. 7 No\. 2 · 2026/)).toBeInTheDocument();
  });

  it('renders the cover label via i18n, not a hard-coded string', () => {
    render(<PublicationCover />);
    expect(screen.getByText('achievements.coverLabel')).toBeInTheDocument();
  });

  it('renders the uploaded cover image instead of the hard-coded graphic when coverUrl is given', () => {
    const {container} = render(
      <PublicationCover coverUrl="https://example.r2.dev/achievement-covers/abc.png" />
    );
    // The cover image has alt="" (decorative), which gives it an implicit ARIA
    // role of "presentation" rather than "img" — so it's queried directly
    // rather than via getByRole.
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.r2.dev/achievement-covers/abc.png');
    expect(screen.queryByText('JUTIF')).not.toBeInTheDocument();
  });

  it('renders the existing hard-coded graphic when coverUrl is absent', () => {
    const {container} = render(<PublicationCover />);
    expect(screen.getByText('JUTIF')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });
});
