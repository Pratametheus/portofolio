import {describe, expect, it, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ParallaxY} from '@/components/motion/parallax-y';

function mockReducedMotion(v: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: v && q.includes('reduce'), media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(), onchange: null
  }));
}
beforeEach(() => mockReducedMotion(false));

describe('ParallaxY', () => {
  it('renders its children', () => {
    render(
      <ParallaxY>
        <span>art</span>
      </ParallaxY>
    );
    expect(screen.getByText('art')).toBeVisible();
  });

  it('gives the moving layer a filled, positioned box so wrapped media can size to it', () => {
    const {container} = render(
      <ParallaxY>
        <span>art</span>
      </ParallaxY>
    );
    expect(container.querySelector('.relative.h-full.w-full')).not.toBeNull();
  });

  it('under prefers-reduced-motion applies no y transform', () => {
    mockReducedMotion(true);
    const {container} = render(
      <ParallaxY>
        <span>art</span>
      </ParallaxY>
    );
    expect(screen.getByText('art')).toBeVisible();
    expect(container.querySelector('[style*="translate"]')).toBeNull();
  });
});
