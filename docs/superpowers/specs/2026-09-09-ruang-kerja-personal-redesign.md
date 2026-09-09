# "Ruang Kerja" — Personal Redesign (Option A)

**Date:** 2026-09-09
**Status:** Draft for review
**Design source:** `public/design-preview/` sandbox (Option A "Personal"), reviewed and
approved with codex. Screenshots: `public/design-preview/review-*.png`.
**Supersedes visual rules in:** `docs/superpowers/specs/2026-08-30-ruang-kerja-design.md`
(see §2 Decisions).

---

## 1. Purpose

Replace the current single-column-ish shell and thin page bodies with the "Personal"
direction from the design sandbox: a persistent left **rail** (profile + icon nav), a
narrow reading column, one type family, colour-per-brand tech badges, and several new
data-driven sections. Every one of the 8 existing routes is restyled; a 9th route,
**Dasbor**, is added as a structural placeholder.

The design is fixed. This spec transcribes the sandbox into a buildable form and records
the decisions that differ from the 2026-08-30 spec.

### What changes from the current site

| Current | This redesign |
|---|---|
| Fonts: Inter + Inter Tight (display/body split) | One family: **Source Sans 3** (`--font-body`), JetBrains Mono kept for the few remaining mono uses |
| Sidebar ~280px, plain rail | Rail 210px: `fa.` mark, name, role, availability link, **icon nav** with active `→`, GitHub link, "Membangun · Mengajar · Menguji" note |
| Night accent `#FACC15` | Night accent `#efd45d`; `--bg #101112`, `--surface #1b1d1e` |
| Monospace = semantic marker for every number/date/tech term | **Relaxed** — mono only where it still reads well; numbers in body copy are normal weight |
| Tech stack = monochrome line glyphs | **Colour-per-brand badges** (brand SVG + `color-mix` tint), grouped & filterable |
| Home: eyebrow + tagline + statement + 3 pillar cards + work + research + contact | Home: hello + **Keahlian** (filterable badges) + Karya pilihan (image cards) + Riset callout + Kontak CTA |
| About: 3 paragraphs | About: bio + **Karier** timeline + **Pendidikan** (empty-state) + Keahlian |
| Work: card list | Work: **Tipe + Kategori filters** + "N karya" count + image cards with "Pilihan" badge |
| — | New route **/dasbor** (`/en/dashboard`): GitHub / WakaTime / Monkeytype stat tiles, all "belum terhubung" |

## 2. Decisions (locked with the user, 2026-09-09)

1. **Two themes kept.** Night uses the sandbox palette; light is adapted to the same
   direction (warm paper + ochre). `ThemeToggle` stays in the rail. This overrides the
   sandbox being dark-only.
2. **Colour-per-brand tech badges** are the approved look. This overrides
   2026-08-30 §Concept ("monochrome line glyphs, never multi-colour brand logos").
3. **Monospace relaxed.** Mono is no longer a blanket marker for all numbers/dates/
   technical terms (overrides 2026-08-30 "Everything else from FASE-3 still binds").
   Mono is retained for: code-ish inline tokens, the JSON-LD-adjacent bits, and anywhere
   a designer would still reach for it. Numbers in prose render in the body face.
4. **New data-driven sections are scaffolded with placeholders.** Real content
   (education history, Dasbor live stats, contact email) lands later; the components
   ship now with honest empty-states ("belum terhubung" / "belum ditambahkan").
5. **Approach 1 (foundation-first)** phasing — see §11.
6. Everything still binding from 2026-08-30: one accent per theme, motion 150–300 ms
   `cubic-bezier(0.16,1,0.3,1)`, `prefers-reduced-motion` honoured, Lighthouse
   Accessibility 100, one `<h1>` per page, no heading-level skips, bilingual id/en with
   the locale prefix always in the URL, JS budget **210 KB gzip** (do not exceed
   without sign-off).

## 3. Design tokens & typography

`src/app/globals.css` `@theme` block. Keep the existing token names; retune values.

### Fonts (`src/app/fonts.ts`)

```ts
import {Source_Sans_3, JetBrains_Mono} from 'next/font/google';
export const bodyFont = Source_Sans_3({subsets: ['latin'], variable: '--font-body', display: 'swap'});
export const jetbrainsMono = JetBrains_Mono({subsets: ['latin'], variable: '--font-jetbrains-mono'});
```

`--font-sans` and `--font-display` both resolve to `var(--font-body)`. `--font-mono`
unchanged. `layout.tsx` + `global-not-found.tsx` apply `${bodyFont.variable}
${jetbrainsMono.variable}`. (codex already did this in the WIP — keep it.)

### Palette

| Token | Night | Light (adapted) |
|---|---|---|
| `--bg` | `#101112` | `#f7f3ec` |
| `--surface` | `#1b1d1e` | `#efe9dd` |
| `--fg` (`--text`) | `#eeefed` | `#2b2620` |
| `--fg-muted` (`--muted`) | `#a1a7a9` | `#6b6357` |
| `--border` (`--line`) | `#33383b` | `#ddd4c3` |
| `--accent` | `#efd45d` | `#8f5f18` |
| `--accent-dim` | `color-mix(in srgb, var(--accent) 16%, var(--bg))` | same formula |
| `--on-accent` | `#101112` | `#f7f3ec` |

Light values are a starting point; tune during P1 against Lighthouse contrast (must stay
AAA-for-body / AA-large). Ratios verified in P1, recorded in the ledger.

### Scale (from sandbox, `[data-design=a]` + `profile-sections.css` override)

- Body 15px / 1.65–1.8. `h1` 29–34px, `-0.6px` to `-1.3px` tracking. `h2` 19–22px.
  `h3` 16–17px. Eyebrow/category 10px, `1.2px` tracking, weight 700, `--fg-muted`.
- Radii: badge 7px, card 10–17px, pill/filter 20–24px, rail mark 22px.
- Section separation: `border-top: 1px solid var(--border)` + `margin-top` ~28–32px +
  `padding-top` ~26–28px. `SectionHead` sits under it.

## 4. Shell & rail

### Layout (`src/app/[locale]/layout.tsx`)

```
<div class="mx-auto max-w-[1190px] px-6 lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12">
  <Sidebar />              {/* the rail */}
  <div class="min-w-0">{children}</div>
</div>
```

`Noise` and the theme init `<script>` stay. `mt` ~36px on desktop.

### Rail (`src/components/sidebar.tsx`)

Desktop ≥1024px: `position: sticky; top: 94px; align-self: start`. Contents, top to
bottom:

1. **Profile mark** — 74×74, radius 22, `--surface`-ish bg, `fa` + a dot bottom-right in
   `--accent`. `aria-label="Ferry Andhika Pratama"`.
2. Name `Ferry Andhika Pratama` (`h2`, 21px), role from `sidebar.role`.
3. **Availability link** — `sidebar.availability` → `/kontak`, 11px, accent, underline.
4. `<Nav>` inside a `border-top`/`border-bottom` band.
5. **GitHub link** — `code` icon + "Pratametheus ↗" → `https://github.com/Pratametheus`.
6. **Rail note** — "Membangun · Mengajar · Menguji", 10px muted.
7. **`<ThemeToggle>` + `<LocaleSwitcher>`** — kept, placed below the note (grouped,
   `role="group"` with names "Tema"/"Bahasa" as today).

**Mobile <1024px:** a top bar (min-height 64) with the `fa.` wordmark link (→ `/`) and a
pill **Menu** button (`+`/`−`). Open state = a rounded floating panel (`right`, `top-20`,
shadow, `max-h` scroll) containing the same rail contents. `Esc` closes and returns
focus to the trigger. The nav has `aria-label="Navigasi utama"`. (codex's WIP already
implements this pattern — keep and finish it.)

### Nav (`src/components/nav.tsx`, `nav-item.tsx`)

- Order: Beranda, Tentang, **Pencapaian**, Karya `(3)`, Riset, **Dasbor**, Kontak,
  Links, Buku Tamu. (Sandbox nav is shorter; the real site keeps all routes. Final order
  confirmed in P1 — put the "portfolio-ish" ones first, utility last.)
- Each item: `Icon name={key}` (18px) + label. `Karya` shows a count badge `3` from
  `getAllCaseStudies` length. Active item: `aria-current="page"`, `--fg` text, accent
  icon, and a trailing `→` (`aria-hidden`).
- `NavItem` gains `icon?: IconName` (defaults to `index` number when absent — keep the
  fallback for safety). `nav.tsx` passes `icon={key}`.

### Icons (`src/components/icon.tsx`)

`IconName` currently has home/about/work/research/achievements/guestbook/contact/links +
build/teach/secure + sun/moon. **Add:** `dashboard` (2×2 squares), `code` (`</>`).
Restyle the nav-route glyphs to the sandbox's lighter single-stroke set (paths in
`preview.js` `icons{}`), stroke-width 1.6, `stroke-linecap/linejoin round`. Every nav
`key` must have a matching `IconName` — verified by a unit test.

## 5. Shared components (Phase 2)

Each is a focused unit: one job, typed props, testable in isolation. Client components
only where interaction requires it (`'use client'` noted).

### `SectionHead`
`{icon?: IconName; title: string; description?: string; aside?: ReactNode}` → the
`border`-topped heading block (`<h2>` with optional leading icon, optional `<p>`
sub-line, optional right-aligned `aside`).

### `SkillList` (`'use client'`)
Renders the filterable "Keahlian" block. Data from `src/lib/skills.ts`. Groups:
`Semua, Frontend, Backend, Mobile, Database, Tools`. Filter buttons show a per-group
count; active button `aria-pressed="true"`. Badge = brand SVG (`public/tech/<slug>.svg`,
`<img>` 19px, `alt=""`) + name, tinted `background: color-mix(in srgb, var(--brand) 20%,
var(--bg))`, `--brand` set inline from the skill's `color`. `aria-live="polite"` on the
badge container. Broken icon → text fallback `◈`. No animation beyond the 150 ms colour
transition.

### `TechBadgeRow`
Non-interactive variant of the badge row (used on work cards / detail): just the brand
SVGs at 25px, `alt` = skill name.

### `WorkCard`
`{caseStudy}` → image cover (`/karya/<slug>.webp`, `aspect-ratio: 1.8`, `object-fit:
cover`), `featured` → `Pilihan` label (accent, top-right), hover/focus reveal "Lihat
detail ↗" overlay (`prefers-reduced-motion` → overlay always faded, no transition).
Body: `topic · type` eyebrow, title link, tagline, `TechBadgeRow`, "Cerita di balik
proyek →" link. Whole cover is a link to the case study.

### `WorkFilters` (`'use client'`)
Two `role="group"` rows (Tipe: Semua/Web/Mobile — Kategori: Semua/Pendidikan/Keamanan/
Penulisan), pill buttons with `aria-pressed`. Lifts state to the Karya page via callback
or renders the grid itself. Emits the filtered list + a `role="status"` "N karya" count.
Empty combination → `DataEmpty` ("Belum ada karya dalam kombinasi ini").

### `Timeline` + `CareerCard` + `DataEmpty`
- `CareerCard {role, organization, period, category, mark, description}` → org mark
  (49×49 initials), role `h3`, org `p`, `period · category` small, `<details>` "Tampilkan
  detail" → description. Native `<details>`; summary colour shifts to accent on open.
- `DataEmpty {icon, title, description, action?}` → dashed-border placeholder block.
  Reused by education, work-empty, achievements-empty, dashboard.

### `AchievementFilters` + `AchievementCard` + `PublicationCover`
- `AchievementFilters` (`'use client'`, `<form role="search">`, `preventDefault`):
  search `<input>` + Jenis `<select>` (Publikasi/Sertifikat) + Kategori `<select>`
  (Keamanan/Pendidikan/Pengembangan). Filters live on `input`/`change`. `role="status"`
  total. No results → `DataEmpty` with a "Hapus filter" reset button.
- `PublicationCover` — the JUTIF cover block (label, title, meta, kind). Two sizes
  (`h: 205` grid / `h: 235` list).
- `AchievementCard` — cover + body (`h2` title, issuer, `record-tags`, `record-footer`
  with "Terbit YYYY" + "DOI ↗", `<details>` "Detail publikasi").

### Research: `PublicationListCard` + `PaperStory`
List card (cover link + body + tags + "Lihat penelitian →"). Detail = `pageHeading` +
cover + `project-story` sections (Fokus / Metode / Publikasi / Proyek terkait). Reuses
the existing `buildScholarlyArticleSchema` JSON-LD.

### Contact: `SocialCard` + `ContactDraftForm` (`'use client'`)
- `SocialCard {variant: 'github'|'email', ...}` — GitHub card links out; Email card is
  inert ("Belum terhubung").
- `ContactDraftForm` — Nama/Email/Pesan fields → on submit, `navigator.clipboard
  .writeText("Dari: … <…>\n\n…")`, `role="status"` = "Draf disalin. Belum ada pesan yang
  dikirim." Clipboard denied → manual-copy message. **Never sends anything.**

### Dashboard: `DashboardStat` + `ConnectionState`
- `DashboardStat {label}` → tile, big `strong` value = `—` (`aria-label="Belum
  tersedia"`), `small` = "Belum terhubung".
- `ConnectionState {title, description}` → dashed block explaining the integration isn't
  wired. No simulated data anywhere on this page.
- `RepoGrid` — links to the 3 case studies (name ↗ / tagline / stack), the only real
  content on Dasbor.

### `PageHeading`
`{title, description}` → the dashed-underline `<h1>` + `<p>` used by every non-home page.
Replaces the ad-hoc `<h1 className="font-display text-5xl">` in each page.

## 6. Data model additions

### `src/lib/skills.ts`
```ts
export type SkillGroup = 'Frontend' | 'Backend' | 'Mobile' | 'Database' | 'Tools';
export type Skill = {name: string; slug: string; group: SkillGroup; brandColor: string};
export const SKILLS: Skill[] = [ /* 12 entries from profile-sections.js */ ];
export const SKILL_GROUPS = ['Semua', 'Frontend', 'Backend', 'Mobile', 'Database', 'Tools'] as const;
```
Brand SVGs committed to `public/tech/<slug>.svg` (html5, css3, typescript, react, nextjs,
tailwindcss, vitejs, laravel, flutter, supabase, postgresql, git). Source: simple-icons
(MIT) or hand-traced; monochrome `currentColor` SVGs recoloured via CSS is acceptable and
lighter — decide in P2, note in ledger. Skill names are not translated; group labels get
id/en keys.

### `src/content/types.ts` — extend `CaseStudy`
Add `type: 'Web' | 'Mobile'` and `topic: 'Pendidikan' | 'Keamanan' | 'Penulisan'`.
Populate the 3 existing entries in `src/content/case-studies.*`:
| slug | type | topic | featured |
|---|---|---|---|
| siakad-informatika | Web | Pendidikan | true |
| city-courier | Mobile | Keamanan | true |
| mochitoon | Web | Penulisan | false |
`work` filter labels (Web/Mobile, Pendidikan/Keamanan/Penulisan) get id/en keys.

### `src/content/career.ts`
```ts
export type CareerEntry = {role; organization; period; category; mark; description};
export const CAREER: Record<Locale, CareerEntry[]>  // 1 entry: Guru Informatika, SDN Ujung XIII/38, "Mulai April 2026", Pendidikan, "SD"
export const EDUCATION: Record<Locale, CareerEntry[]> = {id: [], en: []};  // empty → DataEmpty
```

Achievements: keep the existing single publication; the Pencapaian page reads it into
`AchievementCard`. `type: 'Publikasi'`, `category: 'Keamanan'`, `year: 2026`, DOI URL as
today.

## 7. Page-by-page

All pages: `PageHeading` (except home), the rail from §4, `footer` block (contact CTA +
GitHub link + `© 2026`). Each keeps its `generateMetadata` (hasLocale guard + `pageMetadata`).

| Route (id / en) | Body |
|---|---|
| **`/` `/en`** | `hello` (eyebrow `home.eyebrow2`, `h1` "Halo, saya Ferry" + accent dot, `home.intro` paras, "Sedikit tentang saya →" → `/tentang`) · `SkillList` · **Karya pilihan** = `SectionHead` + "Semua karya →" + `WorkCard` grid of `featured` · **Riset** callout (icon + JUTIF eyebrow + title + summary + "Jelajahi riset →" → `/riset`) · footer CTA |
| **`/tentang` `/about`** | `PageHeading` · `biography` (4 paras + signoff) · **Karier** = `SectionHead` + `CareerCard[]` from `CAREER` · **Pendidikan** = `SectionHead` + `DataEmpty` · `SkillList` |
| **`/karya` `/work`** | `PageHeading` · `WorkFilters` (Tipe + Kategori) · `role="status"` "N karya" · `WorkCard` grid · empty → `DataEmpty` |
| **`/karya/[slug]` `/work/[slug]`** | back-link → `/karya` · `PageHeading(title, tagline)` · `detail-meta` (`topic · type` / stack) · `TechBadgeRow` · hero image · `project-story` sections: two context sections (from `caseStudy.sections`? see note), "Teknologi", "Studi kasus lengkap" → link to the full existing case-study body · "Karya lainnya" = other `WorkCard`s. **Note:** the sandbox hard-codes context copy; real impl pulls the first 2 `caseStudy.sections` and keeps the existing full `<CaseStudyBody>` under "Studi kasus lengkap" (nothing removed). |
| **`/riset` `/research`** | `PageHeading` · "1 publikasi" · `PublicationListCard` → detail view (`?`-less, it's the same route today; keep single-paper layout: cover + `PaperStory` + JSON-LD) |
| **`/pencapaian` `/achievements`** | `PageHeading` · `AchievementFilters` · `role="status"` total · `AchievementCard` grid · `data-note` about certificates pending |
| **`/kontak` `/contact`** | `PageHeading` · "Mari terhubung" · `SocialCard` grid (GitHub live, Email inert) · `ContactDraftForm` |
| **`/links`** | `PageHeading` + the existing links list, restyled to the new card/badge vocabulary (no new data) |
| **`/buku-tamu` `/guestbook`** | `PageHeading` + existing `guestbook.empty` in a `DataEmpty`-style block (still display-only; backend explicitly out of scope) |
| **`/dasbor` `/dashboard`** *(new)* | `PageHeading` · GitHub section (`SectionHead` + "@Pratametheus ↗" + `DashboardStat`×3 + `ConnectionState` for the contribution calendar + `RepoGrid`) · WakaTime section (`DashboardStat`×3, all "—") · Monkeytype section (`DashboardStat`×3) |

### New route wiring for `/dasbor`

`src/i18n/routing.ts` `pathnames`: add `'/dasbor': {id: '/dasbor', en: '/dashboard'}`.
`src/app/[locale]/dasbor/page.tsx` (+ `generateMetadata`, `meta.description` keys).
`sitemap.ts` `STATIC_ROUTES` gains `/dasbor` (priority 0.5, yearly). `nav` gets a
`dashboard` key + `messages` entry. `Icon` gets `dashboard`.

## 8. i18n

Every new string is added to `messages/id.json` **and** `messages/en.json`, and to
`tests/messages.test.ts` `requiredKeys`. New / changed namespaces:

- `nav.dashboard`
- `sidebar`: `railNote` ("Membangun · Mengajar · Menguji"), keep `role`/`availability`.
- `home`: `helloEyebrow`, `helloHeading` ("Halo, saya Ferry"), `intro1`, `intro2`,
  `aboutLink`, `skills.title`, `skills.description`, `skills.groups.*` (6),
  `selectedWorkAll` ("Semua karya →"), `research.eyebrow`, `research.title`,
  `research.summary`, `research.link`. Retire `home.statement`, `home.pillars.*`,
  `home.pillarsTitle`, `home.heroAlt` (pillar cards & the illustrated hero are dropped
  from the home layout — `PillarCard` stays in the repo, unused, until P5 confirms
  nothing else needs it, then removed in the same phase).
- `about`: `biography1..4`, `signoff`, `career.title`, `career.description`,
  `career.detailSummary`, `education.title`, `education.description`, `education.emptyTitle`,
  `education.emptyBody`. Keep `about.meta`.
- `work`: `filters.typeLabel`, `filters.type.*` (Semua/Web/Mobile),
  `filters.categoryLabel`, `filters.category.*` (Semua/Pendidikan/Keamanan/Penulisan),
  `count` (ICU: `{n} karya`), `empty.title`, `empty.body`, `cardCta`, `detail.back`,
  `detail.fullCaseTitle`, `detail.fullCaseLink`, `detail.relatedTitle`.
- `research`: `count`, `listCardTags.*`, `paper.*` story headings.
- `achievements`: `filters.searchLabel`, `filters.searchPlaceholder`, `filters.typeLabel`,
  `filters.type.*`, `filters.categoryLabel`, `filters.category.*`, `total` (ICU),
  `empty.title`, `empty.body`, `reset`, `dataNote`, `card.*`.
- `contact`: `connectTitle`, `github.*`, `email.*`, `form.*` (labels, submit, statusOk,
  statusFail), keep existing.
- `dashboard` (new namespace): `title` via `nav`, `meta.description`, `github.title`,
  `github.link`, `github.stats.*` (3), `github.calendarEmpty.*`, `repos.title`,
  `wakatime.title`, `wakatime.stats.*`, `monkeytype.title`, `monkeytype.stats.*`,
  `notConnected`, `statValueLabel`.

## 9. Motion & accessibility

- Keep the `src/components/motion/*` primitives. `Reveal`/`Stagger` wrap the new
  sections the same way the current pages use them.
- `ScrollSpin` was tied to the old illustrated hero. The new home has **no hero
  illustration**, so `ScrollSpin` usage on `/` is removed; the primitive stays in the
  repo (still used nowhere else — flag for removal if P3 confirms it's dead).
- Filters, `<details>`, the mobile panel: plain React `useState`, no motion library.
- `prefers-reduced-motion`: colour-only transitions already ≤150 ms; the work-card hover
  overlay renders in its shown state with `transition: none`.
- One `<h1>` per page (`PageHeading` / `hello`). Section heads are `<h2>`, cards `<h3>`.
  `SkillList` filter group has `aria-label`; badge container `aria-live="polite"`.
  `AchievementFilters` is a labelled `<form role="search">`. Every interactive control
  ≥44px touch target (sandbox uses 36–44; bump to 44). Focus-visible ring = 2px accent,
  offset 3–5px (already in globals).
- Lighthouse Accessibility must stay 100 (CI asserts it). Contrast re-checked in P1.

## 10. Performance budget

- Cap: **210 KB gzip initial JS** (`scripts/check-bundle-size.mjs 210`). No increase
  without sign-off.
- New client components (`SkillList`, `WorkFilters`, `AchievementFilters`,
  `ContactDraftForm`, mobile panel) are small and page-local. Measure after P2 and P3;
  if any page's first load creeps toward the cap, split the filter component behind
  `next/dynamic({ssr: false})` the way the motion `*.lazy.tsx` wrappers already do.
- Brand SVGs are **static assets in `public/tech/`**, not bundled JS. Keep each < 2 KB.
- `images.unoptimized: true` stays (from the Worker-cost fix) — `WorkCard` covers use
  plain `<img>` with `loading="lazy"` + explicit `width`/`height` (or `aspect-ratio`) to
  hold layout.
- Fonts: two families now instead of three → net neutral or slightly lighter.

## 11. Phasing (Approach 1)

Each phase: TDD (test first), `tsc --noEmit` + `vitest` + `check:size` + `next build`
green, e2e green, one commit (or a short series), controller review, then next phase.
Merge to `main` at the end of P6 — or after any phase the user wants to see live (each
phase leaves the site coherent).

| Phase | Scope | Key deliverables |
|---|---|---|
| **P1 — Foundation** | tokens, fonts, shell, rail, nav, icons | `globals.css` palette (both themes, contrast verified), `fonts.ts`, `layout.tsx` grid, `sidebar.tsx` rail + mobile panel, `nav.tsx`/`nav-item.tsx` icon nav, `icon.tsx` +`dashboard`/`code` + restyled glyphs. Builds on codex's 12 WIP files. Unit: nav has 9 items w/ icons, every nav key ∈ `IconName`, sidebar renders rail + toggles. e2e: desktop rail visible, mobile panel + `Esc`. |
| **P2 — Shared components** | every component in §5, with tests, **not yet wired into pages** | `src/lib/skills.ts` + `public/tech/*.svg`, `src/content/career.ts`, `CaseStudy` type + data update. Components: `SectionHead`, `PageHeading`, `SkillList`, `TechBadgeRow`, `WorkCard`, `WorkFilters`, `Timeline`/`CareerCard`, `DataEmpty`, `AchievementFilters`/`AchievementCard`/`PublicationCover`, `PublicationListCard`/`PaperStory`, `SocialCard`/`ContactDraftForm`, `DashboardStat`/`ConnectionState`/`RepoGrid`. Each has a unit test (render + one interaction). |
| **P3 — Beranda + Tentang** | wire the two mocked pages | `page.tsx` (home) rebuilt: hello + `SkillList` + Karya pilihan + Riset callout + footer. `tentang/page.tsx`: bio + Karier + Pendidikan-empty + `SkillList`. i18n keys added, `messages.test.ts` updated. e2e: home has one `h1`, skill filter switches groups, "Sedikit tentang saya" link, about shows career card + expand. |
| **P4 — Karya + detail** | `karya/page.tsx` + `karya/[slug]/page.tsx` | filters + count + grid; detail = back-link + meta + hero + story + full `<CaseStudyBody>` kept + related. e2e: filter to a combination, empty combination shows `DataEmpty`, detail renders full case body. |
| **P5 — Riset, Pencapaian, Kontak, Links, Buku-tamu** | 5 pages, extrapolated where unmocked | research list/detail, achievements search+grid, contact social cards + draft form (clipboard, no send), links restyle, guestbook `DataEmpty`. Retire `PillarCard`/`ScrollSpin`/dead `home.*` keys here if confirmed unused. e2e: achievement search filters, contact "Salin draf" writes clipboard + status text, no network call. |
| **P6 — Dasbor** | new route | `routing.ts` pathname, `dasbor/page.tsx`, `sitemap.ts`, `nav`+`messages`+`Icon` for dashboard, `dashboard` namespace. All stats render `—` + "Belum terhubung"; `RepoGrid` links the 3 case studies. e2e: `/id/dasbor` + `/en/dashboard` resolve with one `h1`, no fabricated numbers in the DOM. |

## 12. Out of scope

- Real GitHub / WakaTime / Monkeytype integration (Dasbor stays placeholder).
- Real education history data.
- Guestbook backend (still display-only).
- A published contact email address / message delivery (form only drafts + copies).
- Analytics.
- Options B ("Workspace") and C ("Studio") from the sandbox.
- Removing `public/design-preview/` — it stays as the reference until P6 ships, then
  deleted in a final cleanup commit (it must not reach `public/` in production; add it to
  `.gitignore` or delete before merge — decided in P1).

## 13. Open items to resolve during implementation

1. Final nav order (P1).
2. Light-theme exact values after contrast check (P1).
3. Brand SVG sourcing: simple-icons monochrome recoloured vs. multicolour traced (P2).
4. Whether `karya/[slug]` context sections come from `caseStudy.sections[0..1]` or a new
   `caseStudy.summary` field (P4 — prefer reusing existing sections, no new copy).
5. `public/design-preview/` disposition — `.gitignore` vs delete (P1).
