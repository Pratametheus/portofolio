import {describe, expect, it, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('switches the document theme and persists it', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole('button', {name: /terang|light/i}));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('ruang-kerja-theme')).toBe('light');
    expect(screen.getByRole('button', {name: /terang|light/i})).toHaveAttribute('aria-pressed', 'true');
  });
});
