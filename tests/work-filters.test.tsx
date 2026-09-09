import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  getPathname: ({href}: any) => (typeof href === 'string' ? href : `/karya/${href.params.slug}`)
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === 'work.count') return `${values?.n ?? ''} karya`;
    const labels: Record<string, string> = {
      'work.filters.typeLabel': 'Tipe',
      'work.filters.categoryLabel': 'Kategori',
      'work.filters.type.semua': 'Semua',
      'work.filters.type.web': 'Web',
      'work.filters.type.mobile': 'Mobile',
      'work.filters.category.semua': 'Semua',
      'work.filters.category.pendidikan': 'Pendidikan',
      'work.filters.category.keamanan': 'Keamanan',
      'work.filters.category.penulisan': 'Penulisan'
    };
    return labels[key] ?? key;
  }
}));

import {WorkFilters} from '@/components/work-filters';

const list = [
  {slug: 'a', title: 'A', tagline: '', year: 2026, stack: [], featured: true, type: 'Web', topic: 'Pendidikan', thumbnail: {src: '', alt: 'a'}, sections: []},
  {slug: 'b', title: 'B', tagline: '', year: 2026, stack: [], featured: false, type: 'Mobile', topic: 'Keamanan', thumbnail: {src: '', alt: 'b'}, sections: []}
] as any[];

describe('WorkFilters', () => {
  it('counts all by default then narrows by type', async () => {
    const user = userEvent.setup();
    render(<WorkFilters caseStudies={list} locale="id" />);
    expect(screen.getByRole('status')).toHaveTextContent('2');
    await user.click(screen.getByRole('button', {name: 'Mobile'}));
    expect(screen.getByRole('status')).toHaveTextContent('1');
    expect(screen.getByRole('heading', {name: 'B'})).toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'A'})).toBeNull();
  });

  it('shows the empty state for an impossible combination', async () => {
    const user = userEvent.setup();
    render(<WorkFilters caseStudies={list} locale="id" />);
    await user.click(screen.getByRole('button', {name: 'Mobile'}));
    await user.click(screen.getByRole('button', {name: 'Pendidikan'}));
    expect(screen.getByText('work.empty.title')).toBeInTheDocument();
  });
});
