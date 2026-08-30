import {describe, expect, it} from 'vitest';
import {caseStudies} from '@/content/case-studies';

describe('kesejajaran konten id/en', () => {
  const idSlugs = caseStudies.id.map((c) => c.slug);
  const enSlugs = caseStudies.en.map((c) => c.slug);

  it('memakai slug yang sama dalam urutan yang sama di kedua bahasa', () => {
    expect(enSlugs).toEqual(idSlugs);
  });

  it.each(idSlugs)('%s: year, stack, dan featured identik di kedua bahasa', (slug) => {
    const id = caseStudies.id.find((c) => c.slug === slug)!;
    const en = caseStudies.en.find((c) => c.slug === slug)!;
    expect(en.year).toBe(id.year);
    expect(en.stack).toEqual(id.stack);
    expect(en.featured).toBe(id.featured);
  });

  it.each(idSlugs)('%s: title identik di kedua bahasa', (slug) => {
    const id = caseStudies.id.find((c) => c.slug === slug)!;
    const en = caseStudies.en.find((c) => c.slug === slug)!;
    expect(en.title).toBe(id.title);
  });

  it.each(idSlugs)('%s: tagline ada, tidak kosong, dan diterjemahkan (berbeda)', (slug) => {
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
  )('%s/%s: stack tidak punya duplikat', (locale, slug) => {
    const study = caseStudies[locale].find((c) => c.slug === slug)!;
    expect(new Set(study.stack).size).toBe(study.stack.length);
  });
});
