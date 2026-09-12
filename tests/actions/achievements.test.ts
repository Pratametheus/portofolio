import {describe, expect, it} from 'vitest';
import {parseAchievementForm} from '@/lib/actions/achievements';

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const validFields = {
  titleId: 'Judul', titleEn: 'Title',
  issuer: 'JUTIF', year: '2026',
  type: 'Publikasi', category: 'Keamanan',
  descriptionId: 'Deskripsi.', descriptionEn: 'Description.',
  url: 'https://doi.org/x', sortOrder: '0'
};

describe('parseAchievementForm', () => {
  it('parses a fully-filled form', () => {
    const input = parseAchievementForm(fd(validFields));
    expect(input).toEqual({
      titleId: 'Judul', titleEn: 'Title',
      issuer: 'JUTIF', year: '2026',
      type: 'Publikasi', category: 'Keamanan',
      descriptionId: 'Deskripsi.', descriptionEn: 'Description.',
      url: 'https://doi.org/x', sortOrder: 0
    });
  });

  it('allows a blank url, stored as null', () => {
    const input = parseAchievementForm(fd({...validFields, url: ''}));
    expect(input.url).toBeNull();
  });

  it('rejects an invalid type', () => {
    expect(() => parseAchievementForm(fd({...validFields, type: 'Bogus'}))).toThrow(/type/);
  });

  it('rejects an invalid category', () => {
    expect(() => parseAchievementForm(fd({...validFields, category: 'Bogus'}))).toThrow(/category/);
  });

  it('rejects a malformed url', () => {
    expect(() => parseAchievementForm(fd({...validFields, url: 'not a url'}))).toThrow(/url/);
  });

  it('throws when a required field is missing', () => {
    const fields = {...validFields};
    delete (fields as Record<string, string>).titleEn;
    expect(() => parseAchievementForm(fd(fields))).toThrow(/titleEn/);
  });
});
