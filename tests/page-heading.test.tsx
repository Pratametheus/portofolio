import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {PageHeading} from '@/components/page-heading';

describe('PageHeading', () => {
  it('renders one h1 and the lead paragraph', () => {
    render(<PageHeading title="Karya" description="Aplikasi yang saya bangun." />);
    expect(screen.getByRole('heading', {level: 1, name: 'Karya'})).toBeInTheDocument();
    expect(screen.getByText('Aplikasi yang saya bangun.')).toBeInTheDocument();
  });
});
