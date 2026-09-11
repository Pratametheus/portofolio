/// <reference types="vitest" />
/**
 * @vitest-environment node
 */
import {describe, expect, it} from 'vitest';
import {createTestDb, resetTestDb} from './d1';

describe('createTestDb', () => {
  it('provisions a local D1 binding with the migrated schema', async () => {
    const {db, dispose} = await createTestDb();
    try {
      const {results} = await db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all<{name: string}>();
      const names = results.map((r) => r.name);
      expect(names).toContain('career_entries');
      expect(names).toContain('achievements');
    } finally {
      await dispose();
    }
  });

  it('resetTestDb clears rows without dropping tables', async () => {
    const {db, dispose} = await createTestDb();
    try {
      await db
        .prepare(
          `INSERT INTO career_entries
            (kind, role_id, role_en, organization_id, organization_en, period_id, period_en,
             category_id, category_en, mark, description_id, description_en)
           VALUES ('career','a','a','a','a','a','a','a','a','a','a','a')`
        )
        .run();
      await resetTestDb(db);
      const {results} = await db.prepare('SELECT * FROM career_entries').all();
      expect(results).toHaveLength(0);
    } finally {
      await dispose();
    }
  });
});
