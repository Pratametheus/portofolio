# "Ruang Kerja" — Portfolio Redesign Spec

**Date:** 2026-08-30
**Status:** Approved (concept + IA + tokens + Figma structure). Implementation plan follows.
**Supersedes / extends:** `docs/spec/FASE-3-Spec-Arsitektur.md`
**Copy source:** `docs/spec/FASE-2-Copy-Studi-Kasus.md`

---

## 1. Purpose

The site is Ferry's, built for himself first; anyone else who opens it should be
impressed. This redesign gives it a distinct visual identity ("Ruang Kerja" — the
workspace), a two-theme system (night = black + yellow; light = warm paper + ink),
a persistent sidebar layout, real image thumbnails for selected work, and one
original character that carries the personality so the layout and copy can stay
restrained.

It changes four things from FASE-3:

| FASE-3 (current) | This spec |
|---|---|
| Dark theme only | Night **and** light themes, user-toggleable, persisted |
| Accent = terminal green `#4ADE80` | Night accent yellow `#FACC15`; light accent ochre `#B7791F` |
| Centered single-column layout | Persistent left sidebar + content column |
| Abstract 3D point-cloud hero | Original character illustration ("the operator"), re-lit per theme |

Everything else from FASE-3 still binds: one accent per theme, monospace as a
semantic marker for every number/date/technical term, motion 150–300 ms with
`cubic-bezier(0.16, 1, 0.3, 1)`, `prefers-reduced-motion` honoured everywhere,
Lighthouse Accessibility 100, one `<h1>` per page, no heading-level skips,
bilingual `id` (default) / `en` with the locale prefix always in the URL.

---

## 2. Concept — "Ruang Kerja"

One original anime-styled character, **"the operator"** — an even-tempered figure
who reads as Ferry at a desk. Drawn once as a character sheet, then rendered into
two scenes:

| | Night — *build* | Light — *teach / write* |
|---|---|---|
| Treatment | Warm-yellow rim light on near-black; a slow ring of cryptographic keys rotating behind the figure (the JWKS key-rotation motif from FASE-3, made literal) | Ink-wash / risograph style, ochre spot colour; figure at a chalkboard beside a writing desk |
| Hero | Full illustration, right of the hero copy, below the fold of the first paint | Same composition, light treatment |
| Recurring | Small single-colour line-art glyph (bust of the character) in section headers | Same glyph, `fg-muted` |
| Full art also on | `not-found` page, guestbook empty state | Same |

The character is the only decorative element. Tech-stack items render as
**monochrome line glyphs**, never multi-colour brand logos (FASE-3 §Perkakas
rejects the "rainbow icon" look explicitly). No illustrated section backgrounds,
no per-project scene art.

### Motion

- Theme toggle: cross-fade tokens over 200 ms; the key-ring keeps its rotation
  phase across the switch (no restart).
- Key-ring: one rotation ≈ 40 s, `frameloop` on demand / pause when offscreen or
  tab hidden; **replaced by a static SVG when `prefers-reduced-motion`** or when
  the illustration is the non-WebGL fallback.
- Nav item hover/active, card hover: 150 ms colour only, no transforms that move
  text.

### Performance budget (unchanged from FASE-3)

- Initial JS < 150 KB gzip. Current baseline ~143.5 KB — **no new runtime
  dependency without measuring and reporting its cost.**
- Any animated/3D hero enhancement: ≤ 200 KB gzip additional, lazy, `ssr: false`,
  loaded after main content paints, static image fallback.
- If the hero enhancement drops mobile Lighthouse Performance below 90, the
  enhancement is dropped, not the threshold. The static illustration alone must
  satisfy the design.

---

## 3. Information architecture

### Sidebar (persistent)

Desktop ≥ 1024 px: fixed left rail, ~280 px. Below that: off-canvas drawer with a
hamburger trigger in a slim top bar; focus trap while open; closes on route
change, `Esc`, and backdrop click.

Contents, top to bottom:

1. Avatar + `Ferry Andhika Pratama` + role line (`Software Engineer · Guru Informatika`)
2. **Theme toggle** (night / light) and **language toggle** (`ID` / `EN`) on one row
3. Nav list (see below)
4. Footer: `© 2026 Ferry Andhika Pratama`

### Navigation

| Label (id) | Label (en) | Route (id) | Route (en) |
|---|---|---|---|
| Beranda | Home | `/id` | `/en` |
| Tentang | About | `/id/tentang` | `/en/about` |
| Karya | Work | `/id/karya` | `/en/work` |
| Riset | Research | `/id/riset` | `/en/research` |
| Pencapaian | Achievements | `/id/pencapaian` | `/en/achievements` |
| Buku Tamu | Guestbook | `/id/buku-tamu` | `/en/guestbook` |
| Kontak | Contact | `/id/kontak` | `/en/contact` |
| Links | Links | `/id/links` | `/en/links` |

Localised pathnames are configured in `src/i18n/routing.ts` (`pathnames` map).
Case-study slugs stay identical across locales (`siakad-informatika`,
`city-courier`, `mochitoon`) so links survive a language switch.

### Route inventory

```
/[locale]                          Beranda
/[locale]/tentang                  About
/[locale]/karya                    Work list (3 cards, image thumbnails)
/[locale]/karya/[slug]             Case-study detail — 8-part structure, Article JSON-LD
/[locale]/riset                    Research — JUTIF card, DOI, ScholarlyArticle JSON-LD
/[locale]/pencapaian               Achievements
/[locale]/buku-tamu                Guestbook — read-only shell now; D1 write path is FASE-4
/[locale]/kontak                   Contact
/[locale]/links                    Link hub
```

`sitemap.ts` and `robots.ts` generated. `hreflang` pairs every id/en route.

### Beranda section order

1. **Hero** — name, one-line thesis, the operator illustration (theme-lit).
2. **Benang merah** — "Saya membangun perangkat lunak untuk pekerjaan yang saya
   jalani sendiri" + three pillar cards: **Guru** · **Penulis** · **Peneliti**,
   each with an original line icon.
3. **Karya terpilih** — three image cards (see §5).
4. **Riset** — JUTIF SINTA 2 card, clickable DOI.
5. **Kontak** — email + primary links.

---

## 4. Design tokens

Delivered as CSS custom properties on `:root` (light) and `:root[data-theme="night"]`
(night is the **default** — set `data-theme="night"` on `<html>` server-side, flip
to `"light"` on user choice). No component may hardcode a hex value; colours come
only from `var(--color-*)`. A Vitest test asserts `globals.css` contains both full
token sets and that no `.tsx` under `src/` contains a `#rrggbb` literal.

### Night — black + yellow (default)

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#0A0A0B` | page |
| `--color-surface` | `#131316` | cards, sidebar |
| `--color-surface-2` | `#1B1B1F` | nested surfaces, hover |
| `--color-border` | `#26262B` | hairlines |
| `--color-fg` | `#EDEDEF` | primary text |
| `--color-fg-muted` | `#9B9BA3` | secondary text |
| `--color-accent` | `#FACC15` | the one accent |
| `--color-accent-dim` | `#FACC1522` | accent wash / active nav bg |
| `--color-ring` | `#FACC15` | focus outline |

### Light — warm paper & ink

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#F7F3EC` | page |
| `--color-surface` | `#EFE9DE` | cards, sidebar |
| `--color-surface-2` | `#E7DFD1` | nested surfaces, hover |
| `--color-border` | `#DED4C2` | hairlines |
| `--color-fg` | `#2B2925` | primary text |
| `--color-fg-muted` | `#6B6459` | secondary text |
| `--color-accent` | `#B7791F` | the one accent |
| `--color-accent-dim` | `#B7791F1F` | accent wash / active nav bg |
| `--color-ring` | `#B7791F` | focus outline |

### Contrast (must verify in Figma and in the build)

| Pair | Night | Light | Min |
|---|---|---|---|
| fg on bg | 16.9 : 1 | ~12 : 1 | 7 : 1 |
| fg-muted on bg | ~7 : 1 | ~5.3 : 1 | 4.5 : 1 |
| accent on bg | ~11 : 1 | ~5.1 : 1 | 4.5 : 1 |
| fg on accent | — (accent is a marker, rarely a fill) | ≥ 4.5 : 1 for any text on `accent-dim` | 4.5 : 1 |

### Type

| Role | Family | Notes |
|---|---|---|
| Display / headings | Inter Tight (`--font-inter-tight`) | tight tracking at ≥ 24 px |
| Body | Inter (`--font-inter`) | 16 px base, 1.6 line-height |
| Data / code / labels | JetBrains Mono (`--font-jetbrains-mono`) | every number, date, file size, tech term, DOI |

Scale (px): 12, 14, 16, 18, 20, 24, 32, 44. Weights: 400 / 500 / 600.

### Spacing & radius

Space step 4 px: `4 8 12 16 24 32 48 64 96`. Radius: `4` (tags), `8` (buttons,
inputs), `12` (cards), `16` (image cards, modals). Border width 1 px everywhere.

---

## 5. "Karya terpilih" — image thumbnails

Each card: 16:10 image, title, one-line tagline, year (mono), stack tags,
`Kunjungi aplikasi` / `Visit application` link when a live URL exists. Images are
stored in `public/karya/` at 2× (1200×750) as WebP, `next/image` with an explicit
`sizes`, `loading="lazy"` except the first card.

| Project | Image source | Treatment |
|---|---|---|
| **SIAKAD Informatika** | Live-site screenshot of `https://jurnal-mengajar-blond.vercel.app/` (confirmed), captured at 1440×900, cropped to 16:10 | Framed in a consistent browser-chrome mock |
| **City Courier** | Export the scooter-key + magnifying-glass illustrations from the City Courier Figma file `wY01agep1Pyz0cpVlVEszO`, page "Asset" (node `2007:737`) | Composited on a flat `surface` panel — no live app screenshot exists (public-record constraint) |
| **MochiToon** | Live-site screenshot — **URL still needed from Ferry**; blocks only this one asset | Same browser-chrome mock as SIAKAD |

Every image needs a meaningful `alt` in both locales.

**Open item:** MochiToon live URL. Not in the repo. The plan's screenshot task is
blocked until Ferry provides it; the rest of the plan proceeds.

---

## 6. Figma deliverable — exactly 3 pages

File: `0bLl0krxjy0mofkU4vCSe5` (currently only a cover page — effectively a fresh
build). Delete nothing that's referenced; the cover frame may stay or be folded
into page 1.

### Page 1 — Design System

- Both token sets rendered as labelled swatch rows, night and light side by side.
- Type specimen: the full scale in all three families, with a caption showing
  where mono is mandatory.
- Spacing and radius reference.
- Components (each as a Figma component with variants):
  `Sidebar`, `Nav Item` (default / active / hover), `Theme Toggle`,
  `Lang Toggle`, `Button` (primary / secondary / ghost / link),
  `Tag`, `Image Card` (karya), `Research Card`, `Contact Row`,
  `Pillar Card` ×3 (Guru / Penulis / Peneliti, each with its line icon).
- The operator character sheet + the section-header glyph.

### Page 2 — Portfolio · Night

Desktop 1440-wide frames: Beranda, Tentang, Karya (list), one Karya detail
(`city-courier`), Riset, Buku Tamu. Real image cards in "Karya terpilih".
Black + yellow tokens throughout. No layer outside its frame, no placeholder
text, no font outside the three families.

### Page 3 — Portfolio · Light

The same six frames, warm-paper tokens. Character re-lit to the light treatment.

QA gate for pages 2–3 (from the old `design-qa.md`, kept): no out-of-frame
layers, no empty text, interactive targets ≥ 24 px, no broken variable aliases,
no hardcoded solid paint where a token exists.

---

## 7. Assets — generation pipeline

"From our own generation" — no template icon packs, no stock art.

1. **Canva AI** (`mcp__claude_ai_Canva__generate-design` / `generate-design-structured`):
   - operator character sheet (front + 3/4, neutral palette for later re-lighting)
   - hero scene — night treatment
   - hero scene — light treatment
   - one project-illustration style frame (defines how City Courier art is composited)
2. **Figma vector polish**: import the Canva raster, trace/clean the character
   line glyph, place on the Design System page.
3. **Icon set — drawn as vectors in Figma**, 24×24 grid, 1.5 px stroke,
   single-colour (`currentColor`):
   - nav: home, about, work, research, achievements, guestbook, contact, links
   - pillars: build (bracket + wrench), teach (chalkboard), secure (rotating key)
   - toggles: sun / moon, `ID` / `EN` text pills
   - tech marks: monochrome line versions of Next.js, React, Supabase, Tailwind,
     TypeScript, Flutter, Laravel, Vite, Tiptap, GSAP
4. Export: icons as an inline SVG sprite for the app; character + hero as WebP in
   `public/`; City Courier composite as WebP in `public/karya/`.

---

## 8. Code — full sidebar rebuild

Executed from the implementation plan (next document), task-by-task, delegating
transcription-heavy tasks to `codex` / `opencode`. Next.js 16 conventions:
`proxy.ts` not `middleware.ts`; read `node_modules/next/dist/docs/` before writing
Next-specific code.

### File-level shape

| File | Responsibility |
|---|---|
| `src/app/globals.css` | Both token sets, `data-theme` switch, base styles |
| `src/app/[locale]/layout.tsx` | Sidebar + content shell, theme `<script>` (pre-paint, no flash), `<html data-theme>` |
| `src/components/sidebar.tsx` | Rail + mobile drawer, focus trap |
| `src/components/nav.tsx` + `nav-item.tsx` | Nav list, active state via `usePathname` (locale-aware) |
| `src/components/theme-toggle.tsx` | `data-theme` + `localStorage`, respects `prefers-color-scheme` on first visit |
| `src/components/locale-switcher.tsx` | Swap locale, keep current pathname |
| `src/components/image-card.tsx` | Karya card with `next/image` |
| `src/components/pillar-card.tsx` | Guru / Penulis / Peneliti |
| `src/components/research-card.tsx` | JUTIF card |
| `src/components/icon.tsx` | SVG sprite reference |
| `src/components/hero.tsx` | Copy + operator illustration; optional lazy key-ring enhancement, `ssr:false` |
| `src/app/[locale]/tentang|karya|riset|pencapaian|buku-tamu|kontak|links/page.tsx` | Route pages |
| `src/app/[locale]/karya/[slug]/page.tsx` | Case-study detail, 8-part body |
| `src/content/case-studies/*.ts` | Per-project content, both locales, 8-part |
| `src/lib/jsonld.ts` | + `buildCaseStudyArticleSchema()` |
| `src/lib/theme.ts` | Theme constants, the pre-paint script string |
| `messages/{id,en}.json` | Expanded: nav, every page's copy |
| `scripts/check-bundle-size.mjs` | CI budget gate (from FASE-3 plan, still pending) |

### Testing (TDD, red first)

- **Vitest:** token completeness in `globals.css`; no hex literal in any `src/**/*.tsx`;
  `NavItem` active state; `ThemeToggle` reducer (night ↔ light, persistence);
  `localeSwitcher` keeps pathname; `ImageCard` renders alt + link from props;
  `buildCaseStudyArticleSchema` shape; message-file parity id↔en per key.
- **Playwright:** sidebar visible desktop / drawer mobile; theme toggle flips
  `data-theme` and survives reload; no theme flash on load (check computed bg
  before first paint via `addInitScript` probe); language switch preserves page;
  all 3 case studies reachable from `/karya`; keyboard reaches every nav link,
  focus ring visible; `prefers-reduced-motion` disables the key-ring; no CLS when
  the hero illustration loads.

### Binding thresholds (from FASE-3)

Lighthouse Performance (mobile) ≥ 90 · Accessibility **100** · LCP < 2.5 s ·
CLS < 0.1 · initial JS < 150 KB gzip · hero enhancement < 200 KB gzip.

---

## 9. Delegation

| Owner | Work |
|---|---|
| Claude (this session) | Figma build (all 3 pages), Canva generation, live-site screenshots, spec + plan, review of delegated work |
| `codex` / `opencode` (headless, driven from here) | Token CSS, sidebar + toggles, route pages, image card, JSON-LD extension, message-file expansion, tests, CI gate — the transcription-heavy tasks where the plan carries the full code |

Workspace is left intact after completion (no teardown) so context persists.

---

## 10. Open items

1. **MochiToon live URL** — blocks the MochiToon thumbnail only.
2. Guestbook write path (D1, rate limiting) is out of scope here — FASE-4.
3. Optional key-ring WebGL enhancement is a stretch; the static illustration is
   the committed deliverable.
