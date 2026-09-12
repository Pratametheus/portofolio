/** @vitest-environment node */
import {describe, expect, it, beforeEach, afterAll, beforeAll} from 'vitest';
import {createTestDb, resetTestDb} from '../helpers/d1';
import {uploadUrl} from '@/lib/uploads';
import {
  createAchievement,
  listPublicAchievements,
  getFeaturedPublication,
  listAdminAchievements,
  getAdminAchievement,
  updateAchievement,
  softDeleteAchievement,
  restoreAchievement,
  hardDeleteAchievement,
  undoLastAchievementEdit,
  listTrashedAchievements,
  type AchievementInput
} from '@/lib/repositories/achievements';

const sample: AchievementInput = {
  titleId: 'Analisis Kerentanan',
  titleEn: 'Vulnerability Analysis',
  issuer: 'JUTIF · Vol. 7 No. 2',
  year: '2026',
  type: 'Publikasi',
  category: 'Keamanan',
  descriptionId: 'Artikel penelitian.',
  descriptionEn: 'A research article.',
  url: 'https://doi.org/x',
  sortOrder: 0,
  coverKey: null
};

describe('achievements repository', () => {
  let db: D1Database;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({db, dispose} = await createTestDb());
  });
  afterAll(() => dispose());
  beforeEach(() => resetTestDb(db));

  it('creates a row and lists it publicly, locale-resolved', async () => {
    await createAchievement(db, sample);
    const [idEntry] = await listPublicAchievements(db, 'id');
    expect(idEntry).toEqual({
      title: 'Analisis Kerentanan',
      issuer: 'JUTIF · Vol. 7 No. 2',
      year: '2026',
      type: 'Publikasi',
      category: 'Keamanan',
      description: 'Artikel penelitian.',
      url: 'https://doi.org/x',
      coverUrl: undefined
    });
    const [enEntry] = await listPublicAchievements(db, 'en');
    expect(enEntry.title).toBe('Vulnerability Analysis');
  });

  it('omits a null url from the public shape', async () => {
    await createAchievement(db, {...sample, url: null});
    const [entry] = await listPublicAchievements(db, 'id');
    expect(entry.url).toBeUndefined();
  });

  it('getFeaturedPublication returns the first non-deleted Publikasi by sort_order', async () => {
    await createAchievement(db, {...sample, type: 'Sertifikat', titleId: 'Cert', sortOrder: 0});
    await createAchievement(db, {...sample, titleId: 'Paper', sortOrder: 1});
    const featured = await getFeaturedPublication(db, 'id');
    expect(featured?.title).toBe('Paper');
  });

  it('getFeaturedPublication returns null when there is no Publikasi', async () => {
    await createAchievement(db, {...sample, type: 'Sertifikat'});
    expect(await getFeaturedPublication(db, 'id')).toBeNull();
  });

  it('update captures a snapshot and undo restores the previous values', async () => {
    await createAchievement(db, sample);
    const [row] = await listAdminAchievements(db);
    await updateAchievement(db, row.id, {...sample, titleId: 'Updated title'});
    const updated = await getAdminAchievement(db, row.id);
    expect(updated?.titleId).toBe('Updated title');
    expect(updated?.previousSnapshot).not.toBeNull();

    await undoLastAchievementEdit(db, row.id);
    const undone = await getAdminAchievement(db, row.id);
    expect(undone?.titleId).toBe(sample.titleId);
    expect(undone?.previousSnapshot).toBeNull();
  });

  it('soft delete hides a row from public/admin lists but keeps it in trash, restore brings it back', async () => {
    await createAchievement(db, sample);
    const [row] = await listAdminAchievements(db);

    await softDeleteAchievement(db, row.id);
    expect(await listPublicAchievements(db, 'id')).toHaveLength(0);
    expect(await listTrashedAchievements(db)).toHaveLength(1);

    await restoreAchievement(db, row.id);
    expect(await listPublicAchievements(db, 'id')).toHaveLength(1);
  });

  it('hard delete permanently removes a row', async () => {
    await createAchievement(db, sample);
    const [row] = await listAdminAchievements(db);
    await softDeleteAchievement(db, row.id);
    await hardDeleteAchievement(db, row.id);
    expect(await getAdminAchievement(db, row.id)).toBeNull();
  });

  it('computes coverUrl from a non-null coverKey', async () => {
    await createAchievement(db, {...sample, coverKey: 'achievement-covers/abc.png'});
    const [entry] = await listPublicAchievements(db, 'id');
    expect(entry.coverUrl).toBe(uploadUrl('achievement-covers/abc.png'));
  });

  it('preserves coverKey through the undo round-trip', async () => {
    await createAchievement(db, {...sample, coverKey: 'achievement-covers/original.png'});
    const [row] = await listAdminAchievements(db);
    await updateAchievement(db, row.id, {...sample, coverKey: 'achievement-covers/replacement.png'});
    expect((await getAdminAchievement(db, row.id))?.coverKey).toBe('achievement-covers/replacement.png');

    await undoLastAchievementEdit(db, row.id);
    expect((await getAdminAchievement(db, row.id))?.coverKey).toBe('achievement-covers/original.png');
  });

  it('hard delete returns the deleted row\'s coverKey', async () => {
    await createAchievement(db, {...sample, coverKey: 'achievement-covers/to-clean-up.png'});
    const [row] = await listAdminAchievements(db);
    await softDeleteAchievement(db, row.id);
    const deletedCoverKey = await hardDeleteAchievement(db, row.id);
    expect(deletedCoverKey).toBe('achievement-covers/to-clean-up.png');
  });

  it('hard delete returns null when the row had no cover', async () => {
    await createAchievement(db, sample);
    const [row] = await listAdminAchievements(db);
    await softDeleteAchievement(db, row.id);
    const deletedCoverKey = await hardDeleteAchievement(db, row.id);
    expect(deletedCoverKey).toBeNull();
  });
});
