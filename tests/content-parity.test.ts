import {describe, expect, it} from 'vitest';
import {caseStudies} from '@/content/case-studies';

const idSlugs = caseStudies.id.map((c) => c.slug);

describe('case-study id/en parity', () => {
  it('uses the same slugs in the same order in both locales', () => {
    expect(caseStudies.en.map((c) => c.slug)).toEqual(idSlugs);
  });

  it('matches section and block structure across locales', () => {
    caseStudies.id.forEach((cs, i) => {
      const other = caseStudies.en[i];
      expect(cs.sections.map((s) => s.blocks.map((b) => b.type))).toEqual(
        other.sections.map((s) => s.blocks.map((b) => b.type))
      );
    });
  });

  it.each(idSlugs)('%s: year, stack, and featured are identical across locales', (slug) => {
    const id = caseStudies.id.find((c) => c.slug === slug)!;
    const en = caseStudies.en.find((c) => c.slug === slug)!;
    expect(en.year).toBe(id.year);
    expect(en.stack).toEqual(id.stack);
    expect(en.featured).toBe(id.featured);
  });

  it.each(idSlugs)('%s: title is identical across locales', (slug) => {
    const id = caseStudies.id.find((c) => c.slug === slug)!;
    const en = caseStudies.en.find((c) => c.slug === slug)!;
    expect(en.title).toBe(id.title);
  });

  it.each(idSlugs)('%s: tagline is present, non-empty, and actually translated', (slug) => {
    const id = caseStudies.id.find((c) => c.slug === slug)!;
    const en = caseStudies.en.find((c) => c.slug === slug)!;
    expect(id.tagline.trim().length).toBeGreaterThan(0);
    expect(en.tagline.trim().length).toBeGreaterThan(0);
    expect(en.tagline).not.toBe(id.tagline);
  });

  it.each(
    (Object.entries(caseStudies) as Array<[keyof typeof caseStudies, typeof caseStudies.id]>).flatMap(
      ([locale, studies]) => studies.map((study) => [locale, study.slug] as const)
    )
  )('%s/%s: stack has no duplicates', (locale, slug) => {
    const study = caseStudies[locale].find((c) => c.slug === slug)!;
    expect(new Set(study.stack).size).toBe(study.stack.length);
  });

  it.each(idSlugs)('%s: thumbnail alt is per-locale, and src is shared', (slug) => {
    const id = caseStudies.id.find((c) => c.slug === slug)!;
    const en = caseStudies.en.find((c) => c.slug === slug)!;
    expect(id.thumbnail.alt.trim().length).toBeGreaterThan(8);
    expect(en.thumbnail.alt.trim().length).toBeGreaterThan(8);
    expect(id.thumbnail.src).toBe(en.thumbnail.src);
  });
});
