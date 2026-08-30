import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {Noise} from '@/components/motion/noise';

describe('Noise', () => {
  it('renders a single decorative, non-interactive overlay with no text', () => {
    const {container} = render(<Noise />);
    expect(container.querySelectorAll('*')).toHaveLength(1);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.className).toContain('pointer-events-none');
    expect(el).not.toHaveAttribute('tabindex');
    expect(el.textContent).toBe('');
  });
});
