import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf8');

const NIGHT: Array<[string, string]> = [
  ['--color-bg', '#0A0A0B'],
  ['--color-surface', '#131316'],
  ['--color-surface-2', '#1B1B1F'],
  ['--color-border', '#26262B'],
  ['--color-fg', '#EDEDEF'],
  ['--color-fg-muted', '#9B9BA3'],
  ['--color-accent', '#FACC15'],
  ['--color-on-accent', '#0A0A0B']
];
const LIGHT: Array<[string, string]> = [
  ['--color-bg', '#F7F3EC'],
  ['--color-surface', '#EFE9DE'],
  ['--color-surface-2', '#E7DFD1'],
  ['--color-border', '#DED4C2'],
  ['--color-fg', '#2B2925'],
  ['--color-fg-muted', '#6B6459'],
  ['--color-accent', '#8F5F18'],
  ['--color-on-accent', '#F7F3EC']
];

function block(selector: string): string {
  const i = css.indexOf(selector);
  expect(i, `${selector} present`).toBeGreaterThan(-1);
  return css.slice(i, css.indexOf('}', i));
}

describe('design tokens', () => {
  it('maps every color utility through a var() in @theme inline', () => {
    const theme = block('@theme inline');
    for (const [name] of NIGHT) {
      expect(theme).toMatch(new RegExp(`${name.replace('--color', '--color')}:\\s*var\\(`));
    }
  });

  it('defines the night palette on :root', () => {
    const root = block(':root');
    for (const [name, value] of NIGHT) expect(root).toContain(`${name}: ${value}`);
  });

  it('defines the light palette on [data-theme="light"]', () => {
    const light = block('[data-theme="light"]');
    for (const [name, value] of LIGHT) expect(light).toContain(`${name}: ${value}`);
  });

  it('keeps exactly one accent value per theme', () => {
    expect(block(':root').match(/--color-accent:/g) ?? []).toHaveLength(1);
    expect(block('[data-theme="light"]').match(/--color-accent:/g) ?? []).toHaveLength(1);
  });

  it('honours prefers-reduced-motion', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
