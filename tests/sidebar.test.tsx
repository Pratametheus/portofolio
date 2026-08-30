import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({replace: vi.fn()}),
  Link: ({children, href, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'id',
  useTranslations: (namespace: string) => (key: string) => {
    const messages: Record<string, string> = {
      'sidebar.role': 'Software Engineer · Guru Informatika',
      'nav.home': 'Beranda',
      'nav.about': 'Tentang',
      'nav.work': 'Karya',
      'nav.research': 'Riset',
      'nav.achievements': 'Pencapaian',
      'nav.guestbook': 'Buku Tamu',
      'nav.contact': 'Kontak',
      'nav.links': 'Links'
    };
    return messages[`${namespace}.${key}`] ?? key;
  }
}));

import Sidebar from '@/components/sidebar';

describe('Sidebar', () => {
  it('renders navigation and both preference toggles', () => {
    render(<Sidebar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('group', {name: 'Tema'})).toBeInTheDocument();
    expect(screen.getByRole('group', {name: 'Bahasa'})).toBeInTheDocument();
  });

  it('opens the mobile drawer and closes it with Escape', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    const trigger = screen.getByRole('button', {name: /menu/i});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
