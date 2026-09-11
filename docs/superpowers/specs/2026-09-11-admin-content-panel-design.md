# Admin content panel — Career, Education, Achievements

**Date:** 2026-09-11
**Status:** Approved by the user in chat (auth, DB, and scope decisions); spec not yet
independently reviewed.
**Context:** The Personal redesign (`2026-09-09-ruang-kerja-personal-redesign.md`) shipped
three sections as honest empty/placeholder states: Pendidikan (empty), the single
hard-coded Karier entry, and the single hard-coded Pencapaian entry. The user wants to be
able to add real data to these three sections themselves going forward, the way any site
with an admin area lets its owner edit content without touching code.

**Explicitly out of scope for this spec:** Buku Tamu. That feature is a *visitor-facing*
guestbook (public sign-in, live-posted messages, emoji reactions — modelled after
`satriabahari.my.id/id/guestbook`), an entirely different shape of feature (public OAuth,
not owner-only; write-heavy, not admin-curated). It gets its own spec later. Karya
(case studies), Dasbor's live stats, and Kontak's email delivery are also out of scope —
the user did not select them for this round.

---

## 1. Decisions (locked with the user, 2026-09-11)

1. **Scope:** the admin panel manages exactly three content types — Karier, Pendidikan,
   Pencapaian (Publikasi/Sertifikat). Nothing else moves off static files in this round.
2. **Single admin.** No multi-user, no roles. One person (the site owner) can sign in.
3. **Auth: Cloudflare Access**, not application-level auth. Access gates `/admin/*` at the
   edge for the account's own email; the Next.js app carries zero login code, zero
   password/session handling, zero OAuth client secrets. This overrides the alternative
   (custom NextAuth/Auth.js login) that was offered and declined.
4. **Database: Cloudflare D1.** Not Supabase. Keeps the whole stack inside the Cloudflare
   account already hosting the Worker — no new external service, no new account to manage.
   Content volume is small (tens of rows), so D1's free tier and edge replication are
   more than sufficient.
5. **Public pages move from fully static to statically-cached-with-revalidation** for the
   two routes this touches (Tentang, Pencapaian) only. Every other route — Home, Karya,
   Riset, Dasbor, Kontak, Links, Buku Tamu, 404 — stays exactly as static as it is today.
   This is the path `docs/cloudflare.md` already flagged: *"Before introducing ISR,
   revalidatePath, revalidateTag, or cached server fetches, replace that cache with a
   writable backend."* D1 is that backend.
6. **Existing hard-coded content becomes the D1 seed data**, then the source of truth
   moves to D1 permanently. `src/content/career.ts` and `src/content/achievements.ts` are
   retired once the migration seed lands (their types move to the data-access layer).
7. **Bilingual editing, one form.** Every content type is bilingual today
   (`Record<Locale, T[]>` in the existing files) with independently written Indonesian and
   English text — not machine-translated. The admin form keeps that convention: each
   entry's Indonesian and English fields are edited together, side by side, in one save.
   No auto-translate step in this round (YAGNI; can be added later without a schema
   change since it would only prefill the English fields).

## 2. Architecture

```
Visitor request
  → Cloudflare edge cache (HTML, until revalidated)
    → Worker (OpenNext) → Next.js → D1 read (only on cache miss / after revalidation)

Admin request to /admin/*
  → Cloudflare Access (edge, before the Worker is invoked)
      - not the owner's email → 403 at the edge, Worker never runs
      - the owner's email → request passes through, carrying an Access JWT header
  → Worker (OpenNext) → Next.js admin route
      → D1 write (Server Action)
      → revalidatePath() for the affected public routes
```

Cloudflare Access is configured once in the Cloudflare Zero Trust dashboard (a policy on
`ferryandhikapratama.com/admin*` restricted to `ferryandhikapratama@gmail.com`, via email
OTP or "Sign in with Google") — not in this repository. The Next.js app never sees
credentials; it can optionally read the `Cf-Access-Authenticated-User-Email` header Access
injects, but no code in this spec depends on it (single admin, edge-enforced identity is
enough — reading the header is a possible defence-in-depth addition, not required for v1).

**Local development:** Access only protects the deployed domain. `npm run dev` /
`npm run cf:preview` serve `/admin` unauthenticated on the developer's own machine — the
same trust boundary every other local-only tool on this machine already has.

## 3. Data model (Cloudflare D1, SQL)

Two tables. `career_entries` serves both Karier and Pendidikan (same shape as the existing
`CareerEntry` type; a `kind` column tells them apart) rather than duplicating the table.

```sql
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
  mark TEXT NOT NULL,              -- 2-letter avatar initials, e.g. "SD" — not bilingual
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  issuer TEXT NOT NULL,            -- e.g. "JUTIF · Vol. 7 No. 2" — identical both locales today
  year TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Publikasi', 'Sertifikat')),
  category TEXT NOT NULL CHECK (category IN ('Keamanan', 'Pendidikan', 'Pengembangan')),
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

`type`/`category` on `achievements` stay canonical Indonesian enum values on purpose —
this matches the existing `ACHIEVEMENT_TYPE_LABEL_KEY`/`ACHIEVEMENT_CATEGORY_LABEL_KEY`
maps in `src/lib/taxonomy-labels.ts`, which the public pages already use to render the
translated label from the canonical value. The admin form presents a translated
`<select>` (reusing those same label maps) but writes the canonical value underneath — no
second taxonomy is invented. `career_entries.category` is genuinely free bilingual text
(not an enum) because that is what the existing data already is (`'Pendidikan'` /
`'Education'`, hand-written, not derived from a shared map).

`sort_order` is new — the current single entries don't need it, but a real multi-entry
admin panel does. Lower sorts first, matching reading order top-to-bottom.

## 4. Public page changes

`src/app/[locale]/tentang/page.tsx` and `src/app/[locale]/pencapaian/page.tsx` (and their
data-loading helpers) switch from importing `CAREER`/`EDUCATION`/`ACHIEVEMENTS` from
`src/content/*.ts` to reading from D1 through a small data-access module
(`src/lib/repositories/career.ts`, `src/lib/repositories/achievements.ts`), shaped to
return the exact same TypeScript types the pages already consume — so the page components
themselves barely change. Reads use Next's `fetch`/data cache semantics so the rendered
HTML is still edge-cacheable exactly as today, until a write calls `revalidatePath` for
the four affected URLs (`/id/tentang`, `/en/about`, `/id/pencapaian`,
`/en/achievements`). Every other route's data loading is untouched.

**Free-plan request cost:** this doesn't change how the *static* routes are served, and it
doesn't make Tentang/Pencapaian hit the Worker on every request either — Cloudflare still
serves the cached HTML for those two routes between edits, identically to today. Only a
`revalidatePath` call (i.e., an admin save) forces the next visitor request to regenerate
that one page from D1; after that it's cached again. No new "one Worker invocation per
visit" pattern is introduced — the concern that made `localeCookie: false` necessary
earlier is not reintroduced by this design.

## 5. Admin UI

Route tree, outside `[locale]` (excluded from the `next-intl` proxy matcher in
`src/proxy.ts`, same way `api`/`_next`/`_vercel` already are):

```
src/app/admin/
  layout.tsx              — minimal shell, no public design system dependency
  page.tsx                — links to the three sections + row counts
  career/page.tsx         — list + add/edit/delete/reorder for kind='career'
  education/page.tsx      — list + add/edit/delete/reorder for kind='education'
  achievements/page.tsx   — list + add/edit/delete/reorder
```

Each list page shows existing rows (title, a one-line ID/EN preview, sort order) with
edit/delete actions, and a form (inline or `/admin/career/new`) with the Indonesian and
English fields grouped in two visually distinct columns so it's obvious both need filling
in before saving. Writes go through Next.js Server Actions calling the repository module
directly (no separate REST/JSON API surface needed for a single first-party admin UI).

Plain, functional styling reusing the existing design tokens (`--bg`, `--fg`, `--border`,
etc. from `globals.css`) for visual consistency, but not held to the public site's
polish/motion budget — this is an internal tool, not a page in the 210 KB public JS budget
(admin routes are a separate bundle; they are never linked from the public nav, and
Lighthouse/CI budget checks apply to the public routes only).

## 6. Migration

A one-time seed script (run once against the deployed D1 database, via `wrangler d1
execute`) inserts the current `CAREER.id[0]` / `CAREER.en[0]` pair as one `career_entries`
row (`kind='career'`), and the current `ACHIEVEMENTS.id[0]` / `.en[0]` pair as one
`achievements` row. `EDUCATION` is currently empty both locales, so no education seed row
exists — the admin panel is how the first one gets added. After the seed is verified
against the live site (Tentang/Pencapaian render identically to before, from D1 instead of
the TS files), `src/content/career.ts` and `src/content/achievements.ts` are deleted along
with their now-unused tests.

## 7. Testing

Matches the project's existing TDD convention:
- Unit tests for the repository modules (map D1 rows ↔ the existing `CareerEntry`/
  `Achievement` shapes; sort by `sort_order`; `kind` filtering) against a local D1 binding
  (`wrangler`'s Miniflare-backed local D1, the same mechanism `npm run cf:preview` already
  uses).
- Unit tests for Server Action input validation (required bilingual fields, valid
  `type`/`category` enum values, `url` is a well-formed URL or empty).
- No Playwright coverage for `/admin/*` — it sits behind Cloudflare Access in the only
  environment Playwright would exercise meaningfully (production), and the existing e2e
  suite runs against `next dev`/`next start` where Access isn't present anyway. Manual
  verification against the deployed site substitutes, the same way Lighthouse and the
  Wrangler dry-runs already are controller-verified manually rather than in Playwright.
- Existing Tentang/Pencapaian Playwright specs keep passing unmodified — the pages' public
  output contract doesn't change, only where the data comes from.

## 8. Open risks / follow-ups (not blocking, noted for the plan)

- **D1 binding in local dev vs. production:** `wrangler.jsonc` needs a `d1_databases`
  block; the plan should confirm whether `next dev` (plain Node, no Workers runtime) can
  reach D1 at all, or whether admin development/testing has to happen through
  `cf:preview` (Workers runtime locally) instead. This is an implementation detail to
  resolve in the plan, not a design blocker — worst case, admin pages are only
  dev-testable via `cf:preview`, which already exists as a documented command.
  `getCloudflareContext()` from `@opennextjs/cloudflare` is the documented way to reach
  the binding from Next.js server code either way.
- **Cloudflare Access setup is a manual, one-time dashboard step** (Zero Trust policy on
  `ferryandhikapratama.com/admin*`), outside this repository and outside what an agent can
  configure — the plan should call this out explicitly as a step for the user to do
  themselves before `/admin` is safe to rely on in production.
- Reordering entries: a numeric `sort_order` input is the v1 mechanism (simplest to build
  and test); drag-and-drop is explicitly deferred as unnecessary for a handful of rows.
- No draft/preview state — a save is live immediately (after revalidation). Acceptable for
  a single-owner personal site; noted here in case it ever stops being acceptable.
