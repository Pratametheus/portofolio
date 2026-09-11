import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {RecordTags} from '@/components/record-tags';

describe('RecordTags', () => {
  it('renders one pill per tag', () => {
    render(<RecordTags tags={['Publikasi', 'Keamanan', 'SINTA 2']} />);
    expect(screen.getByText('Publikasi')).toBeInTheDocument();
    expect(screen.getByText('Keamanan')).toBeInTheDocument();
    expect(screen.getByText('SINTA 2')).toBeInTheDocument();
  });
});
