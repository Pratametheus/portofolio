import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {PublicationCover} from '@/components/publication-cover';

describe('PublicationCover', () => {
  it('renders the JUTIF label and volume', () => {
    render(<PublicationCover />);
    expect(screen.getByText('JUTIF')).toBeInTheDocument();
    expect(screen.getByText(/Vol\. 7 No\. 2 · 2026/)).toBeInTheDocument();
  });
});
