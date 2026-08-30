import {describe, expect, it} from 'vitest';
import {EASE, DUR, REVEAL_TRAVEL, STAGGER_STEP} from '@/lib/motion';
describe('motion vocabulary', () => {
  it('uses the FASE-3 easing curve', () => expect(EASE).toEqual([0.16, 1, 0.3, 1]));
  it('keeps every duration at or below 0.3s', () => {
    for (const d of Object.values(DUR)) expect(d).toBeLessThanOrEqual(0.3);
  });
  it('reveal travel is small', () => expect(REVEAL_TRAVEL).toBeLessThanOrEqual(16));
  it('stagger step is subtle', () => expect(STAGGER_STEP).toBeLessThanOrEqual(0.08));
});
