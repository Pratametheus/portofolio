import {describe, expect, it} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {GlareCard} from '@/components/motion/glare-card';

describe('GlareCard', () => {
  it('renders its children', () => {
    render(
      <GlareCard>
        <span>content</span>
      </GlareCard>
    );
    expect(screen.getByText('content')).toBeVisible();
  });

  it('has a positioned root and an aria-hidden, non-interactive glare layer', () => {
    const {container} = render(<GlareCard>x</GlareCard>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('relative');
    const glare = root.querySelector('[aria-hidden="true"]');
    expect(glare).not.toBeNull();
    expect(glare).toHaveClass('pointer-events-none');
  });

  it('updates the --glare-x/--glare-y custom properties on pointer move', () => {
    const {container} = render(<GlareCard>x</GlareCard>);
    const root = container.firstElementChild as HTMLElement;
    fireEvent.pointerMove(root, {clientX: 10, clientY: 20});
    expect(root.style.getPropertyValue('--glare-x')).not.toBe('');
    expect(root.style.getPropertyValue('--glare-y')).not.toBe('');
  });
});
