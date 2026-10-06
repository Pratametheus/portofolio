import {describe, expect, it, beforeEach, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) =>
    ({
      'sidebar.themeGroupLabel': 'Tema',
      'sidebar.themeNight': 'Malam',
      'sidebar.themeLight': 'Terang'
    })[k] ?? k
}));

import ThemeToggle, {resolveInitialTheme} from '@/components/theme-toggle';

describe('resolveInitialTheme', () => {
  it('prefers a valid stored value', () => {
    expect(resolveInitialTheme('light', false)).toBe('light');
    expect(resolveInitialTheme('night', true)).toBe('night');
  });
  it('falls back to the OS preference when unset', () => {
    expect(resolveInitialTheme(null, true)).toBe('light');
    expect(resolveInitialTheme(null, false)).toBe('night');
  });
  it('ignores a junk stored value', () => {
    expect(resolveInitialTheme('banana', true)).toBe('light');
  });
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'night';
    localStorage.clear();
  });
  it('renders a labelled group with two options', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('group', {name: /tema/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /terang|light/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /gelap|malam|night|dark/i})).toBeInTheDocument();
  });
  it('persists both selections and updates their pressed state', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const light = screen.getByRole('button', {name: /terang|light/i});
    const night = screen.getByRole('button', {name: /gelap|malam|night|dark/i});

    await user.click(light);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('ruang-kerja-theme')).toBe('light');
    expect(light).toHaveAttribute('aria-pressed', 'true');
    expect(night).toHaveAttribute('aria-pressed', 'false');

    await user.click(night);
    expect(document.documentElement.dataset.theme).toBe('night');
    expect(localStorage.getItem('ruang-kerja-theme')).toBe('night');
    expect(light).toHaveAttribute('aria-pressed', 'false');
    expect(night).toHaveAttribute('aria-pressed', 'true');
  });
});
