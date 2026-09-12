export type CareerEntry = {
  role: string;
  organization: string;
  period: string;
  category: string;
  mark: string;
  description: string;
};

export type CareerKind = 'career' | 'education';

export type CareerEntryRow = {
  id: number;
  kind: CareerKind;
  roleId: string;
  roleEn: string;
  organizationId: string;
  organizationEn: string;
  periodId: string;
  periodEn: string;
  categoryId: string;
  categoryEn: string;
  mark: string;
  descriptionId: string;
  descriptionEn: string;
  sortOrder: number;
  deletedAt: string | null;
  previousSnapshot: string | null;
  snapshotAt: string | null;
};

export type CareerEntryInput = Omit<
  CareerEntryRow,
  'id' | 'deletedAt' | 'previousSnapshot' | 'snapshotAt'
>;

type DbRow = {
  id: number;
  kind: CareerKind;
  role_id: string;
  role_en: string;
  organization_id: string;
  organization_en: string;
  period_id: string;
  period_en: string;
  category_id: string;
  category_en: string;
  mark: string;
  description_id: string;
  description_en: string;
  sort_order: number;
  deleted_at: string | null;
  previous_snapshot: string | null;
  snapshot_at: string | null;
};

function toRow(r: DbRow): CareerEntryRow {
  return {
    id: r.id,
    kind: r.kind,
    roleId: r.role_id,
    roleEn: r.role_en,
    organizationId: r.organization_id,
    organizationEn: r.organization_en,
    periodId: r.period_id,
    periodEn: r.period_en,
    categoryId: r.category_id,
    categoryEn: r.category_en,
    mark: r.mark,
    descriptionId: r.description_id,
    descriptionEn: r.description_en,
    sortOrder: r.sort_order,
    deletedAt: r.deleted_at,
    previousSnapshot: r.previous_snapshot,
    snapshotAt: r.snapshot_at
  };
}

function toPublic(row: CareerEntryRow, locale: 'id' | 'en'): CareerEntry {
  return locale === 'id'
    ? {
        role: row.roleId,
        organization: row.organizationId,
        period: row.periodId,
        category: row.categoryId,
        mark: row.mark,
        description: row.descriptionId
      }
    : {
        role: row.roleEn,
        organization: row.organizationEn,
        period: row.periodEn,
        category: row.categoryEn,
        mark: row.mark,
        description: row.descriptionEn
      };
}

export async function listPublicCareerEntries(
  db: D1Database,
  kind: CareerKind,
  locale: 'id' | 'en'
): Promise<CareerEntry[]> {
  const {results} = await db
    .prepare(
      'SELECT * FROM career_entries WHERE kind = ? AND deleted_at IS NULL ORDER BY sort_order ASC'
    )
    .bind(kind)
    .all<DbRow>();
  return results.map((r) => toPublic(toRow(r), locale));
}

export async function listAdminCareerEntries(
  db: D1Database,
  kind: CareerKind
): Promise<CareerEntryRow[]> {
  const {results} = await db
    .prepare(
      'SELECT * FROM career_entries WHERE kind = ? AND deleted_at IS NULL ORDER BY sort_order ASC'
    )
    .bind(kind)
    .all<DbRow>();
  return results.map(toRow);
}

export async function getAdminCareerEntry(
  db: D1Database,
  id: number
): Promise<CareerEntryRow | null> {
  const row = await db
    .prepare('SELECT * FROM career_entries WHERE id = ? AND deleted_at IS NULL')
    .bind(id)
    .first<DbRow>();
  return row ? toRow(row) : null;
}

export async function createCareerEntry(db: D1Database, input: CareerEntryInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO career_entries
        (kind, role_id, role_en, organization_id, organization_en, period_id, period_en,
         category_id, category_en, mark, description_id, description_en, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.kind,
      input.roleId,
      input.roleEn,
      input.organizationId,
      input.organizationEn,
      input.periodId,
      input.periodEn,
      input.categoryId,
      input.categoryEn,
      input.mark,
      input.descriptionId,
      input.descriptionEn,
      input.sortOrder
    )
    .run();
}

export async function updateCareerEntry(
  db: D1Database,
  id: number,
  input: CareerEntryInput
): Promise<void> {
  const current = await getAdminCareerEntry(db, id);
  if (!current) throw new Error(`career_entries row ${id} not found`);
  const snapshot: CareerEntryInput = {
    kind: current.kind,
    roleId: current.roleId,
    roleEn: current.roleEn,
    organizationId: current.organizationId,
    organizationEn: current.organizationEn,
    periodId: current.periodId,
    periodEn: current.periodEn,
    categoryId: current.categoryId,
    categoryEn: current.categoryEn,
    mark: current.mark,
    descriptionId: current.descriptionId,
    descriptionEn: current.descriptionEn,
    sortOrder: current.sortOrder
  };

  await db
    .prepare(
      `UPDATE career_entries SET
        role_id = ?, role_en = ?, organization_id = ?, organization_en = ?,
        period_id = ?, period_en = ?, category_id = ?, category_en = ?,
        mark = ?, description_id = ?, description_en = ?, sort_order = ?,
        updated_at = datetime('now'),
        previous_snapshot = ?, snapshot_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      input.roleId,
      input.roleEn,
      input.organizationId,
      input.organizationEn,
      input.periodId,
      input.periodEn,
      input.categoryId,
      input.categoryEn,
      input.mark,
      input.descriptionId,
      input.descriptionEn,
      input.sortOrder,
      JSON.stringify(snapshot),
      id
    )
    .run();
}

export async function undoLastCareerEdit(db: D1Database, id: number): Promise<void> {
  const current = await getAdminCareerEntry(db, id);
  if (!current || !current.previousSnapshot) return;
  const snapshot = JSON.parse(current.previousSnapshot) as CareerEntryInput;

  await db
    .prepare(
      `UPDATE career_entries SET
        role_id = ?, role_en = ?, organization_id = ?, organization_en = ?,
        period_id = ?, period_en = ?, category_id = ?, category_en = ?,
        mark = ?, description_id = ?, description_en = ?, sort_order = ?,
        updated_at = datetime('now'),
        previous_snapshot = NULL, snapshot_at = NULL
       WHERE id = ?`
    )
    .bind(
      snapshot.roleId,
      snapshot.roleEn,
      snapshot.organizationId,
      snapshot.organizationEn,
      snapshot.periodId,
      snapshot.periodEn,
      snapshot.categoryId,
      snapshot.categoryEn,
      snapshot.mark,
      snapshot.descriptionId,
      snapshot.descriptionEn,
      snapshot.sortOrder,
      id
    )
    .run();
}

export async function softDeleteCareerEntry(db: D1Database, id: number): Promise<void> {
  await db
    .prepare("UPDATE career_entries SET deleted_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run();
}

export async function restoreCareerEntry(db: D1Database, id: number): Promise<void> {
  await db.prepare('UPDATE career_entries SET deleted_at = NULL WHERE id = ?').bind(id).run();
}

export async function hardDeleteCareerEntry(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM career_entries WHERE id = ?').bind(id).run();
}

export async function listTrashedCareerEntries(db: D1Database): Promise<CareerEntryRow[]> {
  const {results} = await db
    .prepare('SELECT * FROM career_entries WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC')
    .all<DbRow>();
  return results.map(toRow);
}
