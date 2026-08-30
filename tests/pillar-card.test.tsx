import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {PillarCard} from '@/components/pillar-card';

describe('PillarCard', () => {
  it('renders its authored icon, title, and body', () => {
    const {container} = render(
      <PillarCard
        icon="teach"
        title="Teach · Mengajar & berbagi"
        body="Materi dan sistem yang tumbuh dari kebutuhan kelas."
      />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Teach · Mengajar & berbagi'})).toBeInTheDocument();
    expect(screen.getByText('Materi dan sistem yang tumbuh dari kebutuhan kelas.')).toBeInTheDocument();
  });
});
