import {describe, expect, it, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Counter} from '@/components/motion/counter';

function mockReducedMotion(v: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: v && q.includes('reduce'), media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(), onchange: null
  }));
}
beforeEach(() => mockReducedMotion(false));

describe('Counter', () => {
  it('renders the final value in the DOM on first render (SSR / no-JS)', () => {
    render(<Counter to={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });
  it('applies the format function to the displayed value', () => {
    render(<Counter to={1200} format={(n) => n.toLocaleString('en-US')} />);
    expect(screen.getByText('1,200')).toBeInTheDocument();
  });
  it('under prefers-reduced-motion shows the target immediately', () => {
    mockReducedMotion(true);
    render(<Counter to={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
