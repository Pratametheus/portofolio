import {describe, expect, it} from 'vitest';
import {buildPersonSchema, buildScholarlyArticleSchema} from '@/lib/jsonld';

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
