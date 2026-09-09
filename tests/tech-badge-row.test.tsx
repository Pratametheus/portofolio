import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {TechBadgeRow} from '@/components/tech-badge-row';

describe('TechBadgeRow', () => {
  it('renders one lazy img per slug pointing at /tech/', () => {
    render(<TechBadgeRow slugs={['nextjs', 'react', 'supabase']} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs).toHaveLength(3);
    expect(imgs[0]).toHaveAttribute('src', '/tech/nextjs.svg');
    expect(imgs[0]).toHaveAttribute('loading', 'lazy');
  });
});
