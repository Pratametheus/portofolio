import {describe, expect, it} from 'vitest';
import {buildCaseStudyArticleSchema, buildPersonSchema, buildScholarlyArticleSchema} from '@/lib/jsonld';

describe('buildPersonSchema', () => {
  const schema = buildPersonSchema();

  it('memakai konteks schema.org', () => {
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Person');
  });

  it('memuat nama dan URL situs', () => {
    expect(schema.name).toBe('Ferry Andhika Pratama');
    expect(schema.url).toBe('https://ferryandhikapratama.com');
  });
});

describe('buildScholarlyArticleSchema', () => {
  const schema = buildScholarlyArticleSchema();

  it('bertipe ScholarlyArticle', () => {
    expect(schema['@type']).toBe('ScholarlyArticle');
  });

  it('memuat DOI sebagai identifier', () => {
    expect(schema.identifier).toBe('10.52436/1.jutif.2026.7.2.5662');
  });

  it('menyebut Ferry sebagai penulis pertama', () => {
    expect(schema.author[0].name).toBe('Ferry Andhika Pratama');
  });
});

describe('buildCaseStudyArticleSchema', () => {
  it('builds a valid Article for a known slug', () => {
    const s = buildCaseStudyArticleSchema('city-courier', 'en');
    expect(s['@type']).toBe('Article');
    expect(s.headline).toMatch(/City Courier/);
    expect(s.inLanguage).toBe('en');
    expect(s.url).toContain('/en/work/city-courier');
  });

  it('throws for an unknown slug', () => {
    expect(() => buildCaseStudyArticleSchema('nope', 'id')).toThrow();
  });
});
