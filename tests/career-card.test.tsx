import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({useTranslations: () => (k: string) => k}));
import {CareerCard, Timeline} from '@/components/career-card';

const entry = {role: 'Guru Informatika', organization: 'SDN Ujung XIII/38', period: 'Mulai April 2026', category: 'Pendidikan', mark: 'SD', description: 'Mengajar kelas 4-6.'};

describe('CareerCard', () => {
  it('shows role, org, period · category, and reveals the description on expand', async () => {
    const user = userEvent.setup();
    render(<CareerCard entry={entry} />);
    expect(screen.getByRole('heading', {level: 3, name: 'Guru Informatika'})).toBeInTheDocument();
    expect(screen.getByText('SDN Ujung XIII/38')).toBeInTheDocument();
    expect(screen.getByText(/Mulai April 2026 · Pendidikan/)).toBeInTheDocument();
    expect(screen.queryByText('Mengajar kelas 4-6.')).not.toBeVisible();
    await user.click(screen.getByText('about.career.detailSummary'));
    expect(screen.getByText('Mengajar kelas 4-6.')).toBeVisible();
  });
});

describe('Timeline', () => {
  it('renders a card per entry, or the fallback when empty', () => {
    const {rerender} = render(<Timeline entries={[entry]} />);
    expect(screen.getByRole('heading', {level: 3, name: 'Guru Informatika'})).toBeInTheDocument();
    rerender(<Timeline entries={[]}>{<p>empty-fallback</p>}</Timeline>);
    expect(screen.getByText('empty-fallback')).toBeInTheDocument();
  });
});
