export type GuestbookEntry = {
  id: number;
  name: string;
  message: string;
  website?: string;
  createdAt: string;
};

export type GuestbookAdminRow = {
  id: number;
  name: string;
  message: string;
  website: string | null;
  isApproved: boolean;
  createdAt: string;
  deletedAt: string | null;
};

export type GuestbookInput = {
  name: string;
  message: string;
  website?: string | null;
  isApproved?: boolean;
};

type DbRow = {
  id: number;
  name: string;
  message: string;
  website: string | null;
  is_approved: number;
  created_at: string;
  deleted_at: string | null;
};

function toPublic(row: DbRow): GuestbookEntry {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    website: row.website ?? undefined,
    createdAt: row.created_at
  };
}

function toAdminRow(row: DbRow): GuestbookAdminRow {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    website: row.website,
    isApproved: row.is_approved === 1,
    createdAt: row.created_at,
    deletedAt: row.deleted_at
  };
}

export async function listPublicGuestbookEntries(
  db: D1Database,
  limit = 100
): Promise<GuestbookEntry[]> {
  const {results} = await db
    .prepare(
      'SELECT id, name, message, website, is_approved, created_at, deleted_at FROM guestbook_entries WHERE is_approved = 1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ?'
    )
    .bind(limit)
    .all<DbRow>();
  return results.map(toPublic);
}

export async function listAdminGuestbookEntries(db: D1Database): Promise<GuestbookAdminRow[]> {
  const {results} = await db
    .prepare(
      'SELECT id, name, message, website, is_approved, created_at, deleted_at FROM guestbook_entries WHERE deleted_at IS NULL ORDER BY created_at DESC'
    )
    .all<DbRow>();
  return results.map(toAdminRow);
}

export async function listTrashedGuestbookEntries(db: D1Database): Promise<GuestbookAdminRow[]> {
  const {results} = await db
    .prepare(
      'SELECT id, name, message, website, is_approved, created_at, deleted_at FROM guestbook_entries WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
    )
    .all<DbRow>();
  return results.map(toAdminRow);
}

export async function getGuestbookEntry(
  db: D1Database,
  id: number
): Promise<GuestbookAdminRow | null> {
  const row = await db
    .prepare('SELECT id, name, message, website, is_approved, created_at, deleted_at FROM guestbook_entries WHERE id = ?')
    .bind(id)
    .first<DbRow>();
  return row ? toAdminRow(row) : null;
}

export async function createGuestbookEntry(
  db: D1Database,
  input: GuestbookInput
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO guestbook_entries (name, message, website, is_approved) VALUES (?, ?, ?, ?)'
    )
    .bind(
      input.name,
      input.message,
      input.website ?? null,
      input.isApproved !== false ? 1 : 0
    )
    .run();
}

export async function setGuestbookApproval(
  db: D1Database,
  id: number,
  isApproved: boolean
): Promise<void> {
  await db
    .prepare('UPDATE guestbook_entries SET is_approved = ? WHERE id = ?')
    .bind(isApproved ? 1 : 0, id)
    .run();
}

export async function softDeleteGuestbookEntry(db: D1Database, id: number): Promise<void> {
  await db
    .prepare("UPDATE guestbook_entries SET deleted_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run();
}

export async function restoreGuestbookEntry(db: D1Database, id: number): Promise<void> {
  await db
    .prepare('UPDATE guestbook_entries SET deleted_at = NULL WHERE id = ?')
    .bind(id)
    .run();
}

export async function hardDeleteGuestbookEntry(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM guestbook_entries WHERE id = ?').bind(id).run();
}
