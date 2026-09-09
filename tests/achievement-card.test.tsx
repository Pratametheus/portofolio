import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({useTranslations: () => (k: string) => k}));

import {AchievementCard} from '@/components/achievement-card';

const item = {
  title: 'Judul Riset',
  issuer: 'JUTIF · Vol. 7 No. 2',
  year: '2026',
  type: 'Publikasi',
  category: 'Keamanan',
  description: 'Deskripsi lengkap.',
  url: 'https://doi.org/x'
} as const;

describe('AchievementCard', () => {
  it('shows title (h3), issuer, tags, DOI link, and reveals detail on expand', async () => {
    const user = userEvent.setup();
    render(<AchievementCard item={item} />);
    expect(
      screen.getByRole('heading', {level: 3, name: 'Judul Riset'})
    ).toBeInTheDocument();
    expect(screen.getByText('JUTIF · Vol. 7 No. 2')).toBeInTheDocument();
    expect(screen.getByText('SINTA 2')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /DOI/})).toHaveAttribute(
      'href',
      'https://doi.org/x'
    );
    expect(screen.queryByText('Deskripsi lengkap.')).not.toBeVisible();
    await user.click(screen.getByText('achievements.detailSummary'));
    expect(screen.getByText('Deskripsi lengkap.')).toBeVisible();
  });
});
