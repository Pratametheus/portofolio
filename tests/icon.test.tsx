import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {Icon, type IconName} from '@/components/icon';
import {NAV_ITEMS} from '@/components/nav';

const ALL: IconName[] = [
  'build', 'teach', 'secure', 'home', 'about', 'work', 'research',
  'achievements', 'guestbook', 'contact', 'links', 'sun', 'moon',
  'dashboard', 'code'
];

describe('Icon', () => {
  it('renders an svg for every IconName', () => {
    for (const name of ALL) {
      const {container} = render(<Icon name={name} />);
      const svg = container.querySelector('svg');
      expect(svg, name).not.toBeNull();
      expect(svg?.childElementCount ?? 0, name).toBeGreaterThan(0);
    }
  });

  it('has a glyph for every nav route key', () => {
    for (const {key} of NAV_ITEMS) {
      const {container} = render(<Icon name={key} />);
      expect(container.querySelector('svg')?.childElementCount ?? 0, key).toBeGreaterThan(0);
    }
  });

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
