import {describe, expect, it} from 'vitest';
import {formatKb, parseBudget} from '../scripts/check-bundle-size.mjs';

describe('parseBudget', () => {
  it('membaca anggaran dalam kilobyte', () => {
    expect(parseBudget('150')).toBe(150 * 1024);
  });

  it('menolak nilai bukan angka', () => {
    expect(() => parseBudget('banyak')).toThrow('Anggaran harus angka kilobyte');
  });
});

describe('formatKb', () => {
  it('membulatkan ke satu desimal', () => {
    expect(formatKb(147968)).toBe('144.5 KB');
  });
});
