import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {DataEmpty} from '@/components/data-empty';

describe('DataEmpty', () => {
  it('renders the title (h3), description, and optional action with flat border', () => {
    const {container} = render(
      <DataEmpty
        title="Belum ada"
        description="Nanti muncul di sini."
        action={<button>Reset</button>}
      />
    );
    expect(screen.getByRole('heading', {level: 3, name: 'Belum ada'})).toBeInTheDocument();
    expect(screen.getByText('Nanti muncul di sini.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Reset'})).toBeInTheDocument();
    const box = container.firstElementChild;
    expect(box?.className).toContain('border');
    expect(box?.className).toContain('border-border');
    expect(box?.className).not.toContain('border-dashed');
  });

  it('supports headingLevel 2 for semantic landmarks', () => {
    render(
      <DataEmpty
        title="Belum ada catatan"
        description="Koleksi kosong."
        headingLevel={2}
      />
    );
    expect(screen.getByRole('heading', {level: 2, name: 'Belum ada catatan'})).toBeInTheDocument();
  });

  it('renders a leading icon when the icon prop is given', () => {
    const {container} = render(
      <DataEmpty icon="work" title="Belum ada" description="Nanti muncul di sini." />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
