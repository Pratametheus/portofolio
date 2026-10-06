import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf8');

function block(selector: string): string {
  const start = css.indexOf(selector);
  expect(start, `${selector} present`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
}

describe('public theme token contract', () => {
  it('preserves the approved warm-paper light background and ochre accent', () => {
    const light = block(':root[data-theme="light"]');
    expect(light).toContain('--bg: #f7f3ec');
    expect(light).toContain('--accent: #8f5f18');
  });

  it('uses charcoal and slate night surfaces with readable off-white text', () => {
    const night = block(':root[data-theme="night"]');
    expect(night).toContain('--bg: #25282a');
    expect(night).toContain('--surface: #303437');
    expect(night).toContain('--surface-2: #3d4246');
    expect(night).toContain('--fg: #f4f1ea');
    expect(night).toContain('--fg-muted: #bab5aa');
  });

  it('uses a muted warm night accent rather than a yellow-dominant one', () => {
    const night = block(':root[data-theme="night"]');
    expect(night).toContain('--accent: #b98558');
    expect(night).not.toContain('--accent: #efd45d');
  });

  it('keeps visible focus and reduced-motion safeguards', () => {
    expect(css).toContain(':focus-visible');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
