import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {Icon} from '@/components/icon';

describe('Icon', () => {
  it('renders the three authored build paths as a decorative svg', () => {
    const {container} = render(<Icon name="build" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg?.querySelectorAll('path')).toHaveLength(3);
  });

  it('renders all six authored secure geometry elements', () => {
    const {container} = render(<Icon name="secure" />);
    const svg = container.querySelector('svg');

    expect(svg?.querySelectorAll('path')).toHaveLength(5);
    expect(svg?.querySelectorAll('circle')).toHaveLength(1);
  });

  it('renders nothing for an unknown runtime name', () => {
    const {container} = render(<Icon name={'unknown' as never} />);
    expect(container).toBeEmptyDOMElement();
  });
});
