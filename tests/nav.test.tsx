import {describe, expect, it, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/karya',
  Link: ({children, href, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  )
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) =>
    ({home: 'Beranda', about: 'Tentang', work: 'Karya', research: 'Riset', achievements: 'Pencapaian', guestbook: 'Buku Tamu', contact: 'Kontak', links: 'Links'}[k] ?? k)
}));

import Nav from '@/components/nav';

describe('Nav', () => {
  it('renders eight numbered items', () => {
    render(<Nav />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(8);
    expect(within(links[0]).getByText('01')).toBeInTheDocument();
  });
  it('marks the active route with aria-current', () => {
    render(<Nav />);
    expect(screen.getByRole('link', {name: /Karya/}).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', {name: /Beranda/}).getAttribute('aria-current')).toBeNull();
  });

  it('renders exactly one sliding indicator, inside the active item', () => {
    render(<Nav />);
    const indicators = screen.getAllByTestId('nav-indicator');
    expect(indicators).toHaveLength(1);
    expect(screen.getByRole('link', {name: /Karya/})).toContainElement(indicators[0]);
  });
});
