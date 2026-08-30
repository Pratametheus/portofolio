import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf8');

describe('token desain', () => {
  it.each([
    ['--color-bg', '#0A0A0B'],
    ['--color-surface', '#131316'],
    ['--color-border', '#26262B'],
    ['--color-fg', '#EDEDEF'],
    ['--color-fg-muted', '#9B9BA3'],
    ['--color-accent', '#4ADE80']
  ])('mendefinisikan %s sebagai %s', (token, value) => {
    expect(css).toContain(`${token}: ${value}`);
  });

  it('hanya punya satu warna aksen', () => {
    const accents = css.match(/--color-accent:/g) ?? [];
    expect(accents).toHaveLength(1);
  });
});
