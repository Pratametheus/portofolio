import {describe, expect, it} from 'vitest';
import {siteName} from '@/lib/site';

describe('konfigurasi situs', () => {
  it('mengekspos nama situs', () => {
    expect(siteName).toBe('Ferry Andhika Pratama');
  });
});
