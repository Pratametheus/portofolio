import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {PageHeading} from '@/components/page-heading';

describe('PageHeading', () => {
  it('renders one h1, lead paragraph, and structural solid divider', () => {
    const {container} = render(<PageHeading title="Karya" description="Aplikasi yang saya bangun." />);
    expect(screen.getByRole('heading', {level: 1, name: 'Karya'})).toBeInTheDocument();
    expect(screen.getByText('Aplikasi yang saya bangun.')).toBeInTheDocument();
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header?.className).toContain('border-b');
    expect(header?.className).toContain('border-border');
    expect(header?.className).not.toContain('border-dashed');
  });
});
