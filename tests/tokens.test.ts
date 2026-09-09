import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf8');

// Redesign palette (spec 2026-09-09 §3). Night = sandbox Option A; light = adapted warm paper.
const NIGHT: Array<[string, string]> = [
  ['--color-bg', '#101112'],
  ['--color-surface', '#1b1d1e'],
  ['--color-surface-2', '#232427'],
  ['--color-border', '#33383b'],
  ['--color-fg', '#eeefed'],
  ['--color-fg-muted', '#a1a7a9'],
  ['--color-accent', '#efd45d'],
  ['--color-on-accent', '#101112']
];
const LIGHT: Array<[string, string]> = [
  ['--color-bg', '#f7f3ec'],
  ['--color-surface', '#efe9dd'],
  ['--color-surface-2', '#e6ddca'],
  ['--color-border', '#ddd4c3'],
  ['--color-fg', '#2b2620'],
  ['--color-fg-muted', '#6b6357'],
  ['--color-accent', '#8f5f18'],
  ['--color-on-accent', '#f7f3ec']
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
      expect(theme).toMatch(new RegExp(`${name}:\\s*var\\(`));
    }
  });

  it('defines the night palette on :root', () => {
    const root = block(':root');
    for (const [name, value] of NIGHT) expect(root).toContain(`${name}: ${value}`);
  });

  it('defines the light palette on [data-theme="light"]', () => {
    const light = block(':root[data-theme="light"]');
    for (const [name, value] of LIGHT) expect(light).toContain(`${name}: ${value}`);
  });

  it('mirrors each --color-* to its raw --var value in the same block', () => {
    for (const sel of [':root[data-theme="night"]', ':root[data-theme="light"]']) {
      const b = block(sel);
      const bg = b.match(/--bg:\s*(#[0-9a-fA-F]{6})/)?.[1];
      expect(bg, `${sel} has --bg`).toBeTruthy();
      expect(b).toContain(`--color-bg: ${bg}`);
    }
  });

  it('keeps exactly one accent value per theme', () => {
    expect(block(':root').match(/--color-accent:/g) ?? []).toHaveLength(1);
    expect(block(':root[data-theme="light"]').match(/--color-accent:/g) ?? []).toHaveLength(1);
  });

  it('honours prefers-reduced-motion', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
