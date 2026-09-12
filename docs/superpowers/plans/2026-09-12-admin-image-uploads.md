# Admin Image Uploads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the admin upload a logo image for Career/Education entries and a cover
image for Achievement entries, stored in Cloudflare R2 and served directly from
Cloudflare's edge.

**Architecture:** A new R2 bucket (binding `UPLOADS`) holds uploaded images. Two new
nullable D1 columns (`career_entries.logo_key`, `achievements.cover_key`) store the R2
object key. Server Actions upload to R2 and write the key to D1 in the same request;
public pages compute the full image URL from the key at render time. Images are served
by R2's own public access, never proxied through the Worker.

**Tech Stack:** Cloudflare R2 (new binding, same pattern as the existing D1 binding),
Next.js Server Actions with `FormData`/`File`, `wrangler`'s `getPlatformProxy` for local
R2 access in dev and tests (already used for D1 — no new devDependency).

**Spec:** `docs/superpowers/specs/2026-09-12-admin-image-uploads-design.md` — read it
alongside this plan.

## Global Constraints

- Only two new fields, on tables that already exist: `career_entries.logo_key`,
  `achievements.cover_key`. No other schema changes.
- Images: `image/png`, `image/jpeg`, `image/webp` only, 5 MB max — enforced server-side,
  not just via the `<input accept>` hint.
- Uploading a new image for an entry that already has one deletes the old R2 object
  after the new key is durably written to D1, never before (a failed D1 write must never
  leave the entry with zero images).
- Permanently deleting an entry (from Trash) also deletes its R2 object, if any.
- No "remove image without replacing" action in this round (YAGNI — see spec Decision 6).
- No new npm dependencies.
- Object keys are generated with `crypto.randomUUID()`, not the row's `id` — this plan
  deviates from the spec's illustrative `{id}-{timestamp}` key format because create
  actions don't have a row id yet when the file is uploaded (the row doesn't exist until
  after `createCareerEntry`/`createAchievement` returns). A UUID satisfies the spec's
  actual requirement (fresh, collision-free key) without needing those functions to
  start returning the new row's id.
- Every test that needs D1 and/or R2 uses the existing `tests/helpers/d1.ts` pattern —
  real local bindings via `getPlatformProxy`, never mocks.

---

### Task 1: R2 bucket provisioning, migration, and Server Action body size limit

**Files:**
- Modify: `wrangler.jsonc`
- Modify: `next.config.ts`
- Create: `migrations/0002_add_upload_columns.sql`
- Modify: `tests/helpers/d1.ts`

**Interfaces:**
- Produces: an R2 binding named `UPLOADS` (`R2Bucket`, from `cloudflare-env.d.ts` after
  typegen), reachable via `getCloudflareContext({async: true})` in server code and
  `getPlatformProxy` in tests — same access pattern as the existing `DB` binding. Two new
  nullable columns: `career_entries.logo_key`, `achievements.cover_key`, applied to every
  `createTestDb()`-provisioned ephemeral test database as well as the real local/remote
  databases (Task 3/4's repository tests read/write these columns and will fail with
  "no such column" against a test database that only has migration 0001 applied).

- [ ] **Step 1: Create the R2 buckets**

```bash
npx wrangler r2 bucket create portofolio-uploads
npx wrangler r2 bucket create portofolio-uploads-staging
```

- [ ] **Step 2: Add the R2 bindings to `wrangler.jsonc`**

Current content is:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "portofolio",
  "account_id": "06d5d4ba7c6c2dcbbd02ceb7133e0163",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-08-31",
  "compatibility_flags": ["nodejs_compat"],
  "workers_dev": false,
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
      "database_id": "4f00d5bf-9188-4382-b089-b19b3c5fbc7e",
      "migrations_dir": "migrations"
    }
  ],
  "observability": {"enabled": true},
  "env": {
    "staging": {
      "name": "portofolio-staging",
      "workers_dev": true,
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
          "database_id": "e30d0675-3529-49c0-9f7d-cf32ad9822e9",
          "migrations_dir": "migrations"
        }
      ]
    }
  }
}
```

Add an `r2_buckets` array at the top level (production) and inside `env.staging`
(staging), right after each `d1_databases` block:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "portofolio",
  "account_id": "06d5d4ba7c6c2dcbbd02ceb7133e0163",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-08-31",
  "compatibility_flags": ["nodejs_compat"],
  "workers_dev": false,
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
      "database_id": "4f00d5bf-9188-4382-b089-b19b3c5fbc7e",
      "migrations_dir": "migrations"
    }
  ],
  "r2_buckets": [
    {
      "binding": "UPLOADS",
      "bucket_name": "portofolio-uploads"
    }
  ],
  "observability": {"enabled": true},
  "env": {
    "staging": {
      "name": "portofolio-staging",
      "workers_dev": true,
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
          "database_id": "e30d0675-3529-49c0-9f7d-cf32ad9822e9",
          "migrations_dir": "migrations"
        }
      ],
      "r2_buckets": [
        {
          "binding": "UPLOADS",
          "bucket_name": "portofolio-uploads-staging"
        }
      ]
    }
  }
}
```

(R2 bindings don't need a `bucket_id` the way D1 needs a `database_id` — the bucket name
is sufficient.)

- [ ] **Step 3: Write the migration**

```sql
-- migrations/0002_add_upload_columns.sql
ALTER TABLE career_entries ADD COLUMN logo_key TEXT;
ALTER TABLE achievements ADD COLUMN cover_key TEXT;
```

- [ ] **Step 4: Apply the migration to all four targets**

```bash
npx wrangler d1 migrations apply portofolio-admin --local
npx wrangler d1 migrations apply portofolio-admin --remote
npx wrangler d1 migrations apply portofolio-admin-staging --local --env staging
npx wrangler d1 migrations apply portofolio-admin-staging --remote --env staging
```

(The staging commands need `--env staging` — its D1 binding only exists under
`wrangler.jsonc`'s `env.staging` block; this exact gap was found and fixed twice
already in this project's CI, for the seed script and the migrations-apply step.)

- [ ] **Step 5: Raise the Server Action body size limit**

Current `next.config.ts`:

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

Server Actions cap request bodies at 1 MB by default — a 5 MB image upload would be
rejected before the action even runs. Add `serverActions.bodySizeLimit` under
`experimental` (confirmed against this project's installed Next.js 16.3 docs at
`node_modules/next/dist/docs/01-app/02-guides/server-actions.md` — still nested under
`experimental` in this version):

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
    serverActions: {
      bodySizeLimit: '5mb'
    }
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

- [ ] **Step 6: Make `createTestDb()` apply the new migration too**

Current `tests/helpers/d1.ts` reads and applies only
`migrations/0001_create_content_tables.sql`. Every repository test that will read or
write `logo_key`/`cover_key` (Tasks 3 and 4) runs against this ephemeral test database,
so it must also have migration 0002 applied. Update the top of the file:

```ts
// tests/helpers/d1.ts
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
```

And in `createTestDb`, after running Migration 0001's statements, also run migration
0002's two `ALTER TABLE` statements (reuse the same split-by-`;` approach already used
below in the function — the file's existing comment documents its known limits, which
this migration's two plain `ALTER TABLE` statements don't hit):

```ts
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
```

(This replaces the existing `return {db, dispose: proxy.dispose};` line at the end of
`createTestDb` — the rest of the function, including `resetTestDb`, is unchanged.)

- [ ] **Step 7: Regenerate Cloudflare types and verify**

```bash
npm run cf:typegen
npx tsc --noEmit
npx vitest run tests/repositories/career.test.ts tests/repositories/achievements.test.ts
```

Expected: `cf:typegen`/`tsc` clean — `cloudflare-env.d.ts` now declares `UPLOADS:
R2Bucket` on `CloudflareEnv` alongside the existing `DB: D1Database`, and nothing yet
references it. The two repository test files should still pass unchanged at this point
(Tasks 3/4 haven't added their new tests yet) — this just confirms `createTestDb()`
still works correctly with the extra migration applied.

- [ ] **Step 8: Commit**

```bash
git add wrangler.jsonc next.config.ts migrations/0002_add_upload_columns.sql tests/helpers/d1.ts
git commit -m "feat(uploads): provision R2 bucket and add image-key columns"
```

---

### Task 2: Upload validation/key module and local R2 test helper

**Files:**
- Create: `src/lib/uploads.ts`
- Create: `tests/helpers/r2.ts`
- Test: `tests/lib/uploads.test.ts`
- Test: `tests/helpers/r2.test.ts`

**Interfaces:**
- Consumes: Task 1's `UPLOADS` R2 binding.
- Produces (consumed by later tasks — exact names matter):
  - `UPLOADS_PUBLIC_BASE_URL: string` — a placeholder value until Task 9's manual step
    fills in the real one.
  - `ALLOWED_IMAGE_TYPES: readonly string[]`
  - `MAX_UPLOAD_BYTES: number`
  - `validateUploadedFile(file: File): void` — throws `Error` on an invalid type or an
    oversized file; returns nothing on success.
  - `buildUploadKey(prefix: string, contentType: string): string`
  - `uploadUrl(key: string): string`
  - `createTestBucket(): Promise<{bucket: R2Bucket; dispose: () => Promise<void>}>`
    (test-only, in `tests/helpers/r2.ts`)

- [ ] **Step 1: Write the failing tests for `src/lib/uploads.ts`**

```ts
// tests/lib/uploads.test.ts
import {describe, expect, it} from 'vitest';
import {
  validateUploadedFile,
  buildUploadKey,
  uploadUrl,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES
} from '@/lib/uploads';

function fakeFile(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], 'test-upload', {type});
}

describe('validateUploadedFile', () => {
  it('accepts every allowed type under the size limit', () => {
    for (const type of ALLOWED_IMAGE_TYPES) {
      expect(() => validateUploadedFile(fakeFile(type, 1024))).not.toThrow();
    }
  });

  it('rejects a disallowed content type', () => {
    expect(() => validateUploadedFile(fakeFile('text/plain', 1024))).toThrow(/must be one of/);
  });

  it('rejects a file over the size limit', () => {
    expect(() => validateUploadedFile(fakeFile('image/png', MAX_UPLOAD_BYTES + 1))).toThrow(/smaller/);
  });

  it('accepts a file exactly at the size limit', () => {
    expect(() => validateUploadedFile(fakeFile('image/png', MAX_UPLOAD_BYTES))).not.toThrow();
  });
});

describe('buildUploadKey', () => {
  it('builds a key under the given prefix with the right extension per content type', () => {
    expect(buildUploadKey('career-logos', 'image/png')).toMatch(/^career-logos\/[\w-]+\.png$/);
    expect(buildUploadKey('career-logos', 'image/jpeg')).toMatch(/^career-logos\/[\w-]+\.jpg$/);
    expect(buildUploadKey('achievement-covers', 'image/webp')).toMatch(/^achievement-covers\/[\w-]+\.webp$/);
  });

  it('generates a different key on every call', () => {
    const a = buildUploadKey('career-logos', 'image/png');
    const b = buildUploadKey('career-logos', 'image/png');
    expect(a).not.toBe(b);
  });
});

describe('uploadUrl', () => {
  it('joins the public base URL and the key', () => {
    const url = uploadUrl('career-logos/abc.png');
    expect(url.endsWith('/career-logos/abc.png')).toBe(true);
    expect(url.startsWith('http')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/uploads.test.ts`
Expected: FAIL — `Cannot find module '@/lib/uploads'`.

- [ ] **Step 3: Implement `src/lib/uploads.ts`**

```ts
// src/lib/uploads.ts

// Replaced in Task 9 once the R2 bucket's public access is enabled and the real
// pub-<hash>.r2.dev URL is known — everything else in this module works correctly
// regardless of this value.
export const UPLOADS_PUBLIC_BASE_URL = 'https://REPLACE-WITH-R2-PUBLIC-URL.r2.dev';

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function validateUploadedFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error(`File must be one of: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File must be ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB or smaller`);
  }
}

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

export function buildUploadKey(prefix: string, contentType: string): string {
  return `${prefix}/${crypto.randomUUID()}.${extensionForContentType(contentType)}`;
}

export function uploadUrl(key: string): string {
  return `${UPLOADS_PUBLIC_BASE_URL}/${key}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/uploads.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Write the failing test for the R2 test helper**

```ts
// tests/helpers/r2.test.ts
import {describe, expect, it} from 'vitest';
import {createTestBucket} from './r2';

describe('createTestBucket', () => {
  it('provisions a local R2 binding that supports put/get/delete', async () => {
    const {bucket, dispose} = await createTestBucket();
    try {
      await bucket.put('test-key.txt', 'hello');
      const got = await bucket.get('test-key.txt');
      expect(got).not.toBeNull();
      expect(await got?.text()).toBe('hello');
      await bucket.delete('test-key.txt');
      expect(await bucket.get('test-key.txt')).toBeNull();
    } finally {
      await dispose();
    }
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run tests/helpers/r2.test.ts`
Expected: FAIL — `Cannot find module './r2'`.

- [ ] **Step 7: Implement the R2 test helper**

```ts
// tests/helpers/r2.ts
import path from 'node:path';
import {getPlatformProxy} from 'wrangler';

export async function createTestBucket(): Promise<{
  bucket: R2Bucket;
  dispose: () => Promise<void>;
}> {
  const proxy = await getPlatformProxy<CloudflareEnv>({
    configPath: path.resolve(import.meta.dirname, '../../wrangler.jsonc'),
    persist: false
  });
  const bucket = proxy.env.UPLOADS;
  if (!bucket) {
    throw new Error('R2 binding "UPLOADS" not found — check wrangler.jsonc r2_buckets config');
  }
  return {bucket, dispose: proxy.dispose};
}
```

Add the same per-file environment override `tests/helpers/d1.test.ts` already uses (this
also shells out via `wrangler`, so it needs Node, not jsdom) as the very first line of
`tests/helpers/r2.test.ts`:

```ts
/** @vitest-environment node */
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run tests/helpers/r2.test.ts`
Expected: PASS (1 test).

- [ ] **Step 9: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 10: Commit**

```bash
git add src/lib/uploads.ts tests/lib/uploads.test.ts tests/helpers/r2.ts tests/helpers/r2.test.ts
git commit -m "feat(uploads): validation/key helpers and local R2 test helper"
```

---

### Task 3: Career/Education repository — logo key support

**Files:**
- Modify: `src/lib/repositories/career.ts`
- Modify: `tests/repositories/career.test.ts`

**Interfaces:**
- Consumes: nothing new (this task only adds a field to existing types/queries).
- Produces (changed from the existing shape — later tasks depend on the new shape):
  - `CareerEntryRow` gains `logoKey: string | null`.
  - `CareerEntryInput` gains `logoKey: string | null` (still `Omit<CareerEntryRow, 'id' |
    'deletedAt' | 'previousSnapshot' | 'snapshotAt'>`, so this follows automatically from
    the `CareerEntryRow` change).
  - `CareerEntry` (public shape) gains `logoUrl?: string`.
  - `hardDeleteCareerEntry(db: D1Database, id: number): Promise<string | null>` — CHANGED
    return type (was `Promise<void>`) — now returns the deleted row's `logoKey` (or
    `null`), so the caller can clean up R2. The only existing caller is
    `permanentlyDeleteCareerEntryAction` in `src/lib/actions/trash.ts` (Task 5 updates it).

- [ ] **Step 1: Update the failing tests**

Add to the top of `tests/repositories/career.test.ts`, alongside the existing imports:

```ts
import {uploadUrl} from '@/lib/uploads';
```

Add `logoKey: null` to the existing `sample` object (`CareerEntryInput` will require it
once Step 3 lands):

```ts
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
  sortOrder: 0,
  logoKey: null
};
```

Update the first test (`'creates a row and lists it publicly, locale-resolved'`) — the
expected public shape now includes `logoUrl: undefined` when `logoKey` is null:

```ts
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
      description: 'Mengajar komputer.',
      logoUrl: undefined
    }
  ]);
  const enEntries = await listPublicCareerEntries(db, 'career', 'en');
  expect(enEntries[0].role).toBe('Computing Teacher');
});
```

Add three new tests, after the existing `'hard delete permanently removes a row'` test:

```ts
it('computes logoUrl from a non-null logoKey', async () => {
  await createCareerEntry(db, {...sample, logoKey: 'career-logos/abc.png'});
  const [entry] = await listPublicCareerEntries(db, 'career', 'id');
  expect(entry.logoUrl).toBe(uploadUrl('career-logos/abc.png'));
});

it('preserves logoKey through the undo round-trip', async () => {
  await createCareerEntry(db, {...sample, logoKey: 'career-logos/original.png'});
  const [row] = await listAdminCareerEntries(db, 'career');
  await updateCareerEntry(db, row.id, {...sample, logoKey: 'career-logos/replacement.png'});
  expect((await getAdminCareerEntry(db, row.id))?.logoKey).toBe('career-logos/replacement.png');

  await undoLastCareerEdit(db, row.id);
  expect((await getAdminCareerEntry(db, row.id))?.logoKey).toBe('career-logos/original.png');
});

it('hard delete returns the deleted row\'s logoKey', async () => {
  await createCareerEntry(db, {...sample, logoKey: 'career-logos/to-clean-up.png'});
  const [row] = await listAdminCareerEntries(db, 'career');
  await softDeleteCareerEntry(db, row.id);
  const deletedLogoKey = await hardDeleteCareerEntry(db, row.id);
  expect(deletedLogoKey).toBe('career-logos/to-clean-up.png');
});

it('hard delete returns null when the row had no logo', async () => {
  await createCareerEntry(db, sample);
  const [row] = await listAdminCareerEntries(db, 'career');
  await softDeleteCareerEntry(db, row.id);
  const deletedLogoKey = await hardDeleteCareerEntry(db, row.id);
  expect(deletedLogoKey).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/repositories/career.test.ts`
Expected: FAIL — `sample` doesn't satisfy `CareerEntryInput` yet is not the failure mode
(TypeScript errors don't fail vitest directly), but the actual run fails because
`toEqual` won't match (no `logoUrl` key returned) and `uploadUrl`/the new tests
reference behavior that doesn't exist yet.

- [ ] **Step 3: Implement the repository changes**

In `src/lib/repositories/career.ts`:

Add the import at the top:

```ts
import {uploadUrl} from '@/lib/uploads';
```

Add `logoKey: string | null;` to `CareerEntryRow` (after `descriptionEn: string;`, before
`sortOrder: number;`):

```ts
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
  logoKey: string | null;
  sortOrder: number;
  deletedAt: string | null;
  previousSnapshot: string | null;
  snapshotAt: string | null;
};
```

Add `logoUrl?: string;` to `CareerEntry`:

```ts
export type CareerEntry = {
  role: string;
  organization: string;
  period: string;
  category: string;
  mark: string;
  description: string;
  logoUrl?: string;
};
```

Add `logo_key: string | null;` to `DbRow` (after `description_en: string;`):

```ts
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
  logo_key: string | null;
  sort_order: number;
  deleted_at: string | null;
  previous_snapshot: string | null;
  snapshot_at: string | null;
};
```

Update `toRow` to map the new column:

```ts
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
    logoKey: r.logo_key,
    sortOrder: r.sort_order,
    deletedAt: r.deleted_at,
    previousSnapshot: r.previous_snapshot,
    snapshotAt: r.snapshot_at
  };
}
```

Update `toPublic` to compute `logoUrl`:

```ts
function toPublic(row: CareerEntryRow, locale: 'id' | 'en'): CareerEntry {
  const logoUrl = row.logoKey ? uploadUrl(row.logoKey) : undefined;
  return locale === 'id'
    ? {
        role: row.roleId,
        organization: row.organizationId,
        period: row.periodId,
        category: row.categoryId,
        mark: row.mark,
        description: row.descriptionId,
        logoUrl
      }
    : {
        role: row.roleEn,
        organization: row.organizationEn,
        period: row.periodEn,
        category: row.categoryEn,
        mark: row.mark,
        description: row.descriptionEn,
        logoUrl
      };
}
```

Update `createCareerEntry`'s SQL and bindings:

```ts
export async function createCareerEntry(db: D1Database, input: CareerEntryInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO career_entries
        (kind, role_id, role_en, organization_id, organization_en, period_id, period_en,
         category_id, category_en, mark, description_id, description_en, logo_key, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      input.logoKey,
      input.sortOrder
    )
    .run();
}
```

Update `updateCareerEntry`'s snapshot object and SQL:

```ts
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
    logoKey: current.logoKey,
    sortOrder: current.sortOrder
  };

  await db
    .prepare(
      `UPDATE career_entries SET
        role_id = ?, role_en = ?, organization_id = ?, organization_en = ?,
        period_id = ?, period_en = ?, category_id = ?, category_en = ?,
        mark = ?, description_id = ?, description_en = ?, logo_key = ?, sort_order = ?,
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
      input.logoKey,
      input.sortOrder,
      JSON.stringify(snapshot),
      id
    )
    .run();
}
```

Update `undoLastCareerEdit`'s SQL and bindings:

```ts
export async function undoLastCareerEdit(db: D1Database, id: number): Promise<void> {
  const current = await getAdminCareerEntry(db, id);
  if (!current || !current.previousSnapshot) return;
  const snapshot = JSON.parse(current.previousSnapshot) as CareerEntryInput;

  await db
    .prepare(
      `UPDATE career_entries SET
        role_id = ?, role_en = ?, organization_id = ?, organization_en = ?,
        period_id = ?, period_en = ?, category_id = ?, category_en = ?,
        mark = ?, description_id = ?, description_en = ?, logo_key = ?, sort_order = ?,
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
      snapshot.logoKey,
      snapshot.sortOrder,
      id
    )
    .run();
}
```

Change `hardDeleteCareerEntry` to read the key before deleting and return it:

```ts
export async function hardDeleteCareerEntry(db: D1Database, id: number): Promise<string | null> {
  const row = await db
    .prepare('SELECT logo_key FROM career_entries WHERE id = ?')
    .bind(id)
    .first<{logo_key: string | null}>();
  await db.prepare('DELETE FROM career_entries WHERE id = ?').bind(id).run();
  return row?.logo_key ?? null;
}
```

Every other function (`listPublicCareerEntries`, `listAdminCareerEntries`,
`getAdminCareerEntry`, `softDeleteCareerEntry`, `restoreCareerEntry`,
`listTrashedCareerEntries`) is unchanged — `SELECT *` already includes the new column,
and `toRow`/`toPublic` handle the mapping.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/repositories/career.test.ts`
Expected: PASS (12 tests — the original 8 plus the 4 new ones).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/lib/repositories/career.ts tests/repositories/career.test.ts
git commit -m "feat(uploads): add logo_key to the career/education repository"
```

---

### Task 4: Achievements repository — cover key support

**Files:**
- Modify: `src/lib/repositories/achievements.ts`
- Modify: `tests/repositories/achievements.test.ts`

**Interfaces:**
- Produces (same shape of change as Task 3, mirrored for achievements):
  - `AchievementRow` gains `coverKey: string | null`.
  - `AchievementInput` gains `coverKey: string | null`.
  - `Achievement` (public) gains `coverUrl?: string`.
  - `hardDeleteAchievement(db: D1Database, id: number): Promise<string | null>` — CHANGED
    return type, returns the deleted row's `coverKey`. Only caller is
    `permanentlyDeleteAchievementAction` in `src/lib/actions/trash.ts` (Task 6 updates it).

- [ ] **Step 1: Update the failing tests**

Add to `tests/repositories/achievements.test.ts`'s imports:

```ts
import {uploadUrl} from '@/lib/uploads';
```

Add `coverKey: null` to the existing `sample` object:

```ts
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
```

Update the first test's expectation to include `coverUrl: undefined`:

```ts
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
```

Add four new tests, after the existing `'hard delete permanently removes a row'` test:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/repositories/achievements.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement the repository changes**

In `src/lib/repositories/achievements.ts`, add the import:

```ts
import {uploadUrl} from '@/lib/uploads';
```

Add `coverKey: string | null;` to `AchievementRow` (after `url: string | null;`):

```ts
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
  coverKey: string | null;
  sortOrder: number;
  deletedAt: string | null;
  previousSnapshot: string | null;
  snapshotAt: string | null;
};
```

Add `coverUrl?: string;` to `Achievement`:

```ts
export type Achievement = {
  title: string;
  issuer: string;
  year: string;
  type: AchievementType;
  category: AchievementCategory;
  description: string;
  url?: string;
  coverUrl?: string;
};
```

Add `cover_key: string | null;` to `DbRow` (after `url: string | null;`):

```ts
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
  cover_key: string | null;
  sort_order: number;
  deleted_at: string | null;
  previous_snapshot: string | null;
  snapshot_at: string | null;
};
```

Update `toRow`:

```ts
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
    coverKey: r.cover_key,
    sortOrder: r.sort_order,
    deletedAt: r.deleted_at,
    previousSnapshot: r.previous_snapshot,
    snapshotAt: r.snapshot_at
  };
}
```

Update `toPublic`:

```ts
function toPublic(row: AchievementRow, locale: 'id' | 'en'): Achievement {
  const base = {
    issuer: row.issuer,
    year: row.year,
    type: row.type,
    category: row.category,
    coverUrl: row.coverKey ? uploadUrl(row.coverKey) : undefined
  };
  return locale === 'id'
    ? {...base, title: row.titleId, description: row.descriptionId, url: row.url ?? undefined}
    : {...base, title: row.titleEn, description: row.descriptionEn, url: row.url ?? undefined};
}
```

Update `createAchievement`:

```ts
export async function createAchievement(db: D1Database, input: AchievementInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO achievements
        (title_id, title_en, issuer, year, type, category, description_id, description_en, url, cover_key, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      input.coverKey,
      input.sortOrder
    )
    .run();
}
```

Update `updateAchievement`'s snapshot object and SQL:

```ts
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
    coverKey: current.coverKey,
    sortOrder: current.sortOrder
  };

  await db
    .prepare(
      `UPDATE achievements SET
        title_id = ?, title_en = ?, issuer = ?, year = ?, type = ?, category = ?,
        description_id = ?, description_en = ?, url = ?, cover_key = ?, sort_order = ?,
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
      input.coverKey,
      input.sortOrder,
      JSON.stringify(snapshot),
      id
    )
    .run();
}
```

Update `undoLastAchievementEdit`:

```ts
export async function undoLastAchievementEdit(db: D1Database, id: number): Promise<void> {
  const current = await getAdminAchievement(db, id);
  if (!current || !current.previousSnapshot) return;
  const snapshot = JSON.parse(current.previousSnapshot) as AchievementInput;

  await db
    .prepare(
      `UPDATE achievements SET
        title_id = ?, title_en = ?, issuer = ?, year = ?, type = ?, category = ?,
        description_id = ?, description_en = ?, url = ?, cover_key = ?, sort_order = ?,
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
      snapshot.coverKey,
      snapshot.sortOrder,
      id
    )
    .run();
}
```

Change `hardDeleteAchievement`:

```ts
export async function hardDeleteAchievement(db: D1Database, id: number): Promise<string | null> {
  const row = await db
    .prepare('SELECT cover_key FROM achievements WHERE id = ?')
    .bind(id)
    .first<{cover_key: string | null}>();
  await db.prepare('DELETE FROM achievements WHERE id = ?').bind(id).run();
  return row?.cover_key ?? null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/repositories/achievements.test.ts`
Expected: PASS (11 tests — the original 7 plus the 4 new ones).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/lib/repositories/achievements.ts tests/repositories/achievements.test.ts
git commit -m "feat(uploads): add cover_key to the achievements repository"
```

---

### Task 5: Career/Education actions and form — upload the logo

**Files:**
- Modify: `src/lib/actions/career-entries.ts`
- Modify: `src/components/admin/career-entry-form.tsx`
- Modify: `src/lib/actions/trash.ts`
- Test: `tests/actions/career-entries.test.ts`

**Interfaces:**
- Consumes: `validateUploadedFile`, `buildUploadKey` (Task 2); `CareerEntryRow.logoKey`,
  `getAdminCareerEntry`, `hardDeleteCareerEntry` returning `Promise<string | null>`
  (Task 3).
- Produces: no new exported names — `createCareerEntryAction`/`updateCareerEntryAction`
  keep their existing signatures (`(kind, formData)` / `(id, kind, formData)`); they just
  also handle an optional `logo` file field now.

- [ ] **Step 1: Write the failing tests**

Add to `tests/actions/career-entries.test.ts` (keep the existing 4 tests and imports
unchanged — `parseCareerEntryForm` itself doesn't touch files, so nothing about it
changes). Add these new tests at the end of the file, with new imports at the top:

```ts
import {createTestDb, resetTestDb} from '../helpers/d1';
import {createTestBucket} from '../helpers/r2';
import {createCareerEntryAction, updateCareerEntryAction} from '@/lib/actions/career-entries';
import {getAdminCareerEntry} from '@/lib/repositories/career';

// getCloudflareContext isn't available outside a real Worker/Miniflare request —
// these tests call the repository/R2 functions this action wraps directly against
// the same local D1 + R2 bindings, rather than invoking the Next.js Server Action
// wrapper itself (which also calls redirect(), which throws in a plain test
// environment). This still exercises the exact upload-then-write-then-cleanup logic;
// it just doesn't go through Next's own Server Action RPC plumbing, which is
// framework code, not this project's.
```

Given the constraint noted above, this task tests the action module's *logic* through a
small internal helper it factors out, not through `createCareerEntryAction` /
`updateCareerEntryAction` directly (those call `redirect()`, which throws outside a
request context, and `getCloudflareContext()`, which needs a live Worker context that
`getPlatformProxy` doesn't fully emulate for `next/navigation`). Factor the upload logic
into two plain, directly-testable functions:

```ts
// append to tests/actions/career-entries.test.ts
import {resolveLogoKey} from '@/lib/actions/career-entries';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/actions/career-entries.test.ts`
Expected: FAIL — `resolveLogoKey` isn't exported yet.

- [ ] **Step 3: Implement the actions module changes**

Replace `src/lib/actions/career-entries.ts`'s imports and add `resolveLogoKey`, then wire
it into both create/update actions, and add cleanup-of-the-old-key logic to the update
action:

```ts
import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {
  createCareerEntry,
  updateCareerEntry,
  softDeleteCareerEntry,
  undoLastCareerEdit,
  getAdminCareerEntry,
  type CareerEntryInput,
  type CareerKind
} from '@/lib/repositories/career';
import {validateUploadedFile, buildUploadKey} from '@/lib/uploads';

const REQUIRED_FIELDS = [
  'roleId', 'roleEn',
  'organizationId', 'organizationEn',
  'periodId', 'periodEn',
  'categoryId', 'categoryEn',
  'mark',
  'descriptionId', 'descriptionEn'
] as const;

export function parseCareerEntryForm(formData: FormData, kind: CareerKind): Omit<CareerEntryInput, 'logoKey'> {
  const values: Record<string, string> = {};
  for (const field of REQUIRED_FIELDS) {
    const raw = formData.get(field);
    if (typeof raw !== 'string' || raw.trim() === '') {
      throw new Error(`Field "${field}" is required`);
    }
    values[field] = raw.trim();
  }

  if (values.mark.length > 2) {
    throw new Error('Field "mark" must be at most 2 characters');
  }

  const sortOrderRaw = formData.get('sortOrder');
  let sortOrder = 0;
  if (typeof sortOrderRaw === 'string' && sortOrderRaw.trim() !== '') {
    sortOrder = Number(sortOrderRaw);
    if (!Number.isInteger(sortOrder)) {
      throw new Error('Field "sortOrder" must be a whole number');
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

/**
 * Resolves what `logoKey` a create/update should write: unchanged if no new file
 * was submitted (including an untouched, zero-byte file input), or a freshly
 * uploaded key otherwise. Pure with respect to D1 — the caller is responsible for
 * deleting `existingKey` from R2 afterward if this returns a different key.
 */
export async function resolveLogoKey(
  bucket: R2Bucket,
  formData: FormData,
  existingKey: string | null
): Promise<string | null> {
  const file = formData.get('logo');
  if (!(file instanceof File) || file.size === 0) {
    return existingKey;
  }
  validateUploadedFile(file);
  const key = buildUploadKey('career-logos', file.type);
  await bucket.put(key, await file.arrayBuffer(), {httpMetadata: {contentType: file.type}});
  return key;
}

function listPathFor(kind: CareerKind): string {
  return kind === 'career' ? '/admin/career' : '/admin/education';
}

export async function createCareerEntryAction(
  kind: CareerKind,
  formData: FormData
): Promise<void> {
  'use server';
  const fields = parseCareerEntryForm(formData, kind);
  const {env} = await getCloudflareContext({async: true});
  const logoKey = await resolveLogoKey(env.UPLOADS, formData, null);
  await createCareerEntry(env.DB, {...fields, logoKey});
  redirect(listPathFor(kind));
}

export async function updateCareerEntryAction(
  id: number,
  kind: CareerKind,
  formData: FormData
): Promise<void> {
  'use server';
  const fields = parseCareerEntryForm(formData, kind);
  const {env} = await getCloudflareContext({async: true});
  const existing = await getAdminCareerEntry(env.DB, id);
  const previousLogoKey = existing?.logoKey ?? null;
  const logoKey = await resolveLogoKey(env.UPLOADS, formData, previousLogoKey);
  await updateCareerEntry(env.DB, id, {...fields, logoKey});
  if (logoKey !== previousLogoKey && previousLogoKey) {
    await env.UPLOADS.delete(previousLogoKey);
  }
  redirect(listPathFor(kind));
}

export async function softDeleteCareerEntryAction(kind: CareerKind, id: number): Promise<void> {
  'use server';
  const {env} = await getCloudflareContext({async: true});
  await softDeleteCareerEntry(env.DB, id);
  redirect(listPathFor(kind));
}

export async function undoCareerEntryEditAction(kind: CareerKind, id: number): Promise<void> {
  'use server';
  const {env} = await getCloudflareContext({async: true});
  await undoLastCareerEdit(env.DB, id);
  redirect(listPathFor(kind));
}
```

Note `parseCareerEntryForm`'s return type changed from `CareerEntryInput` to
`Omit<CareerEntryInput, 'logoKey'>` — it never touched `logoKey` before either, but the
old code happened to satisfy the full type by coincidence of field lists matching; now
that `CareerEntryInput` has one more required field this function doesn't set, the
return type must say so explicitly. Its own 4 existing tests
(`tests/actions/career-entries.test.ts`'s original tests) still pass unmodified — none of
them asserted the exact returned object's type at the type-checker level in a way this
breaks; they check runtime shape with `toEqual`, which doesn't care about the TS type
narrowing.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/actions/career-entries.test.ts`
Expected: PASS (8 tests — the original 4 plus the 4 new `resolveLogoKey` tests).

- [ ] **Step 5: Update the form UI**

Modify `src/components/admin/career-entry-form.tsx` — add the `uploadUrl` import, a file
input, and a current-logo preview:

```tsx
import Link from 'next/link';
import type {CareerEntryRow, CareerKind} from '@/lib/repositories/career';
import {createCareerEntryAction, updateCareerEntryAction} from '@/lib/actions/career-entries';
import {uploadUrl} from '@/lib/uploads';

const FIELD_CLASS =
  'mt-1.5 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg';
const LABEL_CLASS = 'block text-sm text-fg-muted';
const COLUMN_CLASS = 'flex-1 space-y-4 rounded-2xl border border-border bg-surface p-5';

const KIND_LABEL: Record<CareerKind, string> = {career: 'Karier', education: 'Pendidikan'};
const KIND_BASE_PATH: Record<CareerKind, string> = {career: '/admin/career', education: '/admin/education'};

export function CareerEntryForm({kind, entry}: {kind: CareerKind; entry: CareerEntryRow | null}) {
  const action = entry
    ? updateCareerEntryAction.bind(null, entry.id, kind)
    : createCareerEntryAction.bind(null, kind);
  const basePath = KIND_BASE_PATH[kind];

  return (
    <div>
      <Link href={basePath} className="text-sm text-accent hover:underline">
        ← Kembali ke {KIND_LABEL[kind]}
      </Link>
      <h1 className="mt-3 font-display text-xl text-fg">
        {entry ? `Ubah ${KIND_LABEL[kind]}` : `Tambah ${KIND_LABEL[kind]}`}
      </h1>

      <form action={action} className="mt-6 max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className={COLUMN_CLASS}>
            <h2 className="font-display text-sm font-semibold text-fg">Indonesia</h2>
            <label className={LABEL_CLASS}>
              Peran
              <input className={FIELD_CLASS} name="roleId" defaultValue={entry?.roleId} required />
            </label>
            <label className={LABEL_CLASS}>
              Organisasi
              <input className={FIELD_CLASS} name="organizationId" defaultValue={entry?.organizationId} required />
            </label>
            <label className={LABEL_CLASS}>
              Periode
              <input className={FIELD_CLASS} name="periodId" defaultValue={entry?.periodId} required />
            </label>
            <label className={LABEL_CLASS}>
              Kategori
              <input className={FIELD_CLASS} name="categoryId" defaultValue={entry?.categoryId} required />
            </label>
            <label className={LABEL_CLASS}>
              Deskripsi
              <textarea className={`${FIELD_CLASS} min-h-24 py-2`} name="descriptionId" defaultValue={entry?.descriptionId} required />
            </label>
          </div>
          <div className={COLUMN_CLASS}>
            <h2 className="font-display text-sm font-semibold text-fg">English</h2>
            <label className={LABEL_CLASS}>
              Role
              <input className={FIELD_CLASS} name="roleEn" defaultValue={entry?.roleEn} required />
            </label>
            <label className={LABEL_CLASS}>
              Organization
              <input className={FIELD_CLASS} name="organizationEn" defaultValue={entry?.organizationEn} required />
            </label>
            <label className={LABEL_CLASS}>
              Period
              <input className={FIELD_CLASS} name="periodEn" defaultValue={entry?.periodEn} required />
            </label>
            <label className={LABEL_CLASS}>
              Category
              <input className={FIELD_CLASS} name="categoryEn" defaultValue={entry?.categoryEn} required />
            </label>
            <label className={LABEL_CLASS}>
              Description
              <textarea className={`${FIELD_CLASS} min-h-24 py-2`} name="descriptionEn" defaultValue={entry?.descriptionEn} required />
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
          <label className={LABEL_CLASS}>
            Mark (2 huruf)
            <input className={FIELD_CLASS} name="mark" defaultValue={entry?.mark} maxLength={2} required />
          </label>
          <label className={LABEL_CLASS}>
            Urutan tampil
            <input className={FIELD_CLASS} name="sortOrder" type="number" defaultValue={entry?.sortOrder ?? 0} />
          </label>
          <label className={`${LABEL_CLASS} sm:col-span-2`}>
            Logo (opsional, PNG/JPEG/WebP, maks 5MB)
            {entry?.logoKey ? (
              <img
                src={uploadUrl(entry.logoKey)}
                alt=""
                className="mt-2 size-16 rounded-lg border border-border object-cover"
              />
            ) : null}
            <input
              className={`${FIELD_CLASS} p-2`}
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 min-h-11 rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:opacity-90"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Update `trash.ts` to clean up R2 on permanent delete**

`hardDeleteCareerEntry` now returns `Promise<string | null>` (Task 3) instead of
`Promise<void>` — update the one call site:

```ts
// src/lib/actions/trash.ts — only this one function changes in this task
export async function permanentlyDeleteCareerEntryAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  const logoKey = await hardDeleteCareerEntry(env.DB, id);
  if (logoKey) {
    await env.UPLOADS.delete(logoKey);
  }
  redirect('/admin/trash');
}
```

(`permanentlyDeleteAchievementAction`, in the same file, still calls the old
`hardDeleteAchievement` signature at this point in the plan — Task 6 updates that one.
`tsc --noEmit` will show a type error on that line until Task 6 lands; that's expected
and this task's own Step 7 verification only needs to pass for the pieces this task
actually owns — but since both functions live in the same file, run the full-file
typecheck anyway and confirm the ONLY error is on the `hardDeleteAchievement` line,
proving nothing else broke.)

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: exactly one error, on `permanentlyDeleteAchievementAction`'s
`hardDeleteAchievement` call in `src/lib/actions/trash.ts` (`Type 'string | null' is not
assignable to type 'void'` or similar) — Task 6 resolves it. If there are OTHER errors
beyond that one line, stop and report BLOCKED; something else broke.

- [ ] **Step 8: Commit**

```bash
git add src/lib/actions/career-entries.ts src/components/admin/career-entry-form.tsx src/lib/actions/trash.ts tests/actions/career-entries.test.ts
git commit -m "feat(uploads): career/education logo upload in actions and form"
```

---

### Task 6: Achievement actions and form — upload the cover

**Files:**
- Modify: `src/lib/actions/achievements.ts`
- Modify: `src/components/admin/achievement-form.tsx`
- Modify: `src/lib/actions/trash.ts`
- Test: `tests/actions/achievements.test.ts`

**Interfaces:**
- Consumes: `validateUploadedFile`, `buildUploadKey` (Task 2); `AchievementRow.coverKey`,
  `getAdminAchievement`, `hardDeleteAchievement` returning `Promise<string | null>`
  (Task 4).
- Produces: no new exported names — same signatures as before, now also handling an
  optional `cover` file field.

- [ ] **Step 1: Write the failing tests**

Add to `tests/actions/achievements.test.ts` (keep the existing 6 tests unchanged), adding
these imports and tests at the end of the file:

```ts
import {createTestBucket} from '../helpers/r2';
import {resolveCoverKey} from '@/lib/actions/achievements';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/actions/achievements.test.ts`
Expected: FAIL — `resolveCoverKey` isn't exported yet.

- [ ] **Step 3: Implement the actions module changes**

```ts
// src/lib/actions/achievements.ts
import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {
  createAchievement,
  updateAchievement,
  softDeleteAchievement,
  undoLastAchievementEdit,
  getAdminAchievement,
  type AchievementInput,
  type AchievementType,
  type AchievementCategory
} from '@/lib/repositories/achievements';
import {validateUploadedFile, buildUploadKey} from '@/lib/uploads';

const ACHIEVEMENT_TYPES: AchievementType[] = ['Publikasi', 'Sertifikat'];
const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = ['Keamanan', 'Pendidikan', 'Pengembangan'];

const REQUIRED_TEXT_FIELDS = [
  'titleId', 'titleEn', 'issuer', 'year', 'descriptionId', 'descriptionEn'
] as const;

export function parseAchievementForm(formData: FormData): Omit<AchievementInput, 'coverKey'> {
  const values: Record<string, string> = {};
  for (const field of REQUIRED_TEXT_FIELDS) {
    const raw = formData.get(field);
    if (typeof raw !== 'string' || raw.trim() === '') {
      throw new Error(`Field "${field}" is required`);
    }
    values[field] = raw.trim();
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
    if (!Number.isInteger(sortOrder)) {
      throw new Error('Field "sortOrder" must be a whole number');
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

export async function resolveCoverKey(
  bucket: R2Bucket,
  formData: FormData,
  existingKey: string | null
): Promise<string | null> {
  const file = formData.get('cover');
  if (!(file instanceof File) || file.size === 0) {
    return existingKey;
  }
  validateUploadedFile(file);
  const key = buildUploadKey('achievement-covers', file.type);
  await bucket.put(key, await file.arrayBuffer(), {httpMetadata: {contentType: file.type}});
  return key;
}

export async function createAchievementAction(formData: FormData): Promise<void> {
  'use server';
  const fields = parseAchievementForm(formData);
  const {env} = await getCloudflareContext({async: true});
  const coverKey = await resolveCoverKey(env.UPLOADS, formData, null);
  await createAchievement(env.DB, {...fields, coverKey});
  redirect('/admin/achievements');
}

export async function updateAchievementAction(id: number, formData: FormData): Promise<void> {
  'use server';
  const fields = parseAchievementForm(formData);
  const {env} = await getCloudflareContext({async: true});
  const existing = await getAdminAchievement(env.DB, id);
  const previousCoverKey = existing?.coverKey ?? null;
  const coverKey = await resolveCoverKey(env.UPLOADS, formData, previousCoverKey);
  await updateAchievement(env.DB, id, {...fields, coverKey});
  if (coverKey !== previousCoverKey && previousCoverKey) {
    await env.UPLOADS.delete(previousCoverKey);
  }
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

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/actions/achievements.test.ts`
Expected: PASS (10 tests — the original 6 plus the 4 new `resolveCoverKey` tests).

- [ ] **Step 5: Update the form UI**

```tsx
// src/components/admin/achievement-form.tsx
import Link from 'next/link';
import type {AchievementRow} from '@/lib/repositories/achievements';
import {createAchievementAction, updateAchievementAction} from '@/lib/actions/achievements';
import {uploadUrl} from '@/lib/uploads';

const FIELD_CLASS =
  'mt-1.5 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg';
const LABEL_CLASS = 'block text-sm text-fg-muted';
const COLUMN_CLASS = 'flex-1 space-y-4 rounded-2xl border border-border bg-surface p-5';

export function AchievementForm({entry}: {entry: AchievementRow | null}) {
  const action = entry ? updateAchievementAction.bind(null, entry.id) : createAchievementAction;

  return (
    <div>
      <Link href="/admin/achievements" className="text-sm text-accent hover:underline">
        ← Kembali ke Pencapaian
      </Link>
      <h1 className="mt-3 font-display text-xl text-fg">
        {entry ? 'Ubah Pencapaian' : 'Tambah Pencapaian'}
      </h1>

      <form action={action} className="mt-6 max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className={COLUMN_CLASS}>
            <h2 className="font-display text-sm font-semibold text-fg">Indonesia</h2>
            <label className={LABEL_CLASS}>
              Judul
              <input className={FIELD_CLASS} name="titleId" defaultValue={entry?.titleId} required />
            </label>
            <label className={LABEL_CLASS}>
              Deskripsi
              <textarea className={`${FIELD_CLASS} min-h-24 py-2`} name="descriptionId" defaultValue={entry?.descriptionId} required />
            </label>
          </div>
          <div className={COLUMN_CLASS}>
            <h2 className="font-display text-sm font-semibold text-fg">English</h2>
            <label className={LABEL_CLASS}>
              Title
              <input className={FIELD_CLASS} name="titleEn" defaultValue={entry?.titleEn} required />
            </label>
            <label className={LABEL_CLASS}>
              Description
              <textarea className={`${FIELD_CLASS} min-h-24 py-2`} name="descriptionEn" defaultValue={entry?.descriptionEn} required />
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
          <label className={LABEL_CLASS}>
            Penerbit
            <input className={FIELD_CLASS} name="issuer" defaultValue={entry?.issuer} required />
          </label>
          <label className={LABEL_CLASS}>
            Tahun
            <input className={FIELD_CLASS} name="year" defaultValue={entry?.year} required />
          </label>
          <label className={LABEL_CLASS}>
            Tipe
            <select className={FIELD_CLASS} name="type" defaultValue={entry?.type ?? 'Publikasi'}>
              <option value="Publikasi">Publikasi</option>
              <option value="Sertifikat">Sertifikat</option>
            </select>
          </label>
          <label className={LABEL_CLASS}>
            Kategori
            <select className={FIELD_CLASS} name="category" defaultValue={entry?.category ?? 'Keamanan'}>
              <option value="Keamanan">Keamanan</option>
              <option value="Pendidikan">Pendidikan</option>
              <option value="Pengembangan">Pengembangan</option>
            </select>
          </label>
          <label className={LABEL_CLASS}>
            URL (opsional)
            <input className={FIELD_CLASS} name="url" type="url" defaultValue={entry?.url ?? ''} />
          </label>
          <label className={LABEL_CLASS}>
            Urutan tampil
            <input className={FIELD_CLASS} name="sortOrder" type="number" defaultValue={entry?.sortOrder ?? 0} />
          </label>
          <label className={`${LABEL_CLASS} sm:col-span-2`}>
            Cover (opsional, PNG/JPEG/WebP, maks 5MB)
            {entry?.coverKey ? (
              <img
                src={uploadUrl(entry.coverKey)}
                alt=""
                className="mt-2 h-24 w-40 rounded-lg border border-border object-cover"
              />
            ) : null}
            <input
              className={`${FIELD_CLASS} p-2`}
              name="cover"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 min-h-11 rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:opacity-90"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Finish updating `trash.ts`**

`hardDeleteAchievement` now returns `Promise<string | null>` (Task 4) — update its call
site, completing the file (Task 5 already fixed the career half):

```ts
// src/lib/actions/trash.ts — full file, both halves now updated
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
  const logoKey = await hardDeleteCareerEntry(env.DB, id);
  if (logoKey) {
    await env.UPLOADS.delete(logoKey);
  }
  redirect('/admin/trash');
}

export async function restoreAchievementFromTrashAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await restoreAchievement(env.DB, id);
  redirect('/admin/trash');
}

export async function permanentlyDeleteAchievementAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  const coverKey = await hardDeleteAchievement(env.DB, id);
  if (coverKey) {
    await env.UPLOADS.delete(coverKey);
  }
  redirect('/admin/trash');
}
```

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean — this closes the one expected error left open at the end of Task 5.

- [ ] **Step 8: Commit**

```bash
git add src/lib/actions/achievements.ts src/components/admin/achievement-form.tsx src/lib/actions/trash.ts tests/actions/achievements.test.ts
git commit -m "feat(uploads): achievement cover upload in actions and form; trash cleans up R2"
```

---

### Task 7: Public rendering — logo on CareerCard, cover on PublicationCover

**Files:**
- Modify: `src/components/career-card.tsx`
- Modify: `src/components/publication-cover.tsx`
- Modify: `src/components/achievement-card.tsx`
- Modify: `src/components/publication-list-card.tsx`
- Test: `tests/career-card.test.tsx`
- Test: `tests/publication-cover.test.tsx`

**Interfaces:**
- Consumes: `CareerEntry.logoUrl`, `Achievement.coverUrl` (Tasks 3/4's public types).
- Produces: `PublicationCover` gains an optional `coverUrl?: string` prop — its three
  existing callers (`AchievementCard`, `PublicationListCard`, `PaperStory`) are updated
  in this task to pass it through.

- [ ] **Step 1: Write the failing test for `CareerCard`**

Read the current `tests/career-card.test.tsx` file first — its exact existing content
determines exactly where to add the new test and what the existing mock/import setup
looks like (this plan doesn't reproduce it here since Task 3 didn't change
`CareerCard`'s existing behavior, only its input type). Add one new test:

```tsx
it('renders the uploaded logo image alongside the mark badge when logoUrl is present', () => {
  render(
    <CareerCard
      entry={{
        role: 'Guru Informatika',
        organization: 'SDN Ujung XIII/38',
        period: 'Mulai April 2026',
        category: 'Pendidikan',
        mark: 'SD',
        description: 'Mengajar komputer.',
        logoUrl: 'https://example.r2.dev/career-logos/abc.png'
      }}
    />
  );
  const img = screen.getByRole('img', {hidden: true});
  expect(img).toHaveAttribute('src', 'https://example.r2.dev/career-logos/abc.png');
  expect(screen.getByText('SD')).toBeInTheDocument();
});

it('renders no image when logoUrl is absent', () => {
  render(
    <CareerCard
      entry={{
        role: 'Guru Informatika',
        organization: 'SDN Ujung XIII/38',
        period: 'Mulai April 2026',
        category: 'Pendidikan',
        mark: 'SD',
        description: 'Mengajar komputer.'
      }}
    />
  );
  expect(screen.queryByRole('img', {hidden: true})).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/career-card.test.tsx`
Expected: FAIL — no `<img>` is rendered yet.

- [ ] **Step 3: Update `CareerCard`**

```tsx
// src/components/career-card.tsx
import {useTranslations} from 'next-intl';
import type {ReactNode} from 'react';
import type {CareerEntry} from '@/lib/repositories/career';

export function CareerCard({entry}: {entry: CareerEntry}) {
  const t = useTranslations();

  return (
    <article className="flex gap-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex shrink-0 items-center gap-2">
        {entry.logoUrl ? (
          <img
            src={entry.logoUrl}
            alt=""
            aria-hidden="true"
            className="size-12 rounded-lg border border-border object-cover"
          />
        ) : null}
        <div
          className="grid size-12 shrink-0 place-items-center rounded-lg border border-border bg-bg text-sm font-bold text-accent"
          aria-hidden="true"
        >
          {entry.mark}
        </div>
      </div>
      <div>
        <h3 className="font-display text-[17px] text-fg">{entry.role}</h3>
        <p className="mt-1.5 text-sm text-fg-muted">{entry.organization}</p>
        <small className="mt-1.5 block text-xs text-fg-muted">
          {`${entry.period} · ${entry.category}`}
        </small>
        <details className="mt-4">
          <summary className="inline-flex min-h-11 items-center cursor-pointer text-xs text-fg-muted transition-colors hover:text-accent">
            {t('about.career.detailSummary')}
          </summary>
          <p className="mt-3 text-sm leading-7 text-fg-muted">{entry.description}</p>
        </details>
      </div>
    </article>
  );
}

export function Timeline({entries, children}: {entries: CareerEntry[]; children?: ReactNode}) {
  if (entries.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {entries.map((e) => (
        <CareerCard key={e.role + e.organization} entry={e} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/career-card.test.tsx`
Expected: PASS (all tests, including the 2 new ones).

- [ ] **Step 5: Write the failing test for `PublicationCover`**

Read the current `tests/publication-cover.test.tsx` first (Task 3/4 of the earlier admin
panel plan already established its mock pattern — `vi.mock('next-intl', () =>
({useTranslations: () => (k: string) => k}))`). Add:

```tsx
it('renders the uploaded cover image instead of the hard-coded graphic when coverUrl is given', () => {
  render(<PublicationCover coverUrl="https://example.r2.dev/achievement-covers/abc.png" />);
  const img = screen.getByRole('img');
  expect(img).toHaveAttribute('src', 'https://example.r2.dev/achievement-covers/abc.png');
  expect(screen.queryByText('JUTIF')).not.toBeInTheDocument();
});

it('renders the existing hard-coded graphic when coverUrl is absent', () => {
  render(<PublicationCover />);
  expect(screen.getByText('JUTIF')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run tests/publication-cover.test.tsx`
Expected: FAIL — `coverUrl` prop doesn't exist yet, no `<img>` is ever rendered.

- [ ] **Step 7: Update `PublicationCover`**

```tsx
// src/components/publication-cover.tsx
import {useTranslations} from 'next-intl';

/**
 * JUTIF publication cover, server-safe. Renders an uploaded cover image when one
 * is provided; otherwise falls back to the original hard-coded JUTIF graphic
 * (still correct for the one real publication that has no uploaded cover).
 * `useTranslations` is isomorphic, so this still needs no 'use client' directive.
 */
export function PublicationCover({
  size = 'grid',
  coverUrl
}: {
  size?: 'grid' | 'list';
  coverUrl?: string;
}) {
  const t = useTranslations();
  const heightClass = size === 'list' ? 'h-60' : 'h-52';

  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt=""
        className={`w-full object-cover ${heightClass}`}
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-start border-b-4 border-accent bg-surface p-6 text-fg ${heightClass}`}
    >
      <span className="text-xs tracking-[0.2em] text-fg-muted">JUTIF</span>
      <strong className="mt-3 font-display text-2xl leading-tight">
        Jurnal Teknik
        <br />
        Informatika
      </strong>
      <small className="mt-2 text-xs text-fg-muted">Vol. 7 No. 2 · 2026</small>
      <b className="mt-auto text-[10px] font-medium text-fg-muted">
        {t('achievements.coverLabel')}
      </b>
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run tests/publication-cover.test.tsx`
Expected: PASS.

- [ ] **Step 9: Thread `coverUrl` through the three callers**

In `src/components/achievement-card.tsx`, change the `<PublicationCover>` call:

```tsx
// before
<PublicationCover size="grid" />
// after
<PublicationCover size="grid" coverUrl={item.coverUrl} />
```

In `src/components/publication-list-card.tsx`, change BOTH `<PublicationCover>` calls
(one in `PublicationListCard`, one in `PaperStory` — both already receive `item` as a
prop):

```tsx
// PublicationListCard — before
<PublicationCover size="list" />
// after
<PublicationCover size="list" coverUrl={item.coverUrl} />

// PaperStory — before
<PublicationCover size="list" />
// after
<PublicationCover size="list" coverUrl={item.coverUrl} />
```

- [ ] **Step 10: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 11: Run the full unit suite**

Run: `npm test -- --run`
Expected: all pass, no regressions in `achievement-card.test.tsx`,
`publication-list-card.test.tsx`, or any test that renders these components indirectly.

- [ ] **Step 12: Commit**

```bash
git add src/components/career-card.tsx src/components/publication-cover.tsx src/components/achievement-card.tsx src/components/publication-list-card.tsx tests/career-card.test.tsx tests/publication-cover.test.tsx
git commit -m "feat(uploads): render uploaded logo/cover images on public pages"
```

---

### Task 8: Full verification gate

**Files:** none (verification only)

**Interfaces:** none — confirms every earlier task's deliverable holds together as a
whole before the one remaining manual step.

- [ ] **Step 1: Full local verification**

```bash
npm test -- --run
npx tsc --noEmit
npm run build
npm run check:size
npx wrangler d1 migrations apply portofolio-admin --local
npx wrangler d1 migrations apply portofolio-admin-staging --local --env staging
npx playwright test
npm run cf:check
```

Expected: all pass. `check:size` should read effectively unchanged from before this
plan — no admin-only code counts against the public JS budget, and the public
components touched in Task 7 (`CareerCard`, `PublicationCover`, `AchievementCard`,
`PublicationListCard`) only add a conditional `<img>` tag, not new JS logic of any real
weight.

- [ ] **Step 2: Manual smoke test against a real upload**

```bash
npm run start -- -p 4180
```

Visit `http://localhost:4180/admin/career`, edit the existing entry, upload a small PNG
as its logo, save — expected: redirected to the list, and `/id/tentang` now shows that
image next to the "SD" mark. Edit the same entry again and upload a second, different
image — expected: the card now shows the second image (confirm via the R2 local state
that the first upload's key was deleted — `npx wrangler r2 object get
portofolio-uploads/<first-key> --local` should now fail). Repeat once for
`/admin/achievements`'s cover field, confirming `/id/pencapaian` and `/id/riset` show it.
Stop the server afterward.

- [ ] **Step 3: Commit** (only if Step 2 required any fix; otherwise skip — this task is
  verification, not new work)

---

## After Task 8 — manual steps (required before this branch is safe to push to main)

Merging this branch and pushing to `main` triggers CI's `deploy` job, which will fail
without the following, since R2 is not yet enabled on the Cloudflare account (a known
external blocker discovered during Task 1 — `wrangler r2 bucket create` returns API
error 10042, "Please enable R2 through the Cloudflare Dashboard"). None of this blocks
local development or testing — R2 bindings emulate fully locally via Miniflare/wrangler
`--local`, independent of the real account state.

**Before pushing this branch's merge to `main`, complete in order:**

1. Enable R2 on the Cloudflare account: dashboard → Account Home → R2 → accept the R2
   terms (free tier exists but must be turned on once).
2. Create both buckets:
   ```sh
   npx wrangler r2 bucket create portofolio-uploads
   npx wrangler r2 bucket create portofolio-uploads-staging
   ```
3. Apply the pending migration to both remote databases (local/test databases already
   have it from Task 1):
   ```sh
   npx wrangler d1 migrations apply portofolio-admin --remote
   npx wrangler d1 migrations apply portofolio-admin-staging --remote --env staging
   ```
4. **Revised, 2026-09-12: use a custom domain instead of the raw `r2.dev` public
   subdomain**, so the bucket sits inside the user's own Cloudflare zone and can carry a
   rate-limiting rule (extra safety net against cost-based read abuse — the r2.dev
   managed subdomain is opaque and outside the zone, so it cannot carry zone-level
   Security/WAF rules). In the Cloudflare dashboard: R2 → `portofolio-uploads` →
   Settings → Custom Domains → Connect Domain → enter a subdomain (e.g.
   `uploads.ferryandhikapratama.com`) → Continue (Cloudflare creates the proxied DNS
   record automatically, since the zone is already on Cloudflare). Repeat with a
   distinct subdomain for `portofolio-uploads-staging` if staging should also serve
   images publicly (e.g. `uploads-staging.ferryandhikapratama.com`).
5. Add a rate-limiting rule scoped to that hostname: dashboard → Security → WAF → Rate
   limiting rules → Create rule → match `Hostname equals uploads.ferryandhikapratama.com`
   → set a request-per-IP threshold appropriate for a personal site's image traffic
   (e.g. 100 requests / 1 minute per IP) → action: Block (or Managed Challenge). This is
   available on the Free plan (1 rule included).
6. Update `src/lib/uploads.ts` with the custom domain instead of an r2.dev URL:
   ```ts
   export const UPLOADS_PUBLIC_BASE_URL = 'https://uploads.ferryandhikapratama.com';
   ```
7. Run `npm test -- --run && npx tsc --noEmit && npm run build`, then commit:
   ```sh
   git add src/lib/uploads.ts
   git commit -m "fix(uploads): set the real R2 public base URL"
   ```
8. Merge/push this branch, then deploy and confirm a real uploaded image renders on
   the live site through the custom domain.

Until step 2 is done, do not push this branch's merge to `main` — CI's `deploy` job
will fail on the Worker upload step (a failed deploy does not take down the
currently-live version, so this is a red CI run, not a production outage, but it's
avoidable by sequencing steps 1-3 first).
