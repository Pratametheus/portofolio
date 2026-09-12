import {readFileSync} from 'node:fs';
import path from 'node:path';
import {getPlatformProxy} from 'wrangler';

// Read migration SQL
const MIGRATION_SQL = readFileSync(
  path.resolve(import.meta.dirname, '../../migrations/0001_create_content_tables.sql'),
  'utf-8'
);
const UPLOAD_COLUMNS_MIGRATION_SQL = readFileSync(
  path.resolve(import.meta.dirname, '../../migrations/0002_add_upload_columns.sql'),
  'utf-8'
);

export async function createTestDb(): Promise<{
  db: D1Database;
  dispose: () => Promise<void>;
}> {
  const proxy = await getPlatformProxy<CloudflareEnv>({
    configPath: path.resolve(import.meta.dirname, '../../wrangler.jsonc'),
    persist: false
  });
  const db = proxy.env.DB;
  if (!db) {
    throw new Error('D1 binding "DB" not found — check wrangler.jsonc d1_databases config');
  }
  // Custom SQL statement splitter: normalize line endings, split by semicolons, remove full-line
  // `--` comments. Assumes: no `;` inside string/CHECK literals, no inline or block comments
  // beyond full-line `--` comments, no multi-statement trigger bodies. Revisit if a future
  // migration needs any of these patterns.
  const normalized = MIGRATION_SQL.replace(/\r\n/g, '\n');
  const statements = normalized
    .split(';')
    .map((stmt) => {
      // Remove comment lines and trim
      return stmt
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join(' ')
        .trim();
    })
    .filter((stmt) => stmt.length > 0);

  for (const statement of statements) {
    await db.prepare(statement).run();
  }

  const uploadStatements = UPLOAD_COLUMNS_MIGRATION_SQL
    .replace(/\r\n/g, '\n')
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);
  for (const statement of uploadStatements) {
    await db.prepare(statement).run();
  }

  return {db, dispose: proxy.dispose};
}

export async function resetTestDb(db: D1Database): Promise<void> {
  await db.exec('DELETE FROM career_entries; DELETE FROM achievements;');
}
