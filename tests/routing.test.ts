import {describe, expect, it} from 'vitest';
import {routing} from '@/i18n/routing';

describe('routing locale', () => {
  it('mendukung bahasa Indonesia dan Inggris', () => {
    expect(routing.locales).toEqual(['id', 'en']);
  });

  it('memakai bahasa Indonesia sebagai bawaan', () => {
    expect(routing.defaultLocale).toBe('id');
  });

  it('selalu menampilkan prefiks locale di URL', () => {
    expect(routing.localePrefix).toBe('always');
  });
});
