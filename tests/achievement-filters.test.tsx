import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string, vals?: Record<string, unknown>) =>
    vals ? `${k}:${JSON.stringify(vals)}` : k
}));

import {AchievementFilters} from '@/components/achievement-filters';

const items = [
  {
    title: 'Alpha Security',
    issuer: 'JUTIF',
    year: '2026',
    type: 'Publikasi',
    category: 'Keamanan',
    description: 'a'
  },
  {
    title: 'Beta Teaching',
    issuer: 'Konf',
    year: '2025',
    type: 'Sertifikat',
    category: 'Pendidikan',
    description: 'b'
  }
] as const;

describe('AchievementFilters', () => {
  it('filters by search text and shows the empty state + reset', async () => {
    const user = userEvent.setup();
    render(<AchievementFilters items={items as never} />);
    expect(screen.getByRole('status')).toHaveTextContent('2');
    await user.type(
      screen.getByLabelText('achievements.filters.searchLabel'),
      'zzz-no-match'
    );
    expect(screen.getByText('achievements.empty.title')).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'achievements.reset'}));
    expect(screen.getByRole('status')).toHaveTextContent('2');
  });

  it('filters by the Jenis select', async () => {
    const user = userEvent.setup();
    render(<AchievementFilters items={items as never} />);
    await user.selectOptions(
      screen.getByLabelText('achievements.filters.typeLabel'),
      'Sertifikat'
    );
    expect(screen.getByRole('status')).toHaveTextContent('1');
    expect(
      screen.getByRole('heading', {name: 'Beta Teaching'})
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {name: 'Alpha Security'})
    ).toBeNull();
  });
});
