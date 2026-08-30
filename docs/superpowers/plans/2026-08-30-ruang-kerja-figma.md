# "Ruang Kerja" Figma Revision — Implementation Plan (Plan A of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.
>
> **This plan REVISES an existing, complete Figma design in place.** It does not build from scratch. The site code rebuild is **Plan B**, written after this Figma output is approved.

**Goal:** Retheme the existing portfolio Figma from dark/terminal-green to a two-mode system (night = black + yellow; light = warm paper & ink), replace template-sourced 3D icons with our own generated assets, introduce the "Ruang Kerja" operator character, turn "Karya terpilih" into real image cards, and collapse the file from 7 pages to 3.

**Architecture:** Work through the Figma MCP (`mcp__claude_ai_Figma__use_figma` — JS via the Plugin API) and Canva MCP. The file already has a 3-tier variable system (`Primitives` → `Color` semantic aliases → `Spacing & Radius`) and 9 token-bound desktop screens, so most of the night retheme is: add yellow/paper primitives, retarget the `Color` aliases, and add a `Light` mode — the screens follow. Then layer on assets, the character, image cards, a duplicated light page, and a page cleanup.

**Tech Stack:** Figma Plugin API via `use_figma`, Canva MCP, `claude-in-chrome` for screenshots. No app code in this plan.

**Spec:** `docs/superpowers/specs/2026-08-30-ruang-kerja-design.md` (read it and `docs/spec/FASE-3-Spec-Arsitektur.md` first)

---

## Starting state (verified 2026-08-30 via the Plugin API)

**File:** `0bLl0krxjy0mofkU4vCSe5`. **7 pages:**

| Page | id | Contents |
|---|---|---|
| `00 · Cover` | `0:1` | 1 cover frame `3:8` |
| `01 · Getting Started` | `3:2` | 1 doc frame |
| `02 · Foundations` | `3:3` | `Foundations / Documentation` `4:21` — color tokens, typography, spacing sections |
| `——— COMPONENTS ———` | `3:4` | empty divider |
| `03 · Components` | `3:5` | `Components / Library` `5:2` (1440×1800) — Build/Teach/Secure **3D icons**, Button, Nav Item, Tag |
| `——— SCREENS ———` | `3:6` | empty divider |
| `04 · Website Screens` | `3:7` | 9 desktop frames, 1440×1800, laid left→right at x = 0, 1600, 3200, … |

**9 screens:** `Desktop / 01 Beranda` `7:2` · `02 Tentang` `9:19` · `03 Karya` `9:243` · `04 Detail Karya · SIAKAD` `9:473` · `05 Riset` `9:704` · `06 Pencapaian` `9:935` · `07 Buku Tamu` `9:1159` · `08 Kontak` `9:1386` · `09 Links & Login` `9:1616`.

**Variable collections:**

- `Primitives` (`VariableCollectionId:2:2`, mode `Value`): `ink/950` #0A0A0B · `ink/900` #131316 · `ink/700` #26262B · `ink/400` #9B9BA3 · `paper/100` #EDEDEF · `green/400` #4ADE80 · `green/400-alpha-13` · `amber/500` #F59E0B
- `Color` (`VariableCollectionId:2:3`, **single mode `Dark`**): 9 semantic vars, all `VARIABLE_ALIAS` into Primitives — `color/bg`→ink/950 · `color/surface`→ink/900 · `color/border`→ink/700 · `color/text/primary`→paper/100 · `color/text/muted`→ink/400 · `color/accent`→green/400 · `color/accent/subtle`→green/400-alpha-13 · `color/warning`→amber/500 · `color/text/on-accent`→ink/950
- `Spacing & Radius` (`VariableCollectionId:2:4`, mode `Value`): `spacing/2xs..3xl` = 4,8,12,16,24,32,48,64 · `radius/sm..full` = 4,8,12,16,999

**Text styles (11):** `Display/Hero` Inter Bold 64/72 · `Heading/H1` Inter Bold 48/56 · `Heading/H2` Inter SemiBold 36/44 · `Heading/H3` Inter SemiBold 24/32 · `Heading/H4` Inter SemiBold 18/26 · `Body/Large` 18/28 · `Body/Medium` 16/24 · `Body/Small` 14/21 · `Label/Medium` Inter Medium 12/16 · `Mono/Small` JetBrains Mono 11/16 · `Mono/Medium` JetBrains Mono Medium 13/20.

**Effect styles (2):** `Shadow/Subtle`, `Glow/Accent Subtle` (both drop shadows).

**Components:** `Button` set `6:11` (Style=Primary|Secondary × State=Default|Hover) · `Nav Item` set `6:18` (State=Default|Active) · `Tag` `6:19`.

**What's missing vs the spec:** a `Light` mode; yellow accent; our own (non-3D-pack) icons; the operator character + hero art; image thumbnails in "Karya terpilih" (currently text tables); Inter Tight for display type; 3 pages instead of 7.

**Baseline screenshots:** saved to `assets/qa/before/` in Task 0.

---

## Global Constraints

- **File:** `0bLl0krxjy0mofkU4vCSe5`. End state: **exactly 3 pages** — `Design System`, `Portfolio · Night`, `Portfolio · Light`.
- **Keep the good bones:** do not rebuild the 9 screens, the variable architecture, the components, or the text-style set. Revise them.
- **No raw hex** on any fill/stroke where a token exists — bind to a `Color/*` variable.
- **Fonts:** only Inter Tight (display), Inter (body), JetBrains Mono (data). Nothing else. (Inter Tight styles in the API are `"Semi Bold"`, `"Extra Bold"` — two words.)
- **Mono is semantic:** every number, date, size, year, DOI, technical term in JetBrains Mono.
- **Night is the default `Color` mode.**
- **Night tokens (resolved):** bg #0A0A0B · surface #131316 · surface-2 #1B1B1F · border #26262B · fg #EDEDEF · fg-muted #9B9BA3 · accent **#FACC15** · accent-subtle #FACC15 @13% · text-on-accent #0A0A0B · warning #F59E0B.
- **Light tokens (resolved):** bg #F7F3EC · surface #EFE9DE · surface-2 #E7DFD1 · border #DED4C2 · fg #2B2925 · fg-muted #6B6459 · accent **#B7791F** · accent-subtle #B7791F @12% · text-on-accent #F7F3EC · warning #B7791F.
- **Type scale (px):** 12,14,16,18,20,24,32,44,64. Weights 400/500/600.
- **Spacing (px):** 4,8,12,16,24,32,48,64,96. **Radius:** 4/8/12/16 + full. Border 1.
- **Contrast minimums:** fg on bg ≥ 7:1 · fg-muted on bg ≥ 4.5:1 · accent on bg ≥ 4.5:1 · text-on-accent on accent ≥ 4.5:1.
- **Interactive targets ≥ 24 px.** Desktop frames 1440 wide. Sidebar rail ~280 px.
- **Assets are ours:** no template icon packs, no stock art. Canva-generated or Figma-drawn only. The existing grey 3D Build/Teach/Secure icons are replaced.
- **Motion belongs in frame descriptions, not prototypes:** theme cross-fade 200 ms; key-ring 40 s/rotation, static under `prefers-reduced-motion`.
- **Nav (id → en):** Beranda→Home, Tentang→About, Karya→Work, Riset→Research, Pencapaian→Achievements, Buku Tamu→Guestbook, Kontak→Contact, Links→Links.
- **Case-study slugs:** `siakad-informatika`, `city-courier`, `mochitoon`.
- **City Courier art source:** file `wY01agep1Pyz0cpVlVEszO`, page `Asset`, frame `2007:737` (scooter-shaped key, courier-with-magnifier, logo, hand-truck…).
- **SIAKAD live URL:** `https://jurnal-mengajar-blond.vercel.app/`. **MochiToon live URL:** `https://manga-studio-one.vercel.app/` (both provided).

### Required skills for executors

- Before every `use_figma` call: the **`figma-use`** skill is loaded (pass `skillNames: "resource:figma-use"`).
- Before building/altering components (Task 6, 7, 13): also load **`figma-generate-library`**.
- For screenshots (Task 8): load **`claude-in-chrome`**, then `mcp__claude-in-chrome__*`.
- `use_figma` rules that bite here: colours are 0–1 range; `await figma.setCurrentPageAsync(page)` (never the sync setter); at most one page switch per call — **fan multi-page work out as parallel `use_figma` calls**; load a node's current fonts before mutating its text; return all created/mutated node IDs; ≤ ~10 logical ops per call.

### Per-task verification protocol

Each task ends with: (1) a read-only `use_figma` or `get_metadata` confirming structure, (2) `get_screenshot` (maxDimension 1440) or inline `node.screenshot()` confirming appearance, (3) its explicit acceptance checks. Record new node/variable IDs in `figma-portfolio-state.json` (gitignored) for later tasks.

---

## Task 0: Baseline capture

**Files:** Create `assets/qa/before/*.png`

- [ ] **Step 1:** `get_screenshot` (maxDimension 1440) of: `Components / Library` `5:2`, `Foundations / Documentation` `4:21`, and all 9 screens (`7:2`, `9:19`, `9:243`, `9:473`, `9:704`, `9:935`, `9:1159`, `9:1386`, `9:1616`).
- [ ] **Step 2:** `curl` each URL to `assets/qa/before/<name>.png`.
- [ ] **Step 3:** Acceptance: 11 PNGs on disk, each a real render.

---

## Task 1: Primitives — add yellow and warm-paper values

**Figma:** collection `Primitives` (`VariableCollectionId:2:2`)

**Interfaces:**
- Produces: new primitive variable IDs consumed by Task 2. Names below are exact.

- [ ] **Step 1: Add night-accent + light primitives**

`use_figma` (skillNames `resource:figma-use`): in `Primitives`, create COLOR variables with `scopes: ["ALL_SCOPES"]` disabled → set `scopes: []` then rely on semantic layer; values in 0–1:
  - `sun/400` = #FACC15 → `{r:0.980, g:0.800, b:0.082}`
  - `sun/400-alpha-13` = #FACC15 @ 0.13 alpha (paint opacity 0.13, color same)
  - `sand/50` = #F7F3EC → `{r:0.969, g:0.953, b:0.925}`
  - `sand/100` = #EFE9DE → `{r:0.937, g:0.914, b:0.871}`
  - `sand/200` = #E7DFD1 → `{r:0.906, g:0.874, b:0.820}`
  - `sand/300` = #DED4C2 → `{r:0.871, g:0.831, b:0.761}`
  - `bark/900` = #2B2925 → `{r:0.169, g:0.161, b:0.145}`
  - `bark/500` = #6B6459 → `{r:0.420, g:0.392, b:0.349}`
  - `ochre/600` = #B7791F → `{r:0.718, g:0.475, b:0.122}`
  - `ochre/600-alpha-12` = #B7791F @ 0.12 alpha
  - `ink/850` = #1B1B1F → `{r:0.106, g:0.106, b:0.122}` (night surface-2)
Return the created variable IDs.

- [ ] **Step 2: Verify**

Read `Primitives` back (`getVariableByIdAsync` per id). Acceptance: 11 new variables, names exact, resolved values within ±0.003 of the targets, alpha variables carry 0.13 / 0.12 opacity.

- [ ] **Step 3:** Record IDs in `figma-portfolio-state.json`.

---

## Task 2: Color collection — rename mode, add Light, retarget aliases

**Figma:** collection `Color` (`VariableCollectionId:2:3`)

**Interfaces:**
- Consumes: primitive IDs from Task 1 + existing `ink/*`, `paper/*`, `amber/500`.
- Produces: `Color` with modes `Night` (default) and `Light`, 10 semantic vars each aliased.

- [ ] **Step 1: Rename the mode and add `Light`**

`use_figma`: `collection.renameMode(collection.modes[0].modeId, 'Night')`; `collection.addMode('Light')`. Return both modeIds.

- [ ] **Step 2: Add `color/surface-2` variable**

Create `color/surface-2` in `Color` (the screens use a nested-surface tone; add the token so it isn't hardcoded).

- [ ] **Step 3: Set Night-mode aliases**

For the Night modeId, `setValueForMode` to `{type:'VARIABLE_ALIAS', id: <primitive>}`:
  bg→ink/950 · surface→ink/900 · surface-2→ink/850 · border→ink/700 · text/primary→paper/100 · text/muted→ink/400 · accent→**sun/400** · accent/subtle→**sun/400-alpha-13** · warning→amber/500 · text/on-accent→ink/950.

- [ ] **Step 4: Set Light-mode aliases**

For the Light modeId:
  bg→sand/50 · surface→sand/100 · surface-2→sand/200 · border→sand/300 · text/primary→bark/900 · text/muted→bark/500 · accent→**ochre/600** · accent/subtle→**ochre/600-alpha-12** · warning→ochre/600 · text/on-accent→sand/50.

- [ ] **Step 5: Verify**

Read `Color` back, resolving both modes. Acceptance: modes are exactly `['Night','Light']`; Night default; all 10 vars resolve to the Global-Constraints hexes in each mode; every value is an alias (no raw paint).

- [ ] **Step 6:** Record modeIds + the surface-2 var ID.

---

## Task 3: Spacing + text styles

**Figma:** collection `Spacing & Radius`; the 11 text styles

- [ ] **Step 1: Add `spacing/4xl` = 96** to `Spacing & Radius`.

- [ ] **Step 2: Switch display type to Inter Tight**

`use_figma`: `await figma.loadFontAsync({family:'Inter Tight', style:'Semi Bold'})` and `{style:'Medium'}`. Then for styles `Display/Hero`, `Heading/H1`, `Heading/H2`, `Heading/H3`, `Heading/H4`: set `fontName` family to `Inter Tight` (Display/Hero + H1 → `Semi Bold`; H2–H4 keep `Semi Bold`). Keep sizes; set `Display/Hero` size 64, add tracking -1%. Leave `Body/*`, `Label/*`, `Mono/*` on Inter / JetBrains Mono.

- [ ] **Step 3: Fix mono + add label style**

Set `Mono/Small` size 12 (was 11). Create `Mono/Label` — JetBrains Mono Medium 12/16, letterSpacing +2%, name it so screens can adopt it for eyebrows.

- [ ] **Step 4: Verify**

List text styles. Acceptance: 5 display/heading styles are `Inter Tight`; no style uses a 4th family; `Mono/Small` is 12; `Mono/Label` exists; `spacing/4xl` = 96.

- [ ] **Step 5: Screenshot** a screen that uses Display/Hero (`get_screenshot 7:2`) — headline now renders in Inter Tight, no layout break.

---

## Task 4: Canva — operator character sheet

**Files:** `assets/source/operator-sheet.png` (gitignored)

- [ ] **Step 1:** `mcp__claude_ai_Canva__generate-design` — prompt: *"Character reference sheet, one even-tempered adult software engineer, anime-influenced but restrained line art, front + 3/4 views + a bust crop, calm expression, plain crewneck, no logos, neutral grey palette for later re-colouring, plain background, clean vector-friendly linework."*
- [ ] **Step 2:** `get-export-formats` → `export-design` PNG 2× → download to the path.
- [ ] **Step 3:** Acceptance: one consistent character; neutral greys; no text/logo; traceable linework. Up to 3 regens, else keep best + note the gap.

---

## Task 5: Canva — hero scenes, night + light

**Files:** `assets/source/hero-night.png`, `assets/source/hero-light.png`

- [ ] **Step 1: Night** — *"Same character as reference. Seated at a terminal in a near-black room (#0A0A0B), lit only by warm yellow rim light (#FACC15). Behind the figure, a slow ring of stylised cryptographic keys in a circle. Left third of the canvas kept clear for headline text. High-contrast, restrained, not busy."*
- [ ] **Step 2: Light** — *"Same character and composition. Warm paper background (#F7F3EC), ink-wash / risograph treatment, single ochre spot colour (#B7791F). Figure at a chalkboard beside a writing desk. Left third clear."*
- [ ] **Step 3:** Export both PNG 2×, download.
- [ ] **Step 4:** Acceptance per image: character matches the sheet; palette matches the theme (sample pixels); left third uncluttered; night shows the key ring; no baked-in text.

---

## Task 6: Figma vectors — replace the 3D pillar icons + draw nav/toggle icons

**Figma:** `03 · Components` page for now (moves to `Design System` in Task 13)

**Interfaces:**
- Produces: components `Icon/*` (24×24, 1.5 px stroke bound to `color/text/primary`), used by the screens (Task 9) and Sidebar.

- [ ] **Step 1: Pillar icons**

Load `figma-generate-library`. `use_figma`: create `Icon/build` (angle brackets + wrench), `Icon/teach` (chalkboard), `Icon/secure` (key inside a circular arrow) — 24×24 component each, 1.5 px stroke, round caps, stroke bound to `Color/text/primary`, transparent fill.

- [ ] **Step 2: Nav + toggle icons**

`use_figma`: `Icon/home`, `Icon/about`, `Icon/work`, `Icon/research`, `Icon/achievements`, `Icon/guestbook`, `Icon/contact`, `Icon/links`, `Icon/sun`, `Icon/moon`. Same spec.

- [ ] **Step 3: Verify**

`get_screenshot` of the icon set. Acceptance: 13 icons, uniform 1.5 px stroke on the 24 grid, single-colour, distinct, legible at 24 px. Old grey 3D `Build/Teach/Secure` raster nodes still present (removed in Task 9 once the screens are swapped).

---

## Task 7: Figma vectors — tech marks + character glyph

**Figma:** `03 · Components` page

**Interfaces:**
- Produces: `TechMark/*` (20 px, single-colour line, stroke `color/text/muted`) and `Glyph/operator` (~32 px line bust).

- [ ] **Step 1: Tech marks** — `TechMark/nextjs, react, supabase, tailwind, typescript, flutter, laravel, vite, tiptap, gsap`. Geometric single-colour interpretations, no brand colours, no gradients.
- [ ] **Step 2: Character glyph** — trace the bust crop from `operator-sheet.png` (import via `upload_assets` as reference, place, hand-simplify to a component `Glyph/operator`, stroke `color/text/muted`).
- [ ] **Step 3: Verify** `get_screenshot`. Acceptance: 10 tech marks, all mono; `Glyph/operator` recognisably the reference character.

---

## Task 8: Live screenshots + City Courier export

**Files:** `assets/source/shot-siakad.png`, `assets/source/shot-mochitoon.png`, `assets/source/citycourier/*.png`

- [ ] **Step 1:** Load `claude-in-chrome`. `tabs_create_mcp` → `navigate` `https://jurnal-mengajar-blond.vercel.app/` → wait → `computer` screenshot 1440×900 → `assets/source/shot-siakad.png`.
- [ ] **Step 2:** Same for `https://manga-studio-one.vercel.app/` → `assets/source/shot-mochitoon.png`.
- [ ] **Step 3:** From file `wY01agep1Pyz0cpVlVEszO`: `get_screenshot` (or `download_assets`) of node `2007:737` and children — the scooter-key rounded-rect, `2007:738` (logo), `2031:2735` (magnifier). `curl` to `assets/source/citycourier/`.
- [ ] **Step 4:** Acceptance: SIAKAD + MochiToon are real app renders (not error pages); City Courier exports include the scooter-key and the logo.

---

## Task 9: Night screens — recolour audit + icon swap

**Figma:** page `04 · Website Screens`, all 9 frames

- [ ] **Step 1: Mode check**

`use_figma`: for each of the 9 frames, ensure the frame (or its top container) has `setExplicitVariableModeForCollection(Color, NightModeId)`. Return which frames were already correct vs set.

- [ ] **Step 2: Hardcoded-fill sweep**

`use_figma` read-only: `page.findAll(n => (n.fills && n.fills.some?.(f => f.type==='SOLID' && !f.boundVariables?.color)))` — list every node with a raw solid fill that matches a token hex (esp. the old green `#4ADE80`). Return the list with node IDs + names.

- [ ] **Step 3: Bind them**

`use_figma` (batched ≤10 nodes/call, fan out if needed): rebind each listed fill to the right `Color/*` variable via `setBoundVariableForPaint` (capture the returned paint, reassign the array).

- [ ] **Step 4: Swap pillar icons**

On `Beranda` `7:2` (and any other screen using them), replace the three grey 3D `Build/Teach/Secure` image nodes with instances of `Icon/build|teach|secure` at 32 px, colour `Color/accent`. Delete the orphaned raster nodes and their source components on `03 · Components`.

- [ ] **Step 5: Verify**

`get_screenshot` of `Beranda`, `Karya`, `Riset`, `Buku Tamu`. Acceptance: accent reads yellow everywhere; no green remains; pillar icons are the new line set; no broken layout; Step 2 re-run returns an empty list.

---

## Task 10: Beranda — hero illustration, character glyph, Inter Tight headline

**Figma:** `Desktop / 01 Beranda` `7:2`

- [ ] **Step 1: Hero art**

`upload_assets` `assets/source/hero-night.png` into the file; place it in the Beranda hero region, right of the headline block, ~520 wide, within the frame. Add a frame description: *"Key-ring rotates 40 s/turn; static SVG under prefers-reduced-motion; theme cross-fade 200 ms."*

- [ ] **Step 2: Headline**

Confirm the `Ferry Andhika Pratama` headline now uses `Display/Hero` (Inter Tight after Task 3). Adjust its container width so the hero art doesn't overlap the text.

- [ ] **Step 3: Section glyphs**

Add a `Glyph/operator` instance (~28 px, `Color/text/muted`) left of each section heading on Beranda (`Karya terpilih`, `Riset & publikasi`, the contact CTA).

- [ ] **Step 4: Verify**

`get_screenshot 7:2`. Acceptance: hero art occupies the right third, headline unobstructed and in Inter Tight; glyphs aligned to section headings; heading order still H-level clean; every year/number still Mono.

---

## Task 11: "Karya terpilih" → image cards (Beranda, Karya list, Detail figure)

**Figma:** `7:2` (Beranda karya section), `9:243` (Karya list), `9:473` (Detail Karya · SIAKAD)

**Interfaces:**
- Consumes: Task 8 assets. Produces: an `Image Card` component reused across the three screens.

- [ ] **Step 1: Build the composites**

`use_figma`: create a `Browser Mock` frame (16:10, radius 12, 1 px `Color/border`, a 3-dot bar). Instances: SIAKAD → `shot-siakad.png`; MochiToon → `shot-mochitoon.png`; City Courier → compose the scooter-key + logo on a flat `Color/surface` panel at 16:10.

- [ ] **Step 2: Image Card component**

Create component `Image Card`: radius 16, clip, `Color/surface`, 1 px border. Top: the 16:10 image slot. Body padding 24 / gap 12: title `Heading/H3`, tagline `Body/Small` muted, year `Mono/Small`, a wrap row of `Tag` instances, a link button `Kunjungi aplikasi`.

- [ ] **Step 3: Replace the text tables**

On Beranda, replace the three `Peran/Masalah/Kontribusi/Dampak` table rows with three `Image Card` instances (SIAKAD, City Courier, MochiToon; taglines + stacks from `docs/spec/FASE-2`). Do the same on the `03 Karya` list screen. On `04 Detail Karya · SIAKAD`, put the SIAKAD composite in the screenshot `<figure>` slot.

- [ ] **Step 4: Verify**

`get_screenshot` of `7:2`, `9:243`, `9:473`. Acceptance: every card shows real art; alt-equivalent card titles present; no residual table text; cards are radius-16, images true 16:10.

---

## Task 12: Portfolio · Light — duplicate and re-mode

**Figma:** new page from a copy of `04 · Website Screens`

- [ ] **Step 1: Duplicate**

`use_figma`: `const p = screensPage.clone(); p.name = 'Portfolio · Light'`. (Or duplicate via API and rename.) Return the new page id and child ids.

- [ ] **Step 2: Set Light mode**

In a call scoped to the new page (`setCurrentPageAsync`), for every frame `setExplicitVariableModeForCollection(Color, LightModeId)`. Set page background to `Color/bg`.

- [ ] **Step 3: Swap hero + re-check glyphs**

Replace the hero image with `assets/source/hero-light.png`. Confirm `Glyph/operator` strokes read on warm paper (they bind to `Color/text/muted`, so they follow the mode — just verify visually). Remove any night-only raster that bled in.

- [ ] **Step 4: Verify**

`get_screenshot` of all 9 light frames. Acceptance: warm-paper bg throughout, ochre accent (not yellow), ink `#2B2925` text; fg on bg ≥ 7:1 and muted ≥ 4.5:1 (compute from resolved hexes); hero shows the light treatment; no near-black panels left.

---

## Task 13: Collapse to 3 pages

**Figma:** all pages

- [ ] **Step 1: Build `Design System`**

`use_figma`: create page `Design System`. Move (`appendChild`) into it, as stacked sections: the cover frame `3:8`; the Getting Started frame; `Foundations / Documentation` `4:21`; `Components / Library` `5:2`; and add an `Assets` section holding the `Icon/*`, `TechMark/*`, `Glyph/operator`, and the operator character sheet. Update the Foundations swatches to show **both** Night and Light columns and the new yellow/paper values.

- [ ] **Step 2: Rename the screens page**

`04 · Website Screens` → `Portfolio · Night`.

- [ ] **Step 3: Delete the leftovers**

Remove pages `00 · Cover`, `01 · Getting Started`, `02 · Foundations`, `——— COMPONENTS ———`, `03 · Components`, `——— SCREENS ———` — **only after** confirming their content was moved. `use_figma`: `page.remove()` per empty page.

- [ ] **Step 4: Verify**

`figma.root.children` → exactly `['Design System', 'Portfolio · Night', 'Portfolio · Light']`. `get_screenshot` of `Design System`. Acceptance: 3 pages; Design System shows foundations (both modes), components, and the assets section; nothing referenced was lost.

---

## Task 14: QA + hand-off

- [ ] **Step 1: Structural sweep** (per page, via `use_figma` read-only): no layer out of frame; no empty text; every text layer on one of the 3 families and a named style; every tokenisable fill/stroke is a variable alias; interactive elements ≥ 24 px; exactly 3 pages.
- [ ] **Step 2: Contrast table** — compute the 4 constraint ratios per theme from resolved hexes; all must pass. Record numbers.
- [ ] **Step 3: Screenshot bundle** — `get_screenshot` (1440) of Design System sections + all 9 Night frames + all 9 Light frames → `assets/qa/after/`.
- [ ] **Step 4: QA note** — `docs/superpowers/ruang-kerja-figma-qa.md`: before/after, pass list, contrast table, any deferred item.
- [ ] **Step 5: Present to Ferry** — post the before/after bundle + QA note, ask for sign-off. **Stop. Plan B (code) is written next.**

---

## Self-Review

**Spec coverage** (`2026-08-30-ruang-kerja-design.md`):

| Spec section | Task(s) |
|---|---|
| §2 character, two treatments, glyph | 4, 5, 7, 10, 12 |
| §2 motion (frame descriptions) | 10 step 1 |
| §3 sidebar IA / nav labels | already in file; icons added 6; verified 9–12 |
| §3 routes → screens | already 9 screens; Detail figure 11; Pencapaian/Kontak/Links screens already exist |
| §4 tokens — night + light, both modes | 1, 2 |
| §4 type scale, Inter Tight, mono rule | 3 |
| §4 contrast targets | 12 step 4, 14 step 2 |
| §5 image thumbnails — 3 sources | 8, 11 |
| §6 Figma 3 pages + component list | 13; components exist + Image Card 11 + Icon set 6 |
| §6 QA gate | 14 |
| §7 asset pipeline — Canva + Figma vectors + export, replace 3D icons | 4, 5, 6, 7, 8, 9 step 4 |
| §10 open items | MochiToon URL now provided; guestbook write path stays FASE-4; key-ring WebGL stays a stretch (static hero is the deliverable) |

**Placeholder scan:** no "TBD/TODO/handle appropriately". Every `use_figma` step names the exact nodes/values. Canva prompts are literal.

**Type / ID consistency:** node IDs (`7:2`, `9:19`, …, `6:11`, `6:18`, `6:19`, `4:21`, `5:2`) and collection IDs (`2:2/2:3/2:4`) are quoted verbatim from the verified starting state. Component names — `Icon/*`, `TechMark/*`, `Glyph/operator`, `Image Card`, `Browser Mock`, `Button`, `Nav Item`, `Tag` — are used identically throughout. Mode names `Night` / `Light` and page names `Design System` / `Portfolio · Night` / `Portfolio · Light` are consistent from Task 2 / Task 13 on.

---

## Execution Handoff

Figma/Canva MCP work — **inline execution in this session** (those tools and skills are only available here; subagents can't call them). `codex`/`opencode` have nothing to do until Plan B. After Task 14 sign-off, write **Plan B — the site code rebuild** as a full TDD plan against the approved frames, delegating its transcription-heavy tasks.
