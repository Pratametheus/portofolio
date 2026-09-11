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
});
