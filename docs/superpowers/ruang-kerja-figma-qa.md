# "Ruang Kerja" Figma Revision — QA Note

**Date:** 2026-08-30
**Plan:** `docs/superpowers/plans/2026-08-30-ruang-kerja-figma.md`
**Figma file:** `0bLl0krxjy0mofkU4vCSe5` — [open](https://www.figma.com/design/0bLl0krxjy0mofkU4vCSe5)

## Starting point vs. now

The file began as a complete dark / terminal-green editorial design: 7 pages,
9 finished 1440-wide screens, a 3-tier variable system, a small component set.
This pass reskinned it to a two-theme system, replaced template assets with our
own, added the operator character, turned "Karya terpilih" into image cards, and
collapsed the file to 3 pages.

Baseline screenshots: `assets/qa/before/`. After: `assets/qa/after/`.

## What changed

| Area | Before | After |
|---|---|---|
| Pages | 7 (Cover, Getting Started, Foundations, Components, 9-screen deck, 2 dividers) | **3**: `Design System`, `Portfolio · Night`, `Portfolio · Light` |
| Colour modes | one, `Dark` | `Night` (default) + `Light`, on the existing `Color` collection |
| Accent | terminal green `#4ADE80` | night yellow `#FACC15` · light ochre `#8F5F18` |
| Light palette | — | warm paper & ink — bg `#F7F3EC`, surface `#EFE9DE`, ink `#2B2925` |
| Primitives | 8 | +11 (`sun/*`, `sand/*`, `bark/*`, `ochre/*`, `ink/850`) |
| `color/surface-2` | hardcoded per screen | new semantic token, aliased both modes |
| Spacing | 4–64 | + `spacing/4xl` = 96 |
| Text styles | 11 | 12 (+ `Mono/Label`; `Mono/Small` 11→12; Display/Hero & H1 tracking tightened) |
| Pillar icons | grey 3D renders (template-sourced) | **our own** vector line icons (`</>`, chalkboard, rotating key), bound to `color/accent` |
| Hero | text only | operator illustration — night: silhouette + glowing key-ring; light: same figure at a desk under an ochre disc |
| Karya terpilih | text tables | **image cards** — SIAKAD live screenshot, City Courier key-van art (from the City Courier Figma), MochiToon live screenshot |
| Sidebar theme label | "Tema: Dark" | "Tema: Night" / "Tema: Light" per page |

## Assets — all our own

- **Operator heroes** — generated with Canva AI (`hero-night.png`, `hero-light.png`), chosen for the from-behind silhouette so there's no AI-face uncanniness. The night key-ring is the JWKS "key rotation" motif from FASE-3, made literal; the light ochre disc rhymes with it.
- **Pillar icons** — hand-authored SVG, imported as editable Figma vectors. No icon pack.
- **City Courier art** — exported from the City Courier Figma file `wY01agep1Pyz0cpVlVEszO` (node `2007:737`) at 1200 px: the "City Courier" key-van and the magnifier-audit courier.
- **SIAKAD / MochiToon** — live-site screenshots (`jurnal-mengajar-blond.vercel.app`, `manga-studio-one.vercel.app`).

Raw assets live in `assets/source/` (gitignored). Production-optimized copies go in `public/` during Plan B.

## Checks

**Pages:** exactly 3, ordered Design System · Portfolio · Night · Portfolio · Light. ✓

**Hardcoded colour sweep (both screen pages):** 0 raw solid fills/strokes that should be tokens. Every fill is a variable alias. ✓ (The only literals introduced — the pillar-icon SVG strokes — were re-bound to `color/accent`.)

**Fonts:** Inter + JetBrains Mono only. Inter Tight (spec addition) is **not installed** in this Figma environment, so display type stays Inter — consistent with the file's own QA rule ("no font outside Inter and JetBrains Mono"). Deviation accepted.

**Contrast (resolved hexes, WCAG):**

| Pair | Night | Light | Min |
|---|---|---|---|
| fg on bg | `#EDEDEF`/`#0A0A0B` ≈ **17.3 : 1** | `#2B2925`/`#F7F3EC` ≈ **13.1 : 1** | 7 |
| fg-muted on bg | `#9B9BA3`/`#0A0A0B` ≈ **6.9 : 1** | `#6B6459`/`#F7F3EC` ≈ **5.2 : 1** | 4.5 |
| accent on bg | `#FACC15`/`#0A0A0B` ≈ **12.5 : 1** | `#8F5F18`/`#F7F3EC` ≈ **4.9 : 1** | 4.5 |
| text-on-accent on accent | `#0A0A0B`/`#FACC15` ≈ **12.5 : 1** | `#F7F3EC`/`#8F5F18` ≈ **4.9 : 1** | 4.5 |

Light ochre was darkened from `#B7791F` (3.4 : 1 — failed) to `#8F5F18` to pass AA both directions.

## Deferred / notes

1. **Karya list screen (`03 Karya`) and the case-study detail figure** still show text-only rows on both themes. Thumbnails were applied to **Beranda** only (the showcase screen). Adding them to the list + detail screens is a straightforward follow-up for visual consistency.
2. **Foundations doc frame** on the Design System page still renders the pre-retheme swatch chips (green, dark-only). The *live variable values* are correct and verified; the documentation art hasn't been re-drawn. Follow-up.
3. **Light hero crop** — the portrait hero art in the 440×300 panel favours the ochre disc over the figure. Repositioning the image-fill offset would show more of the character.
4. **Nav icons** — deliberately not added; the numbered nav (01–08) is an existing editorial choice that reads well.
5. Guestbook write path / rate limiting stays out of scope (FASE-4). Key-ring WebGL animation stays a Plan-B stretch; the static hero is the committed deliverable.

## Status

Night + Light systems are coherent and token-driven; Beranda is fully realised on
both themes; the file is down to 3 pages. Ready for Ferry's review before Plan B
(the site code rebuild).
