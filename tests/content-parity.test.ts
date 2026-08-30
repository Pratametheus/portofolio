import {describe, expect, it} from 'vitest';
import {caseStudies} from '@/content/case-studies';

describe('case-study id/en structural parity', () => {
  it('matches section and block structure across locales', () => {
    const id = caseStudies.id;
    const en = caseStudies.en;

    expect(id.map((c) => c.slug)).toEqual(en.map((c) => c.slug));
    id.forEach((cs, i) => {
      const other = en[i];
      expect(cs.sections.map((s) => s.blocks.map((b) => b.type))).toEqual(
        other.sections.map((s) => s.blocks.map((b) => b.type))
      );
    });
  });
});
