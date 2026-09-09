import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) =>
    ({
      'skills.title': 'Keahlian',
      'skills.description': 'Teknologi',
      'skills.filterLabel': 'Filter kategori keahlian',
      'skills.groups.semua': 'Semua',
      'skills.groups.frontend': 'Frontend',
      'skills.groups.backend': 'Backend',
      'skills.groups.mobile': 'Mobile',
      'skills.groups.database': 'Database',
      'skills.groups.tools': 'Tools'
    }[k] ?? k)
}));

import {SkillList} from '@/components/skill-list';

describe('SkillList', () => {
  it('shows all skills by default and filters to a group on click', async () => {
    const user = userEvent.setup();
    render(<SkillList />);
    // 12 skills visible under "Semua"
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
    await user.click(screen.getByRole('button', {name: /Backend/}));
    // only Laravel is Backend
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Laravel');
    expect(screen.getByRole('button', {name: /Backend/})).toHaveAttribute('aria-pressed', 'true');
  });

  it('each badge references its /tech/<slug>.svg asset', () => {
    render(<SkillList />);
    const react = screen.getByText('React').closest('li');
    expect(react?.querySelector('img')).toHaveAttribute('src', '/tech/react.svg');
  });
});
