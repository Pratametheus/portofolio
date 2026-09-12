# Admin Content Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the site owner add/edit/remove Karier, Pendidikan, and Pencapaian entries
through a `/admin` panel gated by Cloudflare Access, instead of editing TypeScript files.

**Architecture:** A new Cloudflare D1 database (two tables: `career_entries`,
`achievements`) becomes the source of truth for these three content types. Public pages
(Tentang, Pencapaian, Riset) read from D1 through small repository modules; all three are
marked `export const dynamic = 'force-dynamic'` and re-render fresh from D1 on every
request — no revalidation step, no ISR, no new caching infrastructure (see the spec's
2026-09-11 revision: OpenNext's Cloudflare adapter needs an Incremental Cache + Tag Cache +
DO queue for on-demand revalidation to actually work, none of which exist in this project;
plain SSR needs none of that). Every other route is untouched, still fully static/edge-
cached. `/admin/*` is excluded from the locale proxy and protected entirely at the
Cloudflare edge (Access) — zero application-level auth code. Admin mutations are plain
HTML `<form action={serverAction}>` submissions (no client JavaScript needed for CRUD).
Deletes are soft (a Trash view restores or permanently removes); edits keep one
previous-value snapshot (one-level undo).

**Tech Stack:** Next.js 16 App Router (Server Components, Server Actions), Cloudflare D1,
`wrangler`'s `getPlatformProxy` (already a devDependency — no new packages), Vitest,
Playwright (unchanged — no new e2e coverage for `/admin`, see spec §7).

**Spec:** `docs/superpowers/specs/2026-09-11-admin-content-panel-design.md` — read it
alongside this plan; the plan implements its decisions and does not repeat their
rationale.

## Global Constraints

- **Every admin page that reads D1 data needs `export const dynamic = 'force-dynamic'`**
  — not just the 3 public pages. Found the hard way during Task 8: without it, an admin
  list/edit page is statically prerendered at build time, so a create/edit/delete
  "succeeds" (writes to D1 correctly) but the admin never sees it reflected until the
  next full rebuild+deploy. Applies to every page under `src/app/admin/` that calls a
  repository read function — the list pages and the `[id]` edit pages alike.
  `src/app/admin/page.tsx` (the plain-links dashboard, no D1 read) is the one exception.
- Bilingual everywhere: every `career_entries`/`achievements` row has independent
  `_id`/`_en` text columns; every admin form edits both languages together.
- `achievements.type`/`category` are canonical Indonesian enum values consumed through the
  existing `src/lib/taxonomy-labels.ts` maps — do not invent a second taxonomy.
  `career_entries.category` is free bilingual text, not an enum (matches the current data).
- Public repository reads always filter `WHERE deleted_at IS NULL`.
- No new npm dependencies. `getPlatformProxy` from `wrangler` (already installed) provides
  local D1 access for both tests and `next dev`.
- JS budget (`npm run check:size`, 210 KB gzip) applies to public routes only. Admin routes
  are plain server-rendered forms — no client bundle of note is expected, but the gate
  still runs against public routes exactly as today, so nothing here should move it.
- `tsc --noEmit` requires `npm run cf:typegen` to have been run first (regenerates the
  gitignored `cloudflare-env.d.ts` with the new `DB` binding type) — run it after Task 1's
  `wrangler.jsonc` change, and again any time `wrangler.jsonc` changes.
- Every task's tests run via the project's existing single `vitest.config.mts`
  (`tests/**/*.test.{ts,tsx}`, jsdom environment) — no new Vitest project/pool is needed.

---

### Task 1: Provision D1, migration schema, and local-dev wiring

**Files:**
- Modify: `wrangler.jsonc`
- Modify: `next.config.ts`
- Create: `migrations/0001_create_content_tables.sql`

**Interfaces:**
- Produces: a D1 binding named `DB` (`D1Database`, from `@cloudflare/workers-types` /
  `cloudflare-env.d.ts` after typegen), reachable via
  `getCloudflareContext({async: true})` in server code, `getPlatformProxy` in tests, and
  `initOpenNextCloudflareForDev()` in `next dev`. Two tables: `career_entries`,
  `achievements`, exact schema below — every later task's SQL depends on these exact
  column names.

- [ ] **Step 1: Create the D1 databases**

Run (this creates two real Cloudflare resources under the account already hosting the
Worker — confirm before running if executing this plan live rather than reviewing it):

```bash
npx wrangler d1 create portofolio-admin
npx wrangler d1 create portofolio-admin-staging
```

Each command prints a block like:

```
[[d1_databases]]
binding = "DB"
database_name = "portofolio-admin"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy both `database_id` values — Step 2 needs them.

- [ ] **Step 2: Add the D1 bindings to `wrangler.jsonc`**

Add a top-level `d1_databases` array (production) and one inside `env.staging` (staging),
using the two `database_id` values from Step 1:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "portofolio",
  "account_id": "06d5d4ba7c6c2dcbbd02ceb7133e0163",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-08-31",
  "compatibility_flags": ["nodejs_compat"],
  "workers_dev": true,
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "images": {"binding": "IMAGES"},
  "services": [
    {"binding": "WORKER_SELF_REFERENCE", "service": "portofolio"}
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "portofolio-admin",
      "database_id": "<paste production database_id here>",
      "migrations_dir": "migrations"
    }
  ],
  "observability": {"enabled": true},
  "env": {
    "staging": {
      "name": "portofolio-staging",
      "assets": {
        "directory": ".open-next/assets",
        "binding": "ASSETS"
      },
      "images": {"binding": "IMAGES"},
      "services": [
        {"binding": "WORKER_SELF_REFERENCE", "service": "portofolio-staging"}
      ],
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "portofolio-admin-staging",
          "database_id": "<paste staging database_id here>",
          "migrations_dir": "migrations"
        }
      ]
    }
  }
}
```

- [ ] **Step 3: Write the migration**

```sql
-- migrations/0001_create_content_tables.sql

CREATE TABLE career_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('career', 'education')),
  role_id TEXT NOT NULL,
  role_en TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  organization_en TEXT NOT NULL,
  period_id TEXT NOT NULL,
  period_en TEXT NOT NULL,
  category_id TEXT NOT NULL,
  category_en TEXT NOT NULL,
  mark TEXT NOT NULL,
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  previous_snapshot TEXT,
  snapshot_at TEXT
);

CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Publikasi', 'Sertifikat')),
  category TEXT NOT NULL CHECK (category IN ('Keamanan', 'Pendidikan', 'Pengembangan')),
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  previous_snapshot TEXT,
  snapshot_at TEXT
);
```

- [ ] **Step 4: Apply the migration locally and remotely (both environments)**

```bash
npx wrangler d1 migrations apply portofolio-admin --local
npx wrangler d1 migrations apply portofolio-admin --remote
npx wrangler d1 migrations apply portofolio-admin-staging --local
npx wrangler d1 migrations apply portofolio-admin-staging --remote
```

- [ ] **Step 5: Verify the schema**

```bash
npx wrangler d1 execute portofolio-admin --local --command "SELECT name FROM sqlite_master WHERE type='table'"
```

Expected: `career_entries` and `achievements` listed (plus wrangler's own
`d1_migrations` bookkeeping table).

- [ ] **Step 6: Enable D1 access under `next dev`**

Edit `next.config.ts`:

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true
  },
  images: {
    // Cloudflare Workers Free plan: every `/_next/image` request invokes the
    // Worker and counts against the 100k/day cap. The portfolio's images are a
    // handful of pre-sized .webp files under public/, so serve them straight
    // from static assets (free, no Worker) instead of on-the-fly optimisation.
    unoptimized: true
  }
};

export default createNextIntlPlugin()(nextConfig);

initOpenNextCloudflareForDev();
```

- [ ] **Step 7: Regenerate Cloudflare types and verify**

```bash
npm run cf:typegen
npx tsc --noEmit
```

Expected: clean (no errors) — `cloudflare-env.d.ts` now declares `DB: D1Database` on
`CloudflareEnv` and nothing yet references it.

- [ ] **Step 8: Commit**

```bash
git add wrangler.jsonc next.config.ts migrations/0001_create_content_tables.sql
git commit -m "feat(admin): provision D1 database and content tables"
```

`cloudflare-env.d.ts` stays gitignored (unchanged convention) — do not add it.

---

### Task 2: Local D1 test helper

**Files:**
- Create: `tests/helpers/d1.ts`
- Test: `tests/helpers/d1.test.ts`

**Interfaces:**
- Consumes: `migrations/0001_create_content_tables.sql` (Task 1), `getPlatformProxy` from
  `wrangler`.
- Produces: `createTestDb(): Promise<{db: D1Database; dispose: () => Promise<void>}>` —
  every later repository test file uses this. `resetTestDb(db: D1Database): Promise<void>`
  — clears all rows between tests without tearing down the proxy.

- [ ] **Step 1: Write the failing test**

```ts
// tests/helpers/d1.test.ts
import {describe, expect, it, afterAll} from 'vitest';
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/helpers/d1.test.ts`
Expected: FAIL — `Cannot find module './d1'` (or similar; the helper doesn't exist yet).

- [ ] **Step 3: Write the helper**

```ts
// tests/helpers/d1.ts
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {getPlatformProxy} from 'wrangler';

const MIGRATION_SQL = readFileSync(
  path.resolve(import.meta.dirname, '../../migrations/0001_create_content_tables.sql'),
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
  await db.exec(MIGRATION_SQL);
  return {db, dispose: proxy.dispose};
}

export async function resetTestDb(db: D1Database): Promise<void> {
  await db.exec('DELETE FROM career_entries; DELETE FROM achievements;');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/helpers/d1.test.ts`
Expected: PASS (2 tests). If it fails with a binding-not-found error, re-check that Task
1's `wrangler.jsonc` `d1_databases` block was saved and that `migrations_dir` matches the
real `migrations/` folder location.

- [ ] **Step 5: Commit**

```bash
git add tests/helpers/d1.ts tests/helpers/d1.test.ts
git commit -m "test(admin): add local D1 test helper"
```

---

### Task 3: Career/Education repository

**Files:**
- Create: `src/lib/repositories/career.ts`
- Test: `tests/repositories/career.test.ts`

**Interfaces:**
- Consumes: `tests/helpers/d1.ts` (`createTestDb`, `resetTestDb`) in tests; `D1Database`
  binding in production code.
- Produces (all consumed by later tasks — exact names/types matter):
  - `type CareerEntry = {role: string; organization: string; period: string; category: string; mark: string; description: string}`
    (unchanged shape from the retired `src/content/career.ts` — Task 6 repoints
    `career-card.tsx` to import this instead).
  - `type CareerKind = 'career' | 'education'`
  - `type CareerEntryRow = {id: number; kind: CareerKind; roleId: string; roleEn: string; organizationId: string; organizationEn: string; periodId: string; periodEn: string; categoryId: string; categoryEn: string; mark: string; descriptionId: string; descriptionEn: string; sortOrder: number; deletedAt: string | null; previousSnapshot: string | null; snapshotAt: string | null}`
  - `type CareerEntryInput = Omit<CareerEntryRow, 'id' | 'deletedAt' | 'previousSnapshot' | 'snapshotAt'>`
  - `listPublicCareerEntries(db: D1Database, kind: CareerKind, locale: 'id' | 'en'): Promise<CareerEntry[]>`
  - `listAdminCareerEntries(db: D1Database, kind: CareerKind): Promise<CareerEntryRow[]>`
  - `getAdminCareerEntry(db: D1Database, id: number): Promise<CareerEntryRow | null>`
  - `createCareerEntry(db: D1Database, input: CareerEntryInput): Promise<void>`
  - `updateCareerEntry(db: D1Database, id: number, input: CareerEntryInput): Promise<void>`
  - `softDeleteCareerEntry(db: D1Database, id: number): Promise<void>`
  - `restoreCareerEntry(db: D1Database, id: number): Promise<void>`
  - `hardDeleteCareerEntry(db: D1Database, id: number): Promise<void>`
  - `undoLastCareerEdit(db: D1Database, id: number): Promise<void>`
  - `listTrashedCareerEntries(db: D1Database): Promise<CareerEntryRow[]>`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/repositories/career.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/repositories/career.test.ts`
Expected: FAIL — `Cannot find module '@/lib/repositories/career'`.

- [ ] **Step 3: Implement the repository**

```ts
// src/lib/repositories/career.ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/repositories/career.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/lib/repositories/career.ts tests/repositories/career.test.ts
git commit -m "feat(admin): career/education D1 repository with soft-delete and undo"
```

---

### Task 4: Achievements repository

**Files:**
- Create: `src/lib/repositories/achievements.ts`
- Test: `tests/repositories/achievements.test.ts`

**Interfaces:**
- Consumes: `tests/helpers/d1.ts`, `src/lib/taxonomy-labels.ts` (types only, for the
  `type`/`category` string-union values — not imported, just kept in sync by convention).
- Produces:
  - `type Achievement = {title: string; issuer: string; year: string; type: 'Publikasi' | 'Sertifikat'; category: 'Keamanan' | 'Pendidikan' | 'Pengembangan'; description: string; url?: string}`
    (unchanged shape — Task 6 repoints the three components that import this type).
  - `type AchievementRow = {id: number; titleId: string; titleEn: string; issuer: string; year: string; type: 'Publikasi' | 'Sertifikat'; category: 'Keamanan' | 'Pendidikan' | 'Pengembangan'; descriptionId: string; descriptionEn: string; url: string | null; sortOrder: number; deletedAt: string | null; previousSnapshot: string | null; snapshotAt: string | null}`
  - `type AchievementInput = Omit<AchievementRow, 'id' | 'deletedAt' | 'previousSnapshot' | 'snapshotAt'>`
  - `listPublicAchievements(db: D1Database, locale: 'id' | 'en'): Promise<Achievement[]>`
  - `getFeaturedPublication(db: D1Database, locale: 'id' | 'en'): Promise<Achievement | null>`
  - `listAdminAchievements(db: D1Database): Promise<AchievementRow[]>`
  - `getAdminAchievement(db: D1Database, id: number): Promise<AchievementRow | null>`
  - `createAchievement(db: D1Database, input: AchievementInput): Promise<void>`
  - `updateAchievement(db: D1Database, id: number, input: AchievementInput): Promise<void>`
  - `softDeleteAchievement(db: D1Database, id: number): Promise<void>`
  - `restoreAchievement(db: D1Database, id: number): Promise<void>`
  - `hardDeleteAchievement(db: D1Database, id: number): Promise<void>`
  - `undoLastAchievementEdit(db: D1Database, id: number): Promise<void>`
  - `listTrashedAchievements(db: D1Database): Promise<AchievementRow[]>`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/repositories/achievements.test.ts
import {describe, expect, it, beforeEach, afterAll, beforeAll} from 'vitest';
import {createTestDb, resetTestDb} from '../helpers/d1';
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
  sortOrder: 0
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
      url: 'https://doi.org/x'
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/repositories/achievements.test.ts`
Expected: FAIL — `Cannot find module '@/lib/repositories/achievements'`.

- [ ] **Step 3: Implement the repository**

```ts
// src/lib/repositories/achievements.ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/repositories/achievements.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/lib/repositories/achievements.ts tests/repositories/achievements.test.ts
git commit -m "feat(admin): achievements D1 repository with soft-delete and undo"
```

---

### Task 5: Seed data, retire old content files, wire public pages

**Files:**
- Create: `scripts/seed-initial-content.sql`
- Modify: `src/app/[locale]/tentang/page.tsx`
- Modify: `src/app/[locale]/pencapaian/page.tsx`
- Modify: `src/app/[locale]/riset/page.tsx`
- Modify: `src/components/career-card.tsx`
- Modify: `src/components/achievement-card.tsx`
- Modify: `src/components/achievement-filters.tsx`
- Modify: `src/components/publication-list-card.tsx`
- Delete: `src/content/career.ts`
- Delete: `src/content/achievements.ts`
- Delete: `tests/career.test.ts`

**Interfaces:**
- Consumes: `src/lib/repositories/career.ts` (Task 3), `src/lib/repositories/achievements.ts`
  (Task 4).
- Produces: nothing new — this task removes the old data source and repoints existing
  consumers to the repositories. Public page output must stay byte-identical.

- [ ] **Step 1: Write the seed SQL**

```sql
-- scripts/seed-initial-content.sql
-- One-time seed of the content that was previously hard-coded in
-- src/content/career.ts and src/content/achievements.ts. Run once per
-- database (local, then remote, then the staging database) — see Step 2.

INSERT INTO career_entries
  (kind, role_id, role_en, organization_id, organization_en, period_id, period_en,
   category_id, category_en, mark, description_id, description_en, sort_order)
VALUES (
  'career',
  'Guru Informatika', 'Computing Teacher',
  'SDN Ujung XIII/38', 'SDN Ujung XIII/38',
  'Mulai April 2026', 'Since April 2026',
  'Pendidikan', 'Education',
  'SD',
  'Mengajar komputer untuk kelas 4, 5, dan 6. Menyusun materi sesuai kebutuhan dan keterbatasan sekolah, serta membangun SIAKAD Informatika untuk mendukung kegiatan mengajar.',
  'Teaching computing to grades 4, 5 and 6. Building the syllabus around the school''s real needs and constraints, and building SIAKAD Informatika to support the teaching.',
  0
);

INSERT INTO achievements
  (title_id, title_en, issuer, year, type, category, description_id, description_en, url, sort_order)
VALUES (
  'Analisis Kerentanan Keamanan Aplikasi Web Menggunakan Metode Black Box Testing',
  'Web Application Security Vulnerability Analysis Using Black Box Testing',
  'JUTIF · Vol. 7 No. 2',
  '2026',
  'Publikasi',
  'Keamanan',
  'Artikel penelitian dengan sepuluh skenario pengujian. Terbit pada halaman 1834-1852 di jurnal terakreditasi SINTA 2.',
  'A research article with ten test scenarios. Published on pages 1834-1852 in a SINTA 2 accredited journal.',
  'https://doi.org/10.52436/1.jutif.2026.7.2.5662',
  0
);
```

- [ ] **Step 2: Run the seed against local, then remote, then staging**

```bash
npx wrangler d1 execute portofolio-admin --local --file=scripts/seed-initial-content.sql
npx wrangler d1 execute portofolio-admin --remote --file=scripts/seed-initial-content.sql
npx wrangler d1 execute portofolio-admin-staging --local --file=scripts/seed-initial-content.sql
npx wrangler d1 execute portofolio-admin-staging --remote --file=scripts/seed-initial-content.sql
```

Verify: `npx wrangler d1 execute portofolio-admin --remote --command "SELECT role_id, title_id FROM career_entries, achievements"` returns the expected one row each (adjust the query if the join reads oddly — a simpler two-command check works too: `SELECT role_id FROM career_entries` and `SELECT title_id FROM achievements` separately).

- [ ] **Step 3: Repoint the type-consuming components**

In `src/components/career-card.tsx`, change:
```ts
import type {CareerEntry} from '@/content/career';
```
to:
```ts
import type {CareerEntry} from '@/lib/repositories/career';
```

In `src/components/achievement-card.tsx`, `src/components/achievement-filters.tsx`, and
`src/components/publication-list-card.tsx`, change:
```ts
import type {Achievement} from '@/content/achievements';
```
to:
```ts
import type {Achievement} from '@/lib/repositories/achievements';
```

- [ ] **Step 4: Wire `tentang/page.tsx` to the repository**

Replace the import and data access:
```ts
// before
import {CAREER, EDUCATION} from '@/content/career';
// ...
<Timeline entries={CAREER[locale]} />
// ...
<Timeline entries={EDUCATION[locale]}>
```
```ts
// after
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listPublicCareerEntries} from '@/lib/repositories/career';

export const dynamic = 'force-dynamic';
```
(add the `export const dynamic` line near the top of the file, alongside the existing
`generateMetadata` export — it must be a module-level export, not inside the component.)

In the component body, before the `return`:
```ts
const {env} = await getCloudflareContext({async: true});
const [career, education] = await Promise.all([
  listPublicCareerEntries(env.DB, 'career', locale),
  listPublicCareerEntries(env.DB, 'education', locale)
]);
```
Then use `<Timeline entries={career} />` and `<Timeline entries={education}>` in place of
the old `CAREER[locale]` / `EDUCATION[locale]`.

- [ ] **Step 5: Wire `pencapaian/page.tsx` to the repository**

Replace:
```ts
import {ACHIEVEMENTS} from '@/content/achievements';
// ...
<AchievementFilters items={ACHIEVEMENTS[locale]} />
```
with:
```ts
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listPublicAchievements} from '@/lib/repositories/achievements';

export const dynamic = 'force-dynamic';
```
and, in the component body:
```ts
const {env} = await getCloudflareContext({async: true});
const achievements = await listPublicAchievements(env.DB, locale);
```
then `<AchievementFilters items={achievements} />`.

- [ ] **Step 6: Wire `riset/page.tsx` to the repository**

Replace:
```ts
import {ACHIEVEMENTS} from '@/content/achievements';
// ...
const publication = ACHIEVEMENTS[locale][0];
```
with:
```ts
import {notFound} from 'next/navigation'; // already imported above in this file
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {getFeaturedPublication} from '@/lib/repositories/achievements';

export const dynamic = 'force-dynamic';
```
and, in the component body:
```ts
const {env} = await getCloudflareContext({async: true});
const publication = await getFeaturedPublication(env.DB, locale);
if (!publication) notFound();
```
(`notFound()` is the correct fallback here, not a fabricated placeholder — the page has no
meaningful content without a featured publication, and today there is always exactly one.
`getFeaturedPublication` returning `null` only happens if every achievement is deleted.)

All three pages now render dynamically (see spec §1 decision 5) — verify this explicitly
in Step 10 below by checking the `next build` route listing shows `ƒ` (dynamic), not `●`
or `○`, for `/[locale]/tentang`, `/[locale]/pencapaian`, `/[locale]/riset`.

- [ ] **Step 7: Delete the retired content files and their test**

```bash
git rm src/content/career.ts src/content/achievements.ts tests/career.test.ts
```

- [ ] **Step 8: Run the full existing test suite**

Run: `npm test -- --run`
Expected: PASS, same file/test count as before this task minus `tests/career.test.ts`'s 2
tests (they were superseded by Task 3's repository tests).

- [ ] **Step 9: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean — confirms no remaining import of the deleted `@/content/career` or
`@/content/achievements`.

- [ ] **Step 10: Build and manually verify unchanged output**

```bash
npm run build
```
Check the route listing: `/[locale]/tentang`, `/[locale]/pencapaian`, `/[locale]/riset`
should now show `ƒ` (dynamic — server-rendered on demand), not `●`/`○`. Every other route
should be unchanged from before this task.

Then start it and compare against the pre-change pages (they must render identically —
same text, same order):
```bash
npm run start -- -p 4176
```
Visit `http://localhost:4176/id/tentang`, `/en/about`, `/id/pencapaian`,
`/en/achievements`, `/id/riset`, `/en/research` and confirm the career/education/
publication content matches what was hard-coded before (the single "Guru Informatika" /
"Computing Teacher" entry, empty education state, single JUTIF publication). Stop the
server afterward.

- [ ] **Step 11: Run e2e regression**

Run: `npx playwright test`
Expected: PASS, same count as before this task (these pages' output contract is
unchanged, only the data source moved).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat(admin): wire Tentang/Pencapaian/Riset to D1, retire hard-coded content files"
```

---

### Task 6: Admin route scaffold, excluded from the locale proxy

**Files:**
- Modify: `src/proxy.ts`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Produces: `/admin` route tree root, reachable without a locale prefix and without
  triggering next-intl's redirect/rewrite behavior. Later tasks add pages under
  `src/app/admin/*`.

- [ ] **Step 1: Exclude `/admin` from the locale proxy matcher**

```ts
// src/proxy.ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|admin|_next|_vercel|.*\\..*).*)'
};
```

- [ ] **Step 2: Minimal admin layout**

```tsx
// src/app/admin/layout.tsx
export const metadata = {
  title: 'Admin',
  robots: {index: false, follow: false}
};

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body style={{fontFamily: 'system-ui, sans-serif', margin: 0, padding: '2rem', background: '#f7f3ec', color: '#2b2620'}}>
        <header style={{marginBottom: '2rem', borderBottom: '1px solid #ddd4c3', paddingBottom: '1rem'}}>
          <strong>Ruang Kerja — Admin</strong>
        </header>
        {children}
      </body>
    </html>
  );
}
```

`/admin` sits outside `[locale]`, so it needs its own `<html>`/`<body>` (there is no
locale-layout wrapper providing one here) — this mirrors how `global-not-found.tsx`
already stands alone outside `[locale]` in this codebase.

- [ ] **Step 3: Admin dashboard page**

```tsx
// src/app/admin/page.tsx
import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <nav style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
      <Link href="/admin/career">Karier</Link>
      <Link href="/admin/education">Pendidikan</Link>
      <Link href="/admin/achievements">Pencapaian</Link>
      <Link href="/admin/trash">Sampah</Link>
    </nav>
  );
}
```

- [ ] **Step 4: Verify the proxy exclusion manually**

```bash
npm run build && npm run start -- -p 4176
```
Visit `http://localhost:4176/admin` — expected: loads directly (no redirect to
`/id/admin` or similar). Visit `http://localhost:4176/` — expected: still redirects to
`/id` or `/en` as before (the exclusion is scoped to `/admin` only). Stop the server.

- [ ] **Step 5: Run the existing test suite (regression check on the proxy matcher)**

Run: `npm test -- --run && npx playwright test`
Expected: PASS, unchanged — no existing test exercises `/admin`, and the locale-prefix
behavior for every other route is untouched.

- [ ] **Step 6: Commit**

```bash
git add src/proxy.ts src/app/admin/layout.tsx src/app/admin/page.tsx
git commit -m "feat(admin): scaffold /admin route tree, excluded from the locale proxy"
```

---

### Task 7: Career/Education Server Actions and shared form

**Files:**
- Create: `src/lib/actions/career-entries.ts`
- Test: `tests/actions/career-entries.test.ts`
- Create: `src/components/admin/career-entry-form.tsx`
- Create: `src/components/admin/career-entry-list.tsx`

**Interfaces:**
- Consumes: `src/lib/repositories/career.ts` (Task 3), `CareerEntryInput`/`CareerEntryRow`/
  `CareerKind` types.
- Produces:
  - `parseCareerEntryForm(formData: FormData, kind: CareerKind): CareerEntryInput` (throws
    `Error` with a human-readable message on invalid input — pure function, no D1 access,
    directly unit-testable).
  - `createCareerEntryAction(kind: CareerKind, formData: FormData): Promise<void>` (`'use
    server'`, calls `redirect`)
  - `updateCareerEntryAction(id: number, kind: CareerKind, formData: FormData): Promise<void>`
  - `softDeleteCareerEntryAction(kind: CareerKind, id: number): Promise<void>`
  - `undoCareerEntryEditAction(kind: CareerKind, id: number): Promise<void>`
  - `<CareerEntryForm kind={CareerKind} entry={CareerEntryRow | null} />` — Server
    Component, `entry={null}` renders a blank "create" form.
  - `<CareerEntryList kind={CareerKind} title={string} entries={CareerEntryRow[]} />` —
    Server Component.

- [ ] **Step 1: Write the failing test for form parsing**

```ts
// tests/actions/career-entries.test.ts
import {describe, expect, it} from 'vitest';
import {parseCareerEntryForm} from '@/lib/actions/career-entries';

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/actions/career-entries.test.ts`
Expected: FAIL — `Cannot find module '@/lib/actions/career-entries'`.

- [ ] **Step 3: Implement the Server Actions module**

```ts
// src/lib/actions/career-entries.ts
'use server';

import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {
  createCareerEntry,
  updateCareerEntry,
  softDeleteCareerEntry,
  undoLastCareerEdit,
  type CareerEntryInput,
  type CareerKind
} from '@/lib/repositories/career';

const REQUIRED_FIELDS = [
  'roleId', 'roleEn',
  'organizationId', 'organizationEn',
  'periodId', 'periodEn',
  'categoryId', 'categoryEn',
  'mark',
  'descriptionId', 'descriptionEn'
] as const;

export function parseCareerEntryForm(formData: FormData, kind: CareerKind): CareerEntryInput {
  const values: Record<string, string> = {};
  for (const field of REQUIRED_FIELDS) {
    const raw = formData.get(field);
    if (typeof raw !== 'string' || raw.trim() === '') {
      throw new Error(`Field "${field}" is required`);
    }
    values[field] = raw;
  }

  const sortOrderRaw = formData.get('sortOrder');
  let sortOrder = 0;
  if (typeof sortOrderRaw === 'string' && sortOrderRaw.trim() !== '') {
    sortOrder = Number(sortOrderRaw);
    if (!Number.isFinite(sortOrder)) {
      throw new Error('Field "sortOrder" must be a number');
    }
  }

  return {
    kind,
    roleId: values.roleId,
    roleEn: values.roleEn,
    organizationId: values.organizationId,
    organizationEn: values.organizationEn,
    periodId: values.periodId,
    periodEn: values.periodEn,
    categoryId: values.categoryId,
    categoryEn: values.categoryEn,
    mark: values.mark,
    descriptionId: values.descriptionId,
    descriptionEn: values.descriptionEn,
    sortOrder
  };
}

function listPathFor(kind: CareerKind): string {
  return kind === 'career' ? '/admin/career' : '/admin/education';
}

export async function createCareerEntryAction(
  kind: CareerKind,
  formData: FormData
): Promise<void> {
  const input = parseCareerEntryForm(formData, kind);
  const {env} = await getCloudflareContext({async: true});
  await createCareerEntry(env.DB, input);
  redirect(listPathFor(kind));
}

export async function updateCareerEntryAction(
  id: number,
  kind: CareerKind,
  formData: FormData
): Promise<void> {
  const input = parseCareerEntryForm(formData, kind);
  const {env} = await getCloudflareContext({async: true});
  await updateCareerEntry(env.DB, id, input);
  redirect(listPathFor(kind));
}

export async function softDeleteCareerEntryAction(kind: CareerKind, id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await softDeleteCareerEntry(env.DB, id);
  redirect(listPathFor(kind));
}

export async function undoCareerEntryEditAction(kind: CareerKind, id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await undoLastCareerEdit(env.DB, id);
  redirect(listPathFor(kind));
}
```

`/tentang` is `force-dynamic` (Task 5), so no revalidation call is needed here — the very
next visitor request re-reads D1 fresh.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/actions/career-entries.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Build the shared bilingual form**

```tsx
// src/components/admin/career-entry-form.tsx
import type {CareerEntryRow, CareerKind} from '@/lib/repositories/career';
import {createCareerEntryAction, updateCareerEntryAction} from '@/lib/actions/career-entries';

const FIELD_STYLE: React.CSSProperties = {display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem'};
const COLUMN_STYLE: React.CSSProperties = {flex: 1, padding: '1rem', border: '1px solid #ddd4c3', borderRadius: 8};

export function CareerEntryForm({kind, entry}: {kind: CareerKind; entry: CareerEntryRow | null}) {
  const action = entry
    ? updateCareerEntryAction.bind(null, entry.id, kind)
    : createCareerEntryAction.bind(null, kind);

  return (
    <form action={action} style={{maxWidth: 720}}>
      <div style={{display: 'flex', gap: '1rem'}}>
        <div style={COLUMN_STYLE}>
          <h3>Indonesia</h3>
          <label>Peran<input style={FIELD_STYLE} name="roleId" defaultValue={entry?.roleId} required /></label>
          <label>Organisasi<input style={FIELD_STYLE} name="organizationId" defaultValue={entry?.organizationId} required /></label>
          <label>Periode<input style={FIELD_STYLE} name="periodId" defaultValue={entry?.periodId} required /></label>
          <label>Kategori<input style={FIELD_STYLE} name="categoryId" defaultValue={entry?.categoryId} required /></label>
          <label>Deskripsi<textarea style={FIELD_STYLE} name="descriptionId" defaultValue={entry?.descriptionId} required /></label>
        </div>
        <div style={COLUMN_STYLE}>
          <h3>English</h3>
          <label>Role<input style={FIELD_STYLE} name="roleEn" defaultValue={entry?.roleEn} required /></label>
          <label>Organization<input style={FIELD_STYLE} name="organizationEn" defaultValue={entry?.organizationEn} required /></label>
          <label>Period<input style={FIELD_STYLE} name="periodEn" defaultValue={entry?.periodEn} required /></label>
          <label>Category<input style={FIELD_STYLE} name="categoryEn" defaultValue={entry?.categoryEn} required /></label>
          <label>Description<textarea style={FIELD_STYLE} name="descriptionEn" defaultValue={entry?.descriptionEn} required /></label>
        </div>
      </div>
      <div style={{marginTop: '1rem'}}>
        <label>Mark (2 huruf)<input style={FIELD_STYLE} name="mark" defaultValue={entry?.mark} maxLength={2} required /></label>
        <label>Urutan tampil<input style={FIELD_STYLE} name="sortOrder" type="number" defaultValue={entry?.sortOrder ?? 0} /></label>
      </div>
      <button type="submit" style={{marginTop: '1rem'}}>Simpan</button>
    </form>
  );
}
```

- [ ] **Step 6: Build the shared list view**

```tsx
// src/components/admin/career-entry-list.tsx
import Link from 'next/link';
import type {CareerEntryRow, CareerKind} from '@/lib/repositories/career';
import {softDeleteCareerEntryAction, undoCareerEntryEditAction} from '@/lib/actions/career-entries';

export function CareerEntryList({
  kind,
  title,
  entries
}: {
  kind: CareerKind;
  title: string;
  entries: CareerEntryRow[];
}) {
  const basePath = kind === 'career' ? '/admin/career' : '/admin/education';

  return (
    <section>
      <h2>{title}</h2>
      <Link href={`${basePath}/new`}>+ Tambah</Link>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id} style={{marginTop: '0.75rem'}}>
            <strong>{entry.roleId}</strong> / {entry.roleEn} — {entry.organizationId}
            {' · '}
            <Link href={`${basePath}/${entry.id}`}>Edit</Link>
            {' · '}
            {entry.previousSnapshot ? (
              <form action={undoCareerEntryEditAction.bind(null, kind, entry.id)} style={{display: 'inline'}}>
                <button type="submit">Urungkan perubahan dari {entry.snapshotAt}</button>
              </form>
            ) : null}
            {' · '}
            <form action={softDeleteCareerEntryAction.bind(null, kind, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add src/lib/actions/career-entries.ts tests/actions/career-entries.test.ts src/components/admin/career-entry-form.tsx src/components/admin/career-entry-list.tsx
git commit -m "feat(admin): career/education Server Actions and shared bilingual form"
```

---

### Task 8: Career and Education admin pages

**Files:**
- Create: `src/app/admin/career/page.tsx`
- Create: `src/app/admin/career/[id]/page.tsx`
- Create: `src/app/admin/education/page.tsx`
- Create: `src/app/admin/education/[id]/page.tsx`

**Interfaces:**
- Consumes: `listAdminCareerEntries`, `getAdminCareerEntry` (Task 3);
  `<CareerEntryList>`, `<CareerEntryForm>` (Task 7).

- [ ] **Step 1: Career list page**

```tsx
// src/app/admin/career/page.tsx
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listAdminCareerEntries} from '@/lib/repositories/career';
import {CareerEntryList} from '@/components/admin/career-entry-list';

export const dynamic = 'force-dynamic';

export default async function AdminCareerPage() {
  const {env} = await getCloudflareContext({async: true});
  const entries = await listAdminCareerEntries(env.DB, 'career');
  return <CareerEntryList kind="career" title="Karier" entries={entries} />;
}
```

- [ ] **Step 2: Career create-or-edit page**

`[id]` matches both a numeric id and the literal path segment `new` — when it's `new`, the
form starts blank.

```tsx
// src/app/admin/career/[id]/page.tsx
import {notFound} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {getAdminCareerEntry} from '@/lib/repositories/career';
import {CareerEntryForm} from '@/components/admin/career-entry-form';

export const dynamic = 'force-dynamic';

export default async function AdminCareerEntryPage({
  params
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  if (id === 'new') {
    return <CareerEntryForm kind="career" entry={null} />;
  }
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();
  const {env} = await getCloudflareContext({async: true});
  const entry = await getAdminCareerEntry(env.DB, numericId);
  if (!entry) notFound();
  return <CareerEntryForm kind="career" entry={entry} />;
}
```

- [ ] **Step 3: Education list and create-or-edit pages**

```tsx
// src/app/admin/education/page.tsx
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listAdminCareerEntries} from '@/lib/repositories/career';
import {CareerEntryList} from '@/components/admin/career-entry-list';

export const dynamic = 'force-dynamic';

export default async function AdminEducationPage() {
  const {env} = await getCloudflareContext({async: true});
  const entries = await listAdminCareerEntries(env.DB, 'education');
  return <CareerEntryList kind="education" title="Pendidikan" entries={entries} />;
}
```

```tsx
// src/app/admin/education/[id]/page.tsx
import {notFound} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {getAdminCareerEntry} from '@/lib/repositories/career';
import {CareerEntryForm} from '@/components/admin/career-entry-form';

export const dynamic = 'force-dynamic';

export default async function AdminEducationEntryPage({
  params
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  if (id === 'new') {
    return <CareerEntryForm kind="education" entry={null} />;
  }
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();
  const {env} = await getCloudflareContext({async: true});
  const entry = await getAdminCareerEntry(env.DB, numericId);
  if (!entry) notFound();
  return <CareerEntryForm kind="education" entry={entry} />;
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Manual verification**

```bash
npm run build && npm run start -- -p 4176
```
Visit `http://localhost:4176/admin/career`, click "+ Tambah", fill both columns, submit —
expected: redirected back to `/admin/career`, the new entry listed. Click "Edit" on it,
change a field, submit — expected: change reflected, an "Urungkan perubahan dari ..."
button now appears; click it — expected: field reverts, the undo button disappears. Click
"Hapus" — expected: entry disappears from the list. Repeat the create flow once for
`/admin/education`. Visit `http://localhost:4176/id/tentang` and confirm the new entries
appear there too (the page is `force-dynamic`, so this works with no extra step). Stop the
server.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/career src/app/admin/education
git commit -m "feat(admin): career and education admin pages"
```

---

### Task 9: Achievement Server Actions and form

**Files:**
- Create: `src/lib/actions/achievements.ts`
- Test: `tests/actions/achievements.test.ts`
- Create: `src/components/admin/achievement-form.tsx`

**Interfaces:**
- Consumes: `src/lib/repositories/achievements.ts` (Task 4),
  `src/lib/taxonomy-labels.ts` (`ACHIEVEMENT_TYPE_LABEL_KEY`,
  `ACHIEVEMENT_CATEGORY_LABEL_KEY` — for the `<select>` option labels).
- Produces:
  - `parseAchievementForm(formData: FormData): AchievementInput` (throws on invalid
    input, including an invalid `type`/`category`/`url`).
  - `createAchievementAction`, `updateAchievementAction`, `softDeleteAchievementAction`,
    `undoAchievementEditAction` — same shape as Task 7's career actions.
  - `<AchievementForm entry={AchievementRow | null} />`

- [ ] **Step 1: Write the failing test**

```ts
// tests/actions/achievements.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/actions/achievements.test.ts`
Expected: FAIL — `Cannot find module '@/lib/actions/achievements'`.

- [ ] **Step 3: Implement the Server Actions module**

```ts
// src/lib/actions/achievements.ts
import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {
  createAchievement,
  updateAchievement,
  softDeleteAchievement,
  undoLastAchievementEdit,
  type AchievementInput,
  type AchievementType,
  type AchievementCategory
} from '@/lib/repositories/achievements';

const ACHIEVEMENT_TYPES: AchievementType[] = ['Publikasi', 'Sertifikat'];
const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = ['Keamanan', 'Pendidikan', 'Pengembangan'];

const REQUIRED_TEXT_FIELDS = [
  'titleId', 'titleEn', 'issuer', 'year', 'descriptionId', 'descriptionEn'
] as const;

export function parseAchievementForm(formData: FormData): AchievementInput {
  const values: Record<string, string> = {};
  for (const field of REQUIRED_TEXT_FIELDS) {
    const raw = formData.get(field);
    if (typeof raw !== 'string' || raw.trim() === '') {
      throw new Error(`Field "${field}" is required`);
    }
    values[field] = raw;
  }

  const type = formData.get('type');
  if (typeof type !== 'string' || !ACHIEVEMENT_TYPES.includes(type as AchievementType)) {
    throw new Error(`Field "type" must be one of ${ACHIEVEMENT_TYPES.join(', ')}`);
  }

  const category = formData.get('category');
  if (
    typeof category !== 'string' ||
    !ACHIEVEMENT_CATEGORIES.includes(category as AchievementCategory)
  ) {
    throw new Error(`Field "category" must be one of ${ACHIEVEMENT_CATEGORIES.join(', ')}`);
  }

  const urlRaw = formData.get('url');
  let url: string | null = null;
  if (typeof urlRaw === 'string' && urlRaw.trim() !== '') {
    try {
      new URL(urlRaw);
    } catch {
      throw new Error('Field "url" must be a well-formed URL');
    }
    url = urlRaw;
  }

  const sortOrderRaw = formData.get('sortOrder');
  let sortOrder = 0;
  if (typeof sortOrderRaw === 'string' && sortOrderRaw.trim() !== '') {
    sortOrder = Number(sortOrderRaw);
    if (!Number.isFinite(sortOrder)) {
      throw new Error('Field "sortOrder" must be a number');
    }
  }

  return {
    titleId: values.titleId,
    titleEn: values.titleEn,
    issuer: values.issuer,
    year: values.year,
    type: type as AchievementType,
    category: category as AchievementCategory,
    descriptionId: values.descriptionId,
    descriptionEn: values.descriptionEn,
    url,
    sortOrder
  };
}

export async function createAchievementAction(formData: FormData): Promise<void> {
  'use server';
  const input = parseAchievementForm(formData);
  const {env} = await getCloudflareContext({async: true});
  await createAchievement(env.DB, input);
  redirect('/admin/achievements');
}

export async function updateAchievementAction(id: number, formData: FormData): Promise<void> {
  'use server';
  const input = parseAchievementForm(formData);
  const {env} = await getCloudflareContext({async: true});
  await updateAchievement(env.DB, id, input);
  redirect('/admin/achievements');
}

export async function softDeleteAchievementAction(id: number): Promise<void> {
  'use server';
  const {env} = await getCloudflareContext({async: true});
  await softDeleteAchievement(env.DB, id);
  redirect('/admin/achievements');
}

export async function undoAchievementEditAction(id: number): Promise<void> {
  'use server';
  const {env} = await getCloudflareContext({async: true});
  await undoLastAchievementEdit(env.DB, id);
  redirect('/admin/achievements');
}
```

`'use server'` is scoped per-function (not file-level) so that `parseAchievementForm`
above can stay a synchronous, directly-testable export — a file-level directive would
force every export to be async, which broke the build in Task 7 until fixed the same
way (see the Global Constraints note above).

`/pencapaian` and `/riset` are both `force-dynamic` (Task 5), so no revalidation call is
needed here either.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/actions/achievements.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Build the form**

```tsx
// src/components/admin/achievement-form.tsx
import type {AchievementRow} from '@/lib/repositories/achievements';
import {createAchievementAction, updateAchievementAction} from '@/lib/actions/achievements';

const FIELD_STYLE: React.CSSProperties = {display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem'};
const COLUMN_STYLE: React.CSSProperties = {flex: 1, padding: '1rem', border: '1px solid #ddd4c3', borderRadius: 8};

export function AchievementForm({entry}: {entry: AchievementRow | null}) {
  const action = entry
    ? updateAchievementAction.bind(null, entry.id)
    : createAchievementAction;

  return (
    <form action={action} style={{maxWidth: 720}}>
      <div style={{display: 'flex', gap: '1rem'}}>
        <div style={COLUMN_STYLE}>
          <h3>Indonesia</h3>
          <label>Judul<input style={FIELD_STYLE} name="titleId" defaultValue={entry?.titleId} required /></label>
          <label>Deskripsi<textarea style={FIELD_STYLE} name="descriptionId" defaultValue={entry?.descriptionId} required /></label>
        </div>
        <div style={COLUMN_STYLE}>
          <h3>English</h3>
          <label>Title<input style={FIELD_STYLE} name="titleEn" defaultValue={entry?.titleEn} required /></label>
          <label>Description<textarea style={FIELD_STYLE} name="descriptionEn" defaultValue={entry?.descriptionEn} required /></label>
        </div>
      </div>
      <div style={{marginTop: '1rem'}}>
        <label>Penerbit<input style={FIELD_STYLE} name="issuer" defaultValue={entry?.issuer} required /></label>
        <label>Tahun<input style={FIELD_STYLE} name="year" defaultValue={entry?.year} required /></label>
        <label>
          Tipe
          <select style={FIELD_STYLE} name="type" defaultValue={entry?.type ?? 'Publikasi'}>
            <option value="Publikasi">Publikasi</option>
            <option value="Sertifikat">Sertifikat</option>
          </select>
        </label>
        <label>
          Kategori
          <select style={FIELD_STYLE} name="category" defaultValue={entry?.category ?? 'Keamanan'}>
            <option value="Keamanan">Keamanan</option>
            <option value="Pendidikan">Pendidikan</option>
            <option value="Pengembangan">Pengembangan</option>
          </select>
        </label>
        <label>URL (opsional)<input style={FIELD_STYLE} name="url" type="url" defaultValue={entry?.url ?? ''} /></label>
        <label>Urutan tampil<input style={FIELD_STYLE} name="sortOrder" type="number" defaultValue={entry?.sortOrder ?? 0} /></label>
      </div>
      <button type="submit" style={{marginTop: '1rem'}}>Simpan</button>
    </form>
  );
}
```

The `<select>` options are the same four literal Indonesian enum values the public site
already renders through `ACHIEVEMENT_TYPE_LABEL_KEY`/`ACHIEVEMENT_CATEGORY_LABEL_KEY` — the
admin form itself is Indonesian-only UI text (per spec §5, "plain functional styling...
not held to the public site's polish"), so it uses the literal enum values directly as
both value and label rather than pulling in `next-intl` for an internal tool with one
operator.

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/lib/actions/achievements.ts tests/actions/achievements.test.ts src/components/admin/achievement-form.tsx
git commit -m "feat(admin): achievement Server Actions and form"
```

---

### Task 10: Achievements admin pages

**Files:**
- Create: `src/app/admin/achievements/page.tsx`
- Create: `src/app/admin/achievements/[id]/page.tsx`

**Interfaces:**
- Consumes: `listAdminAchievements`, `getAdminAchievement` (Task 4); `<AchievementForm>`
  (Task 9).

- [ ] **Step 1: List page**

```tsx
// src/app/admin/achievements/page.tsx
import Link from 'next/link';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listAdminAchievements} from '@/lib/repositories/achievements';
import {softDeleteAchievementAction, undoAchievementEditAction} from '@/lib/actions/achievements';

export const dynamic = 'force-dynamic';

export default async function AdminAchievementsPage() {
  const {env} = await getCloudflareContext({async: true});
  const entries = await listAdminAchievements(env.DB);

  return (
    <section>
      <h2>Pencapaian</h2>
      <Link href="/admin/achievements/new">+ Tambah</Link>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id} style={{marginTop: '0.75rem'}}>
            <strong>{entry.titleId}</strong> ({entry.type} · {entry.category})
            {' · '}
            <Link href={`/admin/achievements/${entry.id}`}>Edit</Link>
            {' · '}
            {entry.previousSnapshot ? (
              <form action={undoAchievementEditAction.bind(null, entry.id)} style={{display: 'inline'}}>
                <button type="submit">Urungkan perubahan dari {entry.snapshotAt}</button>
              </form>
            ) : null}
            {' · '}
            <form action={softDeleteAchievementAction.bind(null, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Create-or-edit page**

```tsx
// src/app/admin/achievements/[id]/page.tsx
import {notFound} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {getAdminAchievement} from '@/lib/repositories/achievements';
import {AchievementForm} from '@/components/admin/achievement-form';

export const dynamic = 'force-dynamic';

export default async function AdminAchievementEntryPage({
  params
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  if (id === 'new') {
    return <AchievementForm entry={null} />;
  }
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();
  const {env} = await getCloudflareContext({async: true});
  const entry = await getAdminAchievement(env.DB, numericId);
  if (!entry) notFound();
  return <AchievementForm entry={entry} />;
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Manual verification**

```bash
npm run build && npm run start -- -p 4176
```
Visit `/admin/achievements`, add an entry with a Sertifikat type, confirm it lists with
edit/delete/undo working the same way as Task 8's manual check. Visit
`http://localhost:4176/id/pencapaian` and `/id/riset` and confirm the new/changed data
shows up. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/achievements
git commit -m "feat(admin): achievements admin pages"
```

---

### Task 11: Trash — restore and permanent delete

**Files:**
- Create: `src/lib/actions/trash.ts`
- Create: `src/app/admin/trash/page.tsx`

**Interfaces:**
- Consumes: `listTrashedCareerEntries`, `restoreCareerEntry`, `hardDeleteCareerEntry`
  (Task 3); `listTrashedAchievements`, `restoreAchievement`, `hardDeleteAchievement`
  (Task 4).

- [ ] **Step 1: Trash actions**

```ts
// src/lib/actions/trash.ts
'use server';

import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {restoreCareerEntry, hardDeleteCareerEntry} from '@/lib/repositories/career';
import {restoreAchievement, hardDeleteAchievement} from '@/lib/repositories/achievements';

export async function restoreCareerEntryFromTrashAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await restoreCareerEntry(env.DB, id);
  redirect('/admin/trash');
}

export async function permanentlyDeleteCareerEntryAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await hardDeleteCareerEntry(env.DB, id);
  redirect('/admin/trash');
}

export async function restoreAchievementFromTrashAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await restoreAchievement(env.DB, id);
  redirect('/admin/trash');
}

export async function permanentlyDeleteAchievementAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await hardDeleteAchievement(env.DB, id);
  redirect('/admin/trash');
}
```

No revalidation calls needed — restoring a career/education/achievement row affects
`/tentang`, `/pencapaian`, or `/riset`, all `force-dynamic` (Task 5).

- [ ] **Step 2: Trash page**

```tsx
// src/app/admin/trash/page.tsx
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listTrashedCareerEntries} from '@/lib/repositories/career';
import {listTrashedAchievements} from '@/lib/repositories/achievements';
import {
  restoreCareerEntryFromTrashAction,
  permanentlyDeleteCareerEntryAction,
  restoreAchievementFromTrashAction,
  permanentlyDeleteAchievementAction
} from '@/lib/actions/trash';

export const dynamic = 'force-dynamic';

export default async function AdminTrashPage() {
  const {env} = await getCloudflareContext({async: true});
  const [careerEntries, achievements] = await Promise.all([
    listTrashedCareerEntries(env.DB),
    listTrashedAchievements(env.DB)
  ]);

  return (
    <section>
      <h2>Sampah</h2>

      <h3>Karier &amp; Pendidikan</h3>
      {careerEntries.length === 0 ? <p>Kosong.</p> : null}
      <ul>
        {careerEntries.map((entry) => (
          <li key={entry.id} style={{marginTop: '0.75rem'}}>
            {entry.roleId} ({entry.kind}) — dihapus {entry.deletedAt}
            {' · '}
            <form action={restoreCareerEntryFromTrashAction.bind(null, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Pulihkan</button>
            </form>
            {' · '}
            <form action={permanentlyDeleteCareerEntryAction.bind(null, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Hapus permanen</button>
            </form>
          </li>
        ))}
      </ul>

      <h3>Pencapaian</h3>
      {achievements.length === 0 ? <p>Kosong.</p> : null}
      <ul>
        {achievements.map((entry) => (
          <li key={entry.id} style={{marginTop: '0.75rem'}}>
            {entry.titleId} — dihapus {entry.deletedAt}
            {' · '}
            <form action={restoreAchievementFromTrashAction.bind(null, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Pulihkan</button>
            </form>
            {' · '}
            <form action={permanentlyDeleteAchievementAction.bind(null, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Hapus permanen</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Manual verification**

```bash
npm run build && npm run start -- -p 4176
```
Delete a career entry from `/admin/career`, visit `/admin/trash`, confirm it's listed;
click "Pulihkan", confirm it's back in `/admin/career` and gone from Trash. Delete it
again, then click "Hapus permanen" from Trash, confirm it's gone from both. Stop the
server.

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/trash.ts src/app/admin/trash
git commit -m "feat(admin): trash view with restore and permanent delete"
```

---

### Task 12: Final verification gate and Cloudflare Access setup

**Files:** none (verification only, plus a documentation note)
- Modify: `docs/cloudflare.md`

**Interfaces:** none — this task confirms every earlier task's deliverable still holds
together, and hands off the one manual step outside this repository's control.

- [ ] **Step 1: Full local verification**

```bash
npm test -- --run
npx tsc --noEmit
npm run build
npm run check:size
npx wrangler d1 migrations apply portofolio-admin --local
npx wrangler d1 migrations apply portofolio-admin-staging --local
npx playwright test
npm run cf:check
```
Expected: all pass. `check:size` should read effectively unchanged from before this plan
(admin routes aren't in the public bundle).

- [ ] **Step 2: Deploy**

```bash
npm run cf:deploy:staging
```
Smoke-test staging manually: visit the staging Worker URL's `/admin` — expected: reachable
(Access isn't configured yet, see Step 3) and functional; `/id/tentang`, `/id/pencapaian`,
`/id/riset` show the seeded content.

```bash
npm run cf:deploy
```
Deploys to production the same way every earlier phase in this project has (per
`docs/cloudflare.md`).

- [ ] **Step 3: Configure Cloudflare Access (manual, user-performed — cannot be done from
  this repository or by an agent)**

In the Cloudflare dashboard, Zero Trust → Access → Applications:
1. Add an application: type "Self-hosted", domain
   `ferryandhikapratama.com/admin*`.
2. Add a policy: Allow, include rule "Emails" → `ferryandhikapratama@gmail.com`.
3. Choose an identity provider for the login prompt — Cloudflare's built-in "One-time PIN"
   (email OTP) needs no further setup; "Sign in with Google" needs a Google identity
   provider connected first, under Zero Trust → Settings → Authentication.
4. Save, then visit `https://ferryandhikapratama.com/admin` in a private/incognito window
   — expected: redirected to a Cloudflare Access login screen before anything from this
   application loads. Complete the login as the owner — expected: `/admin` loads normally.
   Try it from a different email if one is available — expected: access denied at the
   Cloudflare screen, the Next.js app never runs.

- [ ] **Step 4: Update `docs/cloudflare.md`**

Add a short section documenting what changed, so the next person reading that file (human
or agent) knows the D1/Access setup exists and why:

```markdown

## Admin content panel (D1 + Access)

`/admin/*` manages Karier, Pendidikan, and Pencapaian content, backed by a D1 database
(binding `DB`, databases `portofolio-admin` / `portofolio-admin-staging`). Schema lives in
`migrations/`; apply with `wrangler d1 migrations apply <db-name> --local|--remote`.

`/tentang`, `/pencapaian`, and `/riset` read from D1 and are `force-dynamic` — they render
per-request rather than being served from the static-assets cache described above. This
was a deliberate choice over ISR/`revalidatePath`: this project has none of the
Incremental Cache (R2/KV) + Tag Cache (D1/DO) + DO queue infrastructure OpenNext's
Cloudflare adapter needs for on-demand revalidation to work, and standing that up for
three low-traffic pages wasn't worth it. If traffic to these three routes ever becomes a
real Free-plan concern, that infrastructure — not reverting to static content files — is
the next step.

Auth is Cloudflare Access, configured in the dashboard (Zero Trust → Access →
Applications), not in this repository — there is no application-level login. Local
`next dev` and `cf:preview` serve `/admin` unauthenticated; only the production and
staging domains are Access-protected.

See `docs/superpowers/specs/2026-09-11-admin-content-panel-design.md` for the full design.
```

- [ ] **Step 5: Commit**

```bash
git add docs/cloudflare.md
git commit -m "docs: document the admin content panel's D1 and Cloudflare Access setup"
```

- [ ] **Step 6: Update the SDD ledger**

Append a closing entry to `docs/superpowers/SDD-ledger.md` recording: which tasks
completed, final test/build/e2e/size numbers, the two D1 databases created, and the
explicit reminder that Cloudflare Access must be configured (Step 3) before `/admin` is
safe to leave reachable in production — if that step hasn't been done yet at the time this
task runs, say so plainly rather than assuming it happened.

```bash
git add docs/superpowers/SDD-ledger.md
git commit -m "docs(ledger): admin content panel complete"
```
