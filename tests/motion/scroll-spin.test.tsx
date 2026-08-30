import {describe, expect, it, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ScrollSpin} from '@/components/motion/scroll-spin';

function mockReducedMotion(v: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: v && q.includes('reduce'), media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(), onchange: null
  }));
}
beforeEach(() => mockReducedMotion(false));

describe('ScrollSpin', () => {
  it('renders its children', () => {
    render(
      <ScrollSpin>
        <span>art</span>
      </ScrollSpin>
    );
    expect(screen.getByText('art')).toBeVisible();
  });

  it('gives the rotating layer a filled, positioned box so wrapped media can size to it', () => {
    const {container} = render(
      <ScrollSpin>
        <span>art</span>
      </ScrollSpin>
    );
    expect(container.querySelector('.relative.h-full.w-full')).not.toBeNull();
  });

  it('under prefers-reduced-motion applies no rotate transform', () => {
    mockReducedMotion(true);
    const {container} = render(
      <ScrollSpin>
        <span>art</span>
      </ScrollSpin>
    );
    expect(screen.getByText('art')).toBeVisible();
    expect(container.querySelector('[style*="rotate"]')).toBeNull();
  });
});
