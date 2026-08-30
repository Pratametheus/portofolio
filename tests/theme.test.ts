import {describe, expect, it} from 'vitest';
import {THEMES, DEFAULT_THEME, THEME_STORAGE_KEY, themeInitScript} from '@/lib/theme';

describe('theme module', () => {
  it('exposes exactly night and light', () => {
    expect([...THEMES]).toEqual(['night', 'light']);
  });
  it('defaults to night', () => {
    expect(DEFAULT_THEME).toBe('night');
  });
  it('names a storage key', () => {
    expect(THEME_STORAGE_KEY).toMatch(/theme/);
  });
  it('init script references the storage key and prefers-color-scheme and is guarded', () => {
    expect(themeInitScript).toContain(THEME_STORAGE_KEY);
    expect(themeInitScript).toContain('prefers-color-scheme');
    expect(themeInitScript).toContain('try');
    expect(themeInitScript).toContain('documentElement');
  });
  it('init script is a self-invoking expression (no bare statements leaking)', () => {
    expect(themeInitScript.trim().startsWith('(')).toBe(true);
  });
});
