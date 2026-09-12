# Admin image uploads — logos and covers via Cloudflare R2

**Date:** 2026-09-12
**Status:** Approved by the user in chat (scope, storage, and fallback-behavior
decisions); spec not yet independently reviewed.
**Context:** The admin content panel (`2026-09-11-admin-content-panel-design.md`,
implemented and live) lets the owner manage Career, Education, and Achievement text
content, but every visual element is either a plain 2-letter initial (`career_entries.mark`)
or a fully hard-coded graphic (`PublicationCover`, a static "JUTIF journal cover" mockup
with no data props at all). The user wants to upload a real logo image per Career/Education
entry and a real cover image per Achievement, from the admin panel.

**Explicitly out of scope:** everything the admin panel's own spec already excluded
(Karya/case studies, Dasbor live stats, Kontak email, Buku Tamu) remains excluded here too
— this spec only adds an image field to the two content types the admin panel already
manages. No new content types, no general-purpose media library, no image editing/cropping
UI, no removing an image without replacing it (see Decision 6).

---

## 1. Decisions (locked with the user, 2026-09-12)

1. **Scope:** exactly two new optional image fields — a logo on `career_entries` (used by
   both Karier and Pendidikan, since they share that table) and a cover on `achievements`.
   Nothing else changes.
2. **Storage: Cloudflare R2.** Not an external service (Cloudinary, S3, etc.) — keeps the
   whole stack inside the Cloudflare account already hosting the Worker and D1, matching
   the admin panel's own precedent decision. A new R2 bucket, bound to the Worker exactly
   like the D1 binding.
3. **Serving: a public R2 bucket, not a Worker route.** Images are served directly from
   Cloudflare's edge via the bucket's public access (the `r2.dev` managed subdomain — see
   §2), not proxied through a Next.js Route Handler. This matches the project's existing,
   explicit preference to keep image requests off the Worker (the same reasoning already
   documented in `next.config.ts` for why `next/image` optimization is disabled: avoid
   counting every image view against the Free-plan Worker request cap).
4. **Career/Education logo does not replace the `mark` badge — both show together.** The
   2-letter `mark` stays required and visible; an uploaded logo appears alongside it as a
   small image. An entry with no logo renders exactly as it does today.
5. **Achievement cover replaces `PublicationCover`'s hard-coded graphic only when an
   entry has one uploaded.** `PublicationCover` becomes data-driven (accepts an optional
   cover URL) but keeps its current hard-coded rendering as the fallback — the existing
   JUTIF entry (and any future entry with no cover uploaded) is unaffected.
6. **No "remove image" action in v1** — only upload-a-new-one-to-replace. Replacing does
   delete the old R2 object (no orphan growth), but there's no button to go from
   "has an image" back to "has no image" without uploading a replacement. YAGNI: the two
   real entries that exist today don't need this, and it's a cheap follow-up if it ever
   comes up.
7. **Validation:** images only (`image/png`, `image/jpeg`, `image/webp`), 5 MB max per
   file. Enforced both client-side (`accept` attribute, `<input>` is a UX hint only) and
   server-side (the Server Action re-checks type and size — the client-side hint is not a
   security boundary).

## 2. Architecture

```
Admin upload (Server Action)
  → validate file (type, size)
  → env.UPLOADS.put(newKey, fileBytes, {httpMetadata: {contentType}})
  → env.DB write: save newKey on the row
  → if the row had an old key, env.UPLOADS.delete(oldKey)
  → redirect to the list

Visitor request for an uploaded image
  → served directly by Cloudflare from the R2 bucket's public r2.dev URL
  → never touches the Worker

Public page render (Tentang / Pencapaian / Riset)
  → repository read returns the stored key
  → toPublic() computes the full URL: `${UPLOADS_PUBLIC_BASE_URL}/${key}`
  → <img src={url}> — no Worker involvement, same as any other static asset
```

**Manual step required before this works in production** (parallel to the admin panel's
own Cloudflare Access step): after the R2 bucket is created, its public access (`r2.dev`
subdomain) must be enabled once in the Cloudflare dashboard (R2 → the bucket → Settings →
Public Access → Allow Access). This cannot be done from this repository or by an agent.
The resulting `pub-<hash>.r2.dev` URL becomes the `UPLOADS_PUBLIC_BASE_URL` constant (§3)
— unknown until that step happens, so it's a placeholder the implementation plan must call
out explicitly, not guess.

**Why not proxy images through a Route Handler instead?** It would avoid the manual public-
access step, but every image view would then invoke the Worker — exactly the cost the
project already paid attention to for `next/image` (`next.config.ts`'s `unoptimized: true`
comment: *"every /_next/image request invokes the Worker and counts against the 100k/day
cap"*). A public bucket costs one dashboard click and then never touches the Worker again.

**Local dev and tests:** `getPlatformProxy` (already used for local D1 access — see the
admin panel spec §2 and `next.config.ts`'s `initOpenNextCloudflareForDev()`) proxies R2
bindings the same way it proxies D1. No new local-dev mechanism is needed; a test helper
analogous to `tests/helpers/d1.ts`'s `createTestDb()` gives repository/action tests a real
local R2 bucket instead of a mock.

## 3. Data model changes

Two new nullable columns, one migration (`migrations/0002_add_upload_columns.sql`):

```sql
ALTER TABLE career_entries ADD COLUMN logo_key TEXT;
ALTER TABLE achievements ADD COLUMN cover_key TEXT;
```

Both store the R2 object key only (e.g. `career-logos/3-1789200000000.webp`), never a full
URL — the public base URL is a separate constant (`src/lib/uploads.ts`,
`UPLOADS_PUBLIC_BASE_URL`), so switching to a custom domain later is a one-line change with
no data migration. Keys are namespaced by content type and include the row id and an
upload timestamp (`{table-prefix}/{id}-{timestamp}.{ext}`) so every upload gets a fresh,
collision-free key — replacing an image never reuses the old key, which is also what makes
"upload new, then delete old" (§4) safe even if the delete step fails.

**Repository type changes:**
- `CareerEntryRow` gains `logoKey: string | null`; `CareerEntryInput` gains
  `logoKey: string | null` (settable on create/update, alongside the other fields).
- `CareerEntry` (the public, locale-resolved shape) gains `logoUrl?: string` — computed in
  `toPublic()` as `row.logoKey ? \`${UPLOADS_PUBLIC_BASE_URL}/${row.logoKey}\` : undefined`.
- `AchievementRow` gains `coverKey: string | null`; `AchievementInput` gains
  `coverKey: string | null`.
- `Achievement` (public) gains `coverUrl?: string`, computed the same way.

The snapshot/undo mechanism (admin panel spec §3) already snapshots "this row's editable
fields" as JSON before every update — `logoKey`/`coverKey` are editable fields like any
other, so they're included in the snapshot/undo round-trip automatically once added to the
`*Input` types the existing `updateCareerEntry`/`updateAchievement` functions already
snapshot generically. No new undo logic is needed.

## 4. Upload flow (Server Actions)

Extending `createCareerEntryAction`/`updateCareerEntryAction` (career-entries.ts) and
`createAchievementAction`/`updateAchievementAction` (achievements.ts):

1. Parse the text fields exactly as today (`parseCareerEntryForm`/`parseAchievementForm`
   are unchanged — file handling is separate, not part of those pure parser functions,
   so their existing unit tests keep working unmodified).
2. Read the file field (`formData.get('logo')` / `formData.get('cover')`) as a `File`.
   If it's absent or an empty file (a submitted-but-untouched `<input type="file">` posts
   a zero-byte `File` with an empty name — must be treated as "no new upload", not an
   error), skip straight to step 5 keeping the row's existing key unchanged.
3. If present and non-empty: validate `file.type` against the allowlist and `file.size`
   against the 5 MB cap, throwing the same style of `Error` the existing parsers already
   throw on invalid input (caught by the admin error boundary, `src/app/admin/error.tsx`,
   already in place).
4. Upload to R2 under a fresh key (`env.UPLOADS.put(newKey, await file.arrayBuffer(),
   {httpMetadata: {contentType: file.type}})`).
5. Call the existing repository create/update function with the input object, including
   the resolved key (new key from step 4, or the unchanged existing key from step 2, or
   `null` for a brand-new entry with no upload).
6. On update only, if the row had a *different* previous key (a real replacement, not a
   first-time upload), delete the old object (`env.UPLOADS.delete(oldKey)`) — after step 5
   succeeds, so a failed D1 write never leaves an orphaned old file deleted for nothing.

**Permanent delete** (`permanentlyDeleteCareerEntryAction`/`permanentlyDeleteAchievementAction`,
already existing in `src/lib/actions/trash.ts`) additionally deletes the row's R2 object
(if any) after the D1 hard-delete succeeds — trash rows already carry their key through
`listTrashedCareerEntries`/`listTrashedAchievements`, so this is a small addition, not a
new read path.

**Next.js config change required:** Server Actions cap request bodies at 1 MB by default;
a 5 MB image would be rejected before the action even runs. `next.config.ts` needs
`experimental.serverActions.bodySizeLimit: '5mb'` (confirmed against this project's actual
installed Next.js 16.3 docs at `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` —
still under `experimental` in this version, not promoted to top-level).

## 5. UI changes

**`CareerEntryForm` / `AchievementForm`:** add a file input (`accept="image/png,
image/jpeg,image/webp"`) below the existing fields. When editing an entry that already has
`logoUrl`/`coverUrl`, show a small preview of the current image above the input with a
caption ("Logo saat ini" / "Cover saat ini") so the admin can see what's already set before
deciding whether to replace it. No `encType` attribute needed on the `<form>` — Next.js
Server Actions handle `FormData` containing `File` values automatically regardless of the
form's `encType`.

**`CareerCard`** (`src/components/career-card.tsx`, the public-facing component): when
`entry.logoUrl` is present, render a small image (e.g. `size-8 rounded-md object-cover`)
next to the existing `mark` badge — both visible, matching Decision 4. No change when
`logoUrl` is absent.

**`PublicationCover`** (`src/components/publication-cover.tsx`): gains an optional
`coverUrl?: string` prop. When present, render `<img src={coverUrl} alt="" className="h-52
w-full object-cover" />` (or the existing list-size height) in place of the current
hard-coded JUTIF markup; when absent, render exactly what it renders today. Its three
callers (`AchievementCard`, `PublicationListCard`, `PaperStory`) pass `item.coverUrl`
through — each already receives the full `Achievement`/`AchievementRow` object, so this is
a one-line prop addition per call site, not a new data-fetching path.

## 6. Testing

Matches the admin panel's existing conventions:
- A `createTestBucket()` helper (`tests/helpers/r2.ts`, sibling to `tests/helpers/d1.ts`)
  using `getPlatformProxy` to get a real local R2 binding for repository/action tests —
  no mocks, consistent with how D1 is tested today.
- Repository tests: `createCareerEntry`/`updateCareerEntry` and the achievement
  equivalents correctly persist and return `logoKey`/`coverKey`; `toPublic()` correctly
  computes `logoUrl`/`coverUrl` from a non-null key and omits it (as `undefined`, not
  `null`) when the key is null.
- Action tests: file-type and file-size validation (reject a `.txt` file, reject an
  oversized buffer, accept a valid small PNG/JPEG/WebP); the "no file submitted" path
  leaves an existing key untouched on update; the "replacing a key" path calls `delete`
  on the old key after the new key is written (verifiable by checking the bucket no
  longer has the old key and does have the new one).
- No new Playwright coverage — matches the admin panel's own testing decision (`/admin`
  sits behind Cloudflare Access, `next dev`/`next start` don't have Access, so `/admin`
  was never covered by e2e; this doesn't change that).

## 7. Open risks / follow-ups (not blocking, noted for the plan)

- **R2 bucket public-access toggle is a manual, one-time dashboard step**, like Cloudflare
  Access was for the admin panel itself — the plan must call this out explicitly as a step
  for the user, and the resulting `pub-<hash>.r2.dev` URL must be captured and placed into
  `UPLOADS_PUBLIC_BASE_URL` before uploaded images will actually resolve publicly (D1 writes
  and the admin UI work regardless — only the `<img>` tags on the public site depend on
  this step having happened).
- **No image resizing/optimization.** A very large but under-5MB image (e.g. a
  4000×3000px photo saved as a small-enough JPEG) is served at full resolution with no
  `next/image`-style responsive sizing, since it's served directly from R2, outside
  Next's image pipeline entirely — a large photo used as a small avatar-sized logo could
  add a few hundred KB to a page's weight, visible in a Lighthouse run, not a silent
  failure. Acceptable for a personal site with two image slots filled occasionally by the
  owner, who can pre-resize before uploading; revisit if it ever becomes a real problem
  (Cloudflare Images, a paid managed resizing service, is the natural upgrade path —
  deliberately not chosen now per Decision 2's "stay in R2, no extra service" call).
- **No staging/production R2 bucket separation decision made yet** — the admin content
  panel used a separate staging D1 database; the plan should create a matching
  `portofolio-uploads-staging` bucket for `env.staging`, mirroring that precedent, unless
  the implementer finds a reason not to (none anticipated).
