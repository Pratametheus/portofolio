import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {ClickSpark} from '@/components/effects/click-spark';
import {TrueFocus} from '@/components/effects/true-focus';
import {SpotlightCard} from '@/components/effects/spotlight-card';
import {DecryptedText} from '@/components/effects/decrypted-text';

describe('ClickSpark', () => {
  it('renders children and mounts canvas without crash', () => {
    const {container} = render(
      <ClickSpark>
        <div>Konten anak</div>
      </ClickSpark>
    );
    expect(screen.getByText('Konten anak')).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });
});

describe('TrueFocus', () => {
  it('renders the given sentence as span words', () => {
    render(<TrueFocus sentence="Keamanan yang diuji" />);
    expect(screen.getByText('Keamanan')).toBeInTheDocument();
    expect(screen.getByText('yang')).toBeInTheDocument();
    expect(screen.getByText('diuji')).toBeInTheDocument();
  });
});

describe('SpotlightCard', () => {
  it('renders children with relative container', () => {
    render(
      <SpotlightCard className="test-card">
        <div>Kartu proyek</div>
      </SpotlightCard>
    );
    expect(screen.getByText('Kartu proyek')).toBeInTheDocument();
  });
});

describe('DecryptedText', () => {
  it('renders text content accurately', () => {
    render(<DecryptedText text="Security Assessment" />);
    expect(screen.getByText('Security Assessment')).toBeInTheDocument();
  });
});
