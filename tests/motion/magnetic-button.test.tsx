import {describe, expect, it, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {MagneticButton} from '@/components/motion/magnetic-button';

function mockReducedMotion(v: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: v && q.includes('reduce'), media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(), onchange: null
  }));
}
beforeEach(() => mockReducedMotion(false));

describe('MagneticButton', () => {
  it('renders a link with the given href and text when href is set', () => {
    render(<MagneticButton href="/kontak">Hubungi</MagneticButton>);
    expect(screen.getByRole('link', {name: 'Hubungi'})).toHaveAttribute('href', '/kontak');
  });

  it('renders a type=button that fires onClick when no href is given', () => {
    const onClick = vi.fn();
    render(<MagneticButton onClick={onClick}>Kirim</MagneticButton>);
    const btn = screen.getByRole('button', {name: 'Kirim'});
    expect(btn).toHaveAttribute('type', 'button');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('under prefers-reduced-motion applies no translate transform after a pointer move', () => {
    mockReducedMotion(true);
    render(<MagneticButton href="/x">Go</MagneticButton>);
    const link = screen.getByRole('link', {name: 'Go'});
    fireEvent.pointerMove(link, {clientX: 100, clientY: 100});
    expect(link.getAttribute('style') ?? '').not.toContain('translate');
  });
});
