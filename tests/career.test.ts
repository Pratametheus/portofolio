import {describe, expect, it} from 'vitest';
import {CAREER, EDUCATION} from '@/content/career';

describe('career data', () => {
  it('has one career entry per locale with all fields', () => {
    for (const locale of ['id', 'en'] as const) {
      expect(CAREER[locale]).toHaveLength(1);
      const e = CAREER[locale][0];
      for (const k of ['role', 'organization', 'period', 'category', 'mark', 'description'] as const) {
        expect(typeof e[k], `${locale}.${k}`).toBe('string');
        expect(e[k].length).toBeGreaterThan(0);
      }
    }
  });

  it('education is intentionally empty (placeholder handled by the page)', () => {
    expect(EDUCATION.id).toEqual([]);
    expect(EDUCATION.en).toEqual([]);
  });
});
