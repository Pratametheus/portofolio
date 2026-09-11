import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) =>
    ({
      title: 'Ada yang ingin dikerjakan bersama?',
      description: 'Produk, kelas, atau riset. Mulai dari konteksnya.',
      githubCta: 'Temui saya di GitHub',
      copyright: '© 2026 Ferry Andhika Pratama'
    }[k] ?? k)
}));

import {SiteFooter} from '@/components/site-footer';

describe('SiteFooter', () => {
  it('renders the title as an h2, the description, and a copyright line', () => {
    render(<SiteFooter />);
    expect(screen.getByRole('heading', {level: 2, name: 'Ada yang ingin dikerjakan bersama?'})).toBeInTheDocument();
    expect(screen.getByText('Produk, kelas, atau riset. Mulai dari konteksnya.')).toBeInTheDocument();
    expect(screen.getByText('© 2026 Ferry Andhika Pratama')).toBeInTheDocument();
  });

  it('links to GitHub in a new tab', () => {
    render(<SiteFooter />);
    const link = screen.getByRole('link', {name: /Temui saya di GitHub/});
    expect(link).toHaveAttribute('href', 'https://github.com/Pratametheus');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
