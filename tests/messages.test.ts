import {describe, expect, it} from 'vitest';
import id from '../messages/id.json';
import en from '../messages/en.json';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? flattenKeys(value as Record<string, unknown>, full)
      : [full];
  });
}

function flattenEntries(
  obj: Record<string, unknown>,
  prefix = ''
): Array<[string, unknown]> {
  return Object.entries(obj).flatMap(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? flattenEntries(value as Record<string, unknown>, full)
      : ([[full, value]] as Array<[string, unknown]>);
  });
}

describe('kelengkapan terjemahan', () => {
  const idKeys = flattenKeys(id).sort();
  const enKeys = flattenKeys(en).sort();

  it('setiap kunci Indonesia ada di berkas Inggris', () => {
    expect(enKeys.filter((k) => !idKeys.includes(k))).toEqual([]);
    expect(idKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
  });

  it('tidak ada nilai kosong', () => {
    const empty = [...flattenEntries(id), ...flattenEntries(en)]
      .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
      .map(([path]) => path);
    expect(empty).toEqual([]);
  });
});
