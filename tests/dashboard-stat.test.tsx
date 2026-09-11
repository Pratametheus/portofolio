import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
vi.mock('next-intl', () => ({useTranslations: () => (k: string) => k}));
vi.mock('@/i18n/navigation', () => ({getPathname: ({href}: any) => `/karya/${href.params.slug}`}));
import {DashboardStat, RepoGrid} from '@/components/dashboard-stat';

describe('DashboardStat', () => {
  it('renders an em dash value and the not-connected note — no numbers', () => {
    render(<DashboardStat label="Pengikut" />);
    expect(screen.getByText('Pengikut')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('dashboard.notConnected')).toBeInTheDocument();
  });
});

describe('RepoGrid', () => {
  it('links each case study by localised slug', () => {
    const cs = [{slug: 'mochitoon', title: 'MochiToon', tagline: 't', stack: ['React'], sections: []}] as any[];
    render(<RepoGrid caseStudies={cs} locale="id" />);
    expect(screen.getByRole('link', {name: /MochiToon/})).toHaveAttribute('href', '/karya/mochitoon');
  });
});
