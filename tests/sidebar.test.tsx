import {afterEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {act} from 'react';
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
  useTranslations: (namespace?: string) => (key: string) => {
    const messages: Record<string, string> = {
      'sidebar.name': 'Ferry Andhika Pratama',
      'sidebar.role': 'Software Engineer · Guru Informatika',
      'sidebar.availability': 'Terbuka untuk kolaborasi',
      'sidebar.railNote': 'Membangun · Mengajar · Menguji',
      'sidebar.themeGroupLabel': 'Tema',
      'sidebar.themeNight': 'Malam',
      'sidebar.themeLight': 'Terang',
      'sidebar.localeGroupLabel': 'Bahasa',
      'nav.home': 'Beranda',
      'nav.about': 'Tentang',
      'nav.work': 'Karya',
      'nav.research': 'Riset',
      'nav.achievements': 'Pencapaian',
      'nav.guestbook': 'Buku Tamu',
      'nav.contact': 'Kontak',
      'nav.links': 'Links'
    };
    return messages[namespace ? `${namespace}.${key}` : key] ?? key;
  }
}));

import Sidebar from '@/components/sidebar';

let setDesktopViewport: ((matches: boolean) => void) | undefined;

afterEach(() => {
  setDesktopViewport = undefined;
  vi.unstubAllGlobals();
});

function stubViewport(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  vi.stubGlobal('matchMedia', vi.fn(() => ({
    get matches() {
      return matches;
    },
    media: '(min-width: 1024px)',
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
    addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
    removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
    dispatchEvent: () => true
  })));

  setDesktopViewport = (nextMatches) => {
    matches = nextMatches;
    const event = {matches, media: '(min-width: 1024px)'} as MediaQueryListEvent;
    listeners.forEach((listener) => listener(event));
  };
}

describe('Sidebar', () => {
  it('includes the visible wordmark in the mobile home link accessible name', () => {
    render(<Sidebar />);
    expect(screen.getByRole('link', {name: 'ferry. — Beranda'})).toHaveAttribute('href', '/');
  });

  it('renders navigation and both preference toggles', () => {
    stubViewport(true);
    render(<Sidebar />);
    expect(screen.getByRole('navigation', {name: 'Navigasi utama'})).toBeInTheDocument();
    expect(screen.getByRole('group', {name: 'Tema'})).toBeInTheDocument();
    expect(screen.getByRole('group', {name: 'Bahasa'})).toBeInTheDocument();
  });

  it('renders the rail identity, availability, github link and note', () => {
    stubViewport(true);
    render(<Sidebar />);
    expect(screen.getByText('Ferry Andhika Pratama')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Terbuka untuk kolaborasi/})).toHaveAttribute(
      'href',
      expect.stringContaining('/kontak')
    );
    const gh = screen.getByRole('link', {name: /Pratametheus/});
    expect(gh).toHaveAttribute('href', 'https://github.com/Pratametheus');
    expect(screen.getByText('Membangun · Mengajar · Menguji')).toBeInTheDocument();
  });

  it('keeps a closed mobile drawer out of the accessibility tree and tab order', () => {
    stubViewport(false);
    render(<Sidebar />);

    const drawer = document.getElementById('sidebar-drawer');
    expect(drawer).toHaveAttribute('aria-hidden', 'true');
    expect(drawer).toHaveAttribute('inert');
    expect(screen.queryByRole('navigation', {name: 'Navigasi utama'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Malam'})).not.toBeInTheDocument();
  });

  it('clears mobile modal semantics when the viewport becomes desktop-sized', async () => {
    stubViewport(false);
    const user = userEvent.setup();
    render(<Sidebar />);

    await user.click(screen.getByRole('button', {name: /menu/i}));
    expect(screen.getByRole('dialog', {name: 'Menu'})).toHaveAttribute('aria-modal', 'true');

    act(() => setDesktopViewport?.(true));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: 'Menu'})).not.toBeInTheDocument();
    });
    expect(document.getElementById('sidebar-drawer')).not.toHaveAttribute('aria-modal');
  });

  it('opens a labelled drawer and restores trigger focus after backdrop close', async () => {
    stubViewport(false);
    const user = userEvent.setup();
    render(<Sidebar />);
    const trigger = screen.getByRole('button', {name: /menu/i});

    await user.click(trigger);
    expect(screen.getByRole('dialog', {name: 'Menu'})).toBeInTheDocument();
    expect(document.activeElement).not.toBe(trigger);

    await user.click(screen.getByRole('button', {name: 'Tutup navigasi'}));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes the mobile drawer with Escape and restores trigger focus', async () => {
    stubViewport(false);
    const user = userEvent.setup();
    render(<Sidebar />);
    const trigger = screen.getByRole('button', {name: /menu/i});
    await user.click(trigger);

    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });
});
