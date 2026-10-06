import {describe, expect, it, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Reveal, Stagger} from '@/components/motion/reveal';

function mockReducedMotion(v: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: v && q.includes('reduce'), media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(), onchange: null
  }));
}
beforeEach(() => mockReducedMotion(false));

describe('Reveal', () => {
  it('renders its children (visible, in the DOM) regardless of scroll', () => {
    render(<Reveal>hello world</Reveal>);
    expect(screen.getByText('hello world')).toBeVisible();
  });
  it('renders the requested element tag', () => {
    render(<Reveal as="section">x</Reveal>);
    expect(screen.getByText('x').closest('section')).toBeInTheDocument();
  });
  it('under prefers-reduced-motion renders a plain element with no inline opacity:0', () => {
    mockReducedMotion(true);
    const {container} = render(<Reveal>y</Reveal>);
    expect(container.firstElementChild?.getAttribute('style') ?? '').not.toContain('opacity: 0');
  });
});
describe('Stagger', () => {
  it('renders all children', () => {
    render(<Stagger><Reveal>a</Reveal><Reveal>b</Reveal></Stagger>);
    expect(screen.getByText('a')).toBeVisible();
    expect(screen.getByText('b')).toBeVisible();
  });

  it('under prefers-reduced-motion keeps every revealed child in its final visible state', () => {
    mockReducedMotion(true);
    const {container} = render(
      <Stagger>
        <Reveal>first record</Reveal>
        <Reveal>second record</Reveal>
        <Reveal>third record</Reveal>
      </Stagger>
    );

    for (const name of ['first record', 'second record', 'third record']) {
      const child = screen.getByText(name);
      expect(child).toBeVisible();
      expect(child.getAttribute('style') ?? '').not.toMatch(/opacity:\s*(?:0|0\.0+)/);
      expect(child.getAttribute('style') ?? '').not.toContain('transform: translateY');
    }
    expect(container.firstElementChild?.getAttribute('style') ?? '').not.toMatch(/opacity:\s*(?:0|0\.0+)/);
  });
});
