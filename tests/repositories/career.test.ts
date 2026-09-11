/// <reference types="vitest" />
/**
 * @vitest-environment node
 */
import {describe, expect, it, beforeEach, afterAll, beforeAll} from 'vitest';
import {createTestDb, resetTestDb} from '../helpers/d1';
import {
  createCareerEntry,
  listPublicCareerEntries,
  listAdminCareerEntries,
  getAdminCareerEntry,
  updateCareerEntry,
  softDeleteCareerEntry,
  restoreCareerEntry,
  hardDeleteCareerEntry,
  undoLastCareerEdit,
  listTrashedCareerEntries,
  type CareerEntryInput
} from '@/lib/repositories/career';

const sample: CareerEntryInput = {
  kind: 'career',
  roleId: 'Guru Informatika',
  roleEn: 'Computing Teacher',
  organizationId: 'SDN Ujung XIII/38',
  organizationEn: 'SDN Ujung XIII/38',
  periodId: 'Mulai April 2026',
  periodEn: 'Since April 2026',
  categoryId: 'Pendidikan',
  categoryEn: 'Education',
  mark: 'SD',
  descriptionId: 'Mengajar komputer.',
  descriptionEn: 'Teaching computing.',
  sortOrder: 0
};

describe('career repository', () => {
  let db: D1Database;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({db, dispose} = await createTestDb());
  });
  afterAll(() => dispose());
  beforeEach(() => resetTestDb(db));

  it('creates a row and lists it publicly, locale-resolved', async () => {
    await createCareerEntry(db, sample);
    const idEntries = await listPublicCareerEntries(db, 'career', 'id');
    expect(idEntries).toEqual([
      {
        role: 'Guru Informatika',
        organization: 'SDN Ujung XIII/38',
        period: 'Mulai April 2026',
        category: 'Pendidikan',
        mark: 'SD',
        description: 'Mengajar komputer.'
      }
    ]);
    const enEntries = await listPublicCareerEntries(db, 'career', 'en');
    expect(enEntries[0].role).toBe('Computing Teacher');
  });

  it('filters public and admin lists by kind', async () => {
    await createCareerEntry(db, sample);
    await createCareerEntry(db, {...sample, kind: 'education', roleId: 'S1'});
    expect(await listPublicCareerEntries(db, 'career', 'id')).toHaveLength(1);
    expect(await listPublicCareerEntries(db, 'education', 'id')).toHaveLength(1);
    expect(await listAdminCareerEntries(db, 'career')).toHaveLength(1);
  });

  it('orders by sort_order ascending', async () => {
    await createCareerEntry(db, {...sample, roleId: 'Second', sortOrder: 2});
    await createCareerEntry(db, {...sample, roleId: 'First', sortOrder: 1});
    const entries = await listPublicCareerEntries(db, 'career', 'id');
    expect(entries.map((e) => e.role)).toEqual(['First', 'Second']);
  });

  it('update captures a snapshot and undo restores the previous values', async () => {
    await createCareerEntry(db, sample);
    const [row] = await listAdminCareerEntries(db, 'career');
    expect(row.previousSnapshot).toBeNull();

    await updateCareerEntry(db, row.id, {...sample, roleId: 'Updated role'});
    const updated = await getAdminCareerEntry(db, row.id);
    expect(updated?.roleId).toBe('Updated role');
    expect(updated?.previousSnapshot).not.toBeNull();
    expect(updated?.snapshotAt).not.toBeNull();

    await undoLastCareerEdit(db, row.id);
    const undone = await getAdminCareerEntry(db, row.id);
    expect(undone?.roleId).toBe(sample.roleId);
    expect(undone?.previousSnapshot).toBeNull();
  });

  it('undo is a no-op when there is no snapshot', async () => {
    await createCareerEntry(db, sample);
    const [row] = await listAdminCareerEntries(db, 'career');
    await expect(undoLastCareerEdit(db, row.id)).resolves.not.toThrow();
    const unchanged = await getAdminCareerEntry(db, row.id);
    expect(unchanged?.roleId).toBe(sample.roleId);
  });

  it('soft delete hides a row from public and admin lists but keeps it in trash', async () => {
    await createCareerEntry(db, sample);
    const [row] = await listAdminCareerEntries(db, 'career');

    await softDeleteCareerEntry(db, row.id);
    expect(await listPublicCareerEntries(db, 'career', 'id')).toHaveLength(0);
    expect(await listAdminCareerEntries(db, 'career')).toHaveLength(0);
    const trashed = await listTrashedCareerEntries(db);
    expect(trashed).toHaveLength(1);
    expect(trashed[0].deletedAt).not.toBeNull();
  });

  it('restore brings a soft-deleted row back', async () => {
    await createCareerEntry(db, sample);
    const [row] = await listAdminCareerEntries(db, 'career');
    await softDeleteCareerEntry(db, row.id);
    await restoreCareerEntry(db, row.id);
    expect(await listPublicCareerEntries(db, 'career', 'id')).toHaveLength(1);
    expect(await listTrashedCareerEntries(db)).toHaveLength(0);
  });

  it('hard delete permanently removes a row', async () => {
    await createCareerEntry(db, sample);
    const [row] = await listAdminCareerEntries(db, 'career');
    await softDeleteCareerEntry(db, row.id);
    await hardDeleteCareerEntry(db, row.id);
    expect(await listTrashedCareerEntries(db)).toHaveLength(0);
    expect(await getAdminCareerEntry(db, row.id)).toBeNull();
  });
});
