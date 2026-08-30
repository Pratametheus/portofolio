import {describe, expect, it} from 'vitest';
import {existsSync, statSync} from 'node:fs';
import path from 'node:path';
import {caseStudies} from '@/content/case-studies';

const publicDir = path.resolve(__dirname, '../public');

const REQUIRED = [
  'hero/operator-night.webp',
  'hero/operator-light.webp',
  'karya/siakad-informatika.webp',
  'karya/city-courier.webp',
  'karya/mochitoon.webp'
];

describe('optimised assets', () => {
  it.each(REQUIRED)('public/%s exists and is under 200 KB', (rel) => {
    const file = path.join(publicDir, rel);
    expect(existsSync(file), `${rel} missing`).toBe(true);
    expect(statSync(file).size).toBeLessThan(200 * 1024);
  });

  it('every case-study thumbnail.src points at a real file in public/', () => {
    for (const locale of ['id', 'en'] as const) {
      for (const cs of caseStudies[locale]) {
        const file = path.join(publicDir, cs.thumbnail.src.replace(/^\//, ''));
        expect(existsSync(file), `${cs.slug}: ${cs.thumbnail.src}`).toBe(true);
      }
    }
  });

  it('ships an app-dir favicon and svg icon', () => {
    const appDir = path.resolve(__dirname, '../src/app');
    expect(existsSync(path.join(appDir, 'favicon.ico'))).toBe(true);
    expect(existsSync(path.join(appDir, 'icon.svg'))).toBe(true);
  });
});
