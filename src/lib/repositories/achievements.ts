export type AchievementType = 'Publikasi' | 'Sertifikat';
export type AchievementCategory = 'Keamanan' | 'Pendidikan' | 'Pengembangan';

export type Achievement = {
  title: string;
  issuer: string;
  year: string;
  type: AchievementType;
  category: AchievementCategory;
  description: string;
  url?: string;
};

export type AchievementRow = {
  id: number;
  titleId: string;
  titleEn: string;
  issuer: string;
  year: string;
  type: AchievementType;
  category: AchievementCategory;
  descriptionId: string;
  descriptionEn: string;
  url: string | null;
  sortOrder: number;
  deletedAt: string | null;
  previousSnapshot: string | null;
  snapshotAt: string | null;
};

export type AchievementInput = Omit<
  AchievementRow,
  'id' | 'deletedAt' | 'previousSnapshot' | 'snapshotAt'
>;

type DbRow = {
  id: number;
  title_id: string;
  title_en: string;
  issuer: string;
  year: string;
  type: AchievementType;
  category: AchievementCategory;
  description_id: string;
  description_en: string;
  url: string | null;
  sort_order: number;
  deleted_at: string | null;
  previous_snapshot: string | null;
  snapshot_at: string | null;
};

function toRow(r: DbRow): AchievementRow {
  return {
    id: r.id,
    titleId: r.title_id,
    titleEn: r.title_en,
    issuer: r.issuer,
    year: r.year,
    type: r.type,
    category: r.category,
    descriptionId: r.description_id,
    descriptionEn: r.description_en,
    url: r.url,
    sortOrder: r.sort_order,
    deletedAt: r.deleted_at,
    previousSnapshot: r.previous_snapshot,
    snapshotAt: r.snapshot_at
  };
}

function toPublic(row: AchievementRow, locale: 'id' | 'en'): Achievement {
  const base = {
    issuer: row.issuer,
    year: row.year,
    type: row.type,
    category: row.category
  };
  return locale === 'id'
    ? {...base, title: row.titleId, description: row.descriptionId, url: row.url ?? undefined}
    : {...base, title: row.titleEn, description: row.descriptionEn, url: row.url ?? undefined};
}

export async function listPublicAchievements(
  db: D1Database,
  locale: 'id' | 'en'
): Promise<Achievement[]> {
  const {results} = await db
    .prepare('SELECT * FROM achievements WHERE deleted_at IS NULL ORDER BY sort_order ASC')
    .all<DbRow>();
  return results.map((r) => toPublic(toRow(r), locale));
}

export async function getFeaturedPublication(
  db: D1Database,
  locale: 'id' | 'en'
): Promise<Achievement | null> {
  const row = await db
    .prepare(
      "SELECT * FROM achievements WHERE deleted_at IS NULL AND type = 'Publikasi' ORDER BY sort_order ASC LIMIT 1"
    )
    .first<DbRow>();
  return row ? toPublic(toRow(row), locale) : null;
}

export async function listAdminAchievements(db: D1Database): Promise<AchievementRow[]> {
  const {results} = await db
    .prepare('SELECT * FROM achievements WHERE deleted_at IS NULL ORDER BY sort_order ASC')
    .all<DbRow>();
  return results.map(toRow);
}

export async function getAdminAchievement(
  db: D1Database,
  id: number
): Promise<AchievementRow | null> {
  const row = await db
    .prepare('SELECT * FROM achievements WHERE id = ? AND deleted_at IS NULL')
    .bind(id)
    .first<DbRow>();
  return row ? toRow(row) : null;
}

export async function createAchievement(db: D1Database, input: AchievementInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO achievements
        (title_id, title_en, issuer, year, type, category, description_id, description_en, url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.titleId,
      input.titleEn,
      input.issuer,
      input.year,
      input.type,
      input.category,
      input.descriptionId,
      input.descriptionEn,
      input.url,
      input.sortOrder
    )
    .run();
}

export async function updateAchievement(
  db: D1Database,
  id: number,
  input: AchievementInput
): Promise<void> {
  const current = await getAdminAchievement(db, id);
  if (!current) throw new Error(`achievements row ${id} not found`);
  const snapshot: AchievementInput = {
    titleId: current.titleId,
    titleEn: current.titleEn,
    issuer: current.issuer,
    year: current.year,
    type: current.type,
    category: current.category,
    descriptionId: current.descriptionId,
    descriptionEn: current.descriptionEn,
    url: current.url,
    sortOrder: current.sortOrder
  };

  await db
    .prepare(
      `UPDATE achievements SET
        title_id = ?, title_en = ?, issuer = ?, year = ?, type = ?, category = ?,
        description_id = ?, description_en = ?, url = ?, sort_order = ?,
        updated_at = datetime('now'),
        previous_snapshot = ?, snapshot_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      input.titleId,
      input.titleEn,
      input.issuer,
      input.year,
      input.type,
      input.category,
      input.descriptionId,
      input.descriptionEn,
      input.url,
      input.sortOrder,
      JSON.stringify(snapshot),
      id
    )
    .run();
}

export async function undoLastAchievementEdit(db: D1Database, id: number): Promise<void> {
  const current = await getAdminAchievement(db, id);
  if (!current || !current.previousSnapshot) return;
  const snapshot = JSON.parse(current.previousSnapshot) as AchievementInput;

  await db
    .prepare(
      `UPDATE achievements SET
        title_id = ?, title_en = ?, issuer = ?, year = ?, type = ?, category = ?,
        description_id = ?, description_en = ?, url = ?, sort_order = ?,
        updated_at = datetime('now'),
        previous_snapshot = NULL, snapshot_at = NULL
       WHERE id = ?`
    )
    .bind(
      snapshot.titleId,
      snapshot.titleEn,
      snapshot.issuer,
      snapshot.year,
      snapshot.type,
      snapshot.category,
      snapshot.descriptionId,
      snapshot.descriptionEn,
      snapshot.url,
      snapshot.sortOrder,
      id
    )
    .run();
}

export async function softDeleteAchievement(db: D1Database, id: number): Promise<void> {
  await db.prepare("UPDATE achievements SET deleted_at = datetime('now') WHERE id = ?").bind(id).run();
}

export async function restoreAchievement(db: D1Database, id: number): Promise<void> {
  await db.prepare('UPDATE achievements SET deleted_at = NULL WHERE id = ?').bind(id).run();
}

export async function hardDeleteAchievement(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM achievements WHERE id = ?').bind(id).run();
}

export async function listTrashedAchievements(db: D1Database): Promise<AchievementRow[]> {
  const {results} = await db
    .prepare('SELECT * FROM achievements WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC')
    .all<DbRow>();
  return results.map(toRow);
}
