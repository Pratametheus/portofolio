/**
 * @vitest-environment node
 */
import {describe, expect, it} from 'vitest';
import {parseAchievementForm} from '@/lib/actions/achievements';
import {createTestBucket} from '../helpers/r2';
import {resolveCoverKey} from '@/lib/actions/achievements';

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

function fileFormData(file?: File): FormData {
  const f = new FormData();
  if (file) f.set('cover', file);
  return f;
}

describe('resolveCoverKey', () => {
  it('returns the existing key unchanged when no file is submitted', async () => {
    const {bucket, dispose} = await createTestBucket();
    try {
      const key = await resolveCoverKey(bucket, fileFormData(), 'achievement-covers/existing.png');
      expect(key).toBe('achievement-covers/existing.png');
    } finally {
      await dispose();
    }
  });

  it('returns the existing key unchanged when the file input was left empty', async () => {
    const {bucket, dispose} = await createTestBucket();
    try {
      const emptyFile = new File([], '', {type: 'application/octet-stream'});
      const key = await resolveCoverKey(bucket, fileFormData(emptyFile), 'achievement-covers/existing.png');
      expect(key).toBe('achievement-covers/existing.png');
    } finally {
      await dispose();
    }
  });

  it('uploads a new file and returns its key', async () => {
    const {bucket, dispose} = await createTestBucket();
    try {
      const file = new File([new Uint8Array(10)], 'cover.webp', {type: 'image/webp'});
      const key = await resolveCoverKey(bucket, fileFormData(file), null);
      expect(key).toMatch(/^achievement-covers\/[\w-]+\.webp$/);
      const stored = await bucket.get(key!);
      expect(stored).not.toBeNull();
    } finally {
      await dispose();
    }
  });

  it('rejects an oversized file', async () => {
    const {bucket, dispose} = await createTestBucket();
    try {
      const file = new File([new Uint8Array(6 * 1024 * 1024)], 'cover.png', {type: 'image/png'});
      await expect(resolveCoverKey(bucket, fileFormData(file), null)).rejects.toThrow(/smaller/);
    } finally {
      await dispose();
    }
  });
});
