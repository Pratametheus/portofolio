/**
 * @vitest-environment node
 */
import {describe, expect, it} from 'vitest';
import {parseCareerEntryForm, resolveLogoKey} from '@/lib/actions/career-entries';
import {createTestBucket} from '../helpers/r2';
import {createTestDb} from '../helpers/d1';
import {
  createCareerEntry,
  listAdminCareerEntries,
  softDeleteCareerEntry,
  hardDeleteCareerEntry
} from '@/lib/repositories/career';

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const validFields = {
  roleId: 'Guru', roleEn: 'Teacher',
  organizationId: 'Sekolah', organizationEn: 'School',
  periodId: 'Mulai 2026', periodEn: 'Since 2026',
  categoryId: 'Pendidikan', categoryEn: 'Education',
  mark: 'SD',
  descriptionId: 'Deskripsi.', descriptionEn: 'Description.',
  sortOrder: '0'
};

describe('parseCareerEntryForm', () => {
  it('parses a fully-filled form into CareerEntryInput', () => {
    const input = parseCareerEntryForm(fd(validFields), 'career');
    expect(input).toEqual({
      kind: 'career',
      roleId: 'Guru', roleEn: 'Teacher',
      organizationId: 'Sekolah', organizationEn: 'School',
      periodId: 'Mulai 2026', periodEn: 'Since 2026',
      categoryId: 'Pendidikan', categoryEn: 'Education',
      mark: 'SD',
      descriptionId: 'Deskripsi.', descriptionEn: 'Description.',
      sortOrder: 0
    });
  });

  it('throws when a required bilingual field is missing', () => {
    const fields = {...validFields};
    delete (fields as Record<string, string>).roleEn;
    expect(() => parseCareerEntryForm(fd(fields), 'career')).toThrow(/roleEn/);
  });

  it('throws when sortOrder is not a number', () => {
    expect(() =>
      parseCareerEntryForm(fd({...validFields, sortOrder: 'abc'}), 'career')
    ).toThrow(/sortOrder/);
  });

  it('defaults sortOrder to 0 when blank', () => {
    const input = parseCareerEntryForm(fd({...validFields, sortOrder: ''}), 'career');
    expect(input.sortOrder).toBe(0);
  });
});

// getCloudflareContext isn't available outside a real Worker/Miniflare request —
// these tests call the repository/R2 functions this action wraps directly against
// the same local D1 + R2 bindings, rather than invoking the Next.js Server Action
// wrapper itself (which also calls redirect(), which throws in a plain test
// environment). This still exercises the exact upload-then-write-then-cleanup logic;
// it just doesn't go through Next's own Server Action RPC plumbing, which is
// framework code, not this project's.

function fileFormData(fields: Record<string, string>, file?: File): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  if (file) f.set('logo', file);
  return f;
}

describe('resolveLogoKey', () => {
  it('returns the existing key unchanged when no file is submitted', async () => {
    const {bucket, dispose} = await createTestBucket();
    try {
      const formData = fileFormData({});
      const key = await resolveLogoKey(bucket, formData, 'career-logos/existing.png');
      expect(key).toBe('career-logos/existing.png');
    } finally {
      await dispose();
    }
  });

  it('returns the existing key unchanged when the file input was left empty', async () => {
    const {bucket, dispose} = await createTestBucket();
    try {
      const emptyFile = new File([], '', {type: 'application/octet-stream'});
      const formData = fileFormData({}, emptyFile);
      const key = await resolveLogoKey(bucket, formData, 'career-logos/existing.png');
      expect(key).toBe('career-logos/existing.png');
    } finally {
      await dispose();
    }
  });

  it('uploads a new file and returns its key', async () => {
    const {bucket, dispose} = await createTestBucket();
    try {
      const file = new File([new Uint8Array(10)], 'logo.png', {type: 'image/png'});
      const formData = fileFormData({}, file);
      const key = await resolveLogoKey(bucket, formData, null);
      expect(key).toMatch(/^career-logos\/[\w-]+\.png$/);
      const stored = await bucket.get(key!);
      expect(stored).not.toBeNull();
    } finally {
      await dispose();
    }
  });

  it('rejects an invalid file type', async () => {
    const {bucket, dispose} = await createTestBucket();
    try {
      const file = new File([new Uint8Array(10)], 'logo.txt', {type: 'text/plain'});
      const formData = fileFormData({}, file);
      await expect(resolveLogoKey(bucket, formData, null)).rejects.toThrow(/must be one of/);
    } finally {
      await dispose();
    }
  });
});

describe('permanent delete R2 cleanup (mirrors trash.ts logic)', () => {
  it('deletes the R2 object when a permanently-deleted entry had a logo', async () => {
    // Spinning up both a D1 and an R2 platform proxy in one test is slower than
    // either alone (each involves its own Miniflare bootstrap) — needs a longer
    // timeout than vitest's 5000ms default.
    const {db, dispose: disposeDb} = await createTestDb();
    const {bucket, dispose: disposeBucket} = await createTestBucket();
    try {
      await bucket.put('career-logos/cleanup-test.png', new Uint8Array(10));
      await createCareerEntry(db, {
        kind: 'career',
        roleId: 'R', roleEn: 'R',
        organizationId: 'O', organizationEn: 'O',
        periodId: 'P', periodEn: 'P',
        categoryId: 'C', categoryEn: 'C',
        mark: 'X',
        descriptionId: 'D', descriptionEn: 'D',
        sortOrder: 0,
        logoKey: 'career-logos/cleanup-test.png'
      });
      const [row] = await listAdminCareerEntries(db, 'career');
      await softDeleteCareerEntry(db, row.id);

      // Mirrors permanentlyDeleteCareerEntryAction's logic exactly
      const logoKey = await hardDeleteCareerEntry(db, row.id);
      if (logoKey) {
        await bucket.delete(logoKey);
      }

      expect(await bucket.get('career-logos/cleanup-test.png')).toBeNull();
    } finally {
      await disposeDb();
      await disposeBucket();
    }
  }, 20000);

  it('does nothing to R2 when a permanently-deleted entry had no logo', async () => {
    // See timeout note above — same combined D1+R2 proxy setup cost applies.
    const {db, dispose: disposeDb} = await createTestDb();
    const {bucket, dispose: disposeBucket} = await createTestBucket();
    try {
      await createCareerEntry(db, {
        kind: 'career',
        roleId: 'R', roleEn: 'R',
        organizationId: 'O', organizationEn: 'O',
        periodId: 'P', periodEn: 'P',
        categoryId: 'C', categoryEn: 'C',
        mark: 'X',
        descriptionId: 'D', descriptionEn: 'D',
        sortOrder: 0,
        logoKey: null
      });
      const [row] = await listAdminCareerEntries(db, 'career');
      await softDeleteCareerEntry(db, row.id);

      const logoKey = await hardDeleteCareerEntry(db, row.id);
      expect(logoKey).toBeNull();
      // No bucket.delete call should be attempted — nothing to assert on the bucket
      // itself, but this documents the "no-op when absent" branch explicitly.
    } finally {
      await disposeDb();
      await disposeBucket();
    }
  }, 20000);
});
