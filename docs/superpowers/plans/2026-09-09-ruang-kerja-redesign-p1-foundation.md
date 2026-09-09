# Ruang Kerja Redesign — Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the design foundation — retuned theme tokens, the single type family, the centred shell, the completed "personal rail", the icon nav, and the two new icons — so every later phase builds pages on a settled base.

**Architecture:** Build on the uncommitted redesign WIP already in this worktree (codex's start: `fonts.ts`, `layout.tsx`, `sidebar.tsx`, `nav.tsx`, `nav-item.tsx`, `global-not-found.tsx`, `pillar-card.tsx`, `page.tsx`, plus matching test edits). Task 1 commits only the foundation-relevant subset; `page.tsx` and `pillar-card.tsx` stay uncommitted for Phase 3/5. Later tasks retune tokens and finish the rail to match the spec.

**Tech Stack:** Next.js 16.3.3 (App Router, Turbopack), React 19, next-intl 4 (`proxy.ts`), Tailwind CSS v4 (`@theme inline` two-theme tokens in `src/app/globals.css`), `next/font/google`, Vitest 4 + Testing Library, Playwright 1.62.

**Spec:** `docs/superpowers/specs/2026-09-09-ruang-kerja-personal-redesign.md` (§3 tokens/type, §4 shell & rail, §11 Phase 1 row, §13 items 1/2/5).

## Global Constraints

- JS budget: **210 KB gzip** initial (`node scripts/check-bundle-size.mjs 210`). Do not exceed without sign-off.
- Two themes kept: night = `<html data-theme="night">` default (server-rendered), light = `[data-theme="light"]`. Toggle stays in the rail.
- One accent per theme. Motion 150–300 ms `cubic-bezier(0.16, 1, 0.3, 1)`. `prefers-reduced-motion` honoured.
- Lighthouse Accessibility must stay 100 (CI asserts). One `<h1>` per page, no heading-level skips.
- Bilingual id (default) / en, locale prefix always in URL. Every user-facing string comes from `messages/*.json`.
- Read `node_modules/next/dist/docs/` before writing Next-specific code. `middleware.ts` is deprecated → `proxy.ts`.
- Windows environment. Use the Bash tool for POSIX commands; `npm` scripts run cross-shell.
- Commands: `npx tsc --noEmit`, `npm test` (vitest run), `npx playwright test`, `npm run build`, `npm run check:size`.

---

## File Structure

| File | Responsibility (after Phase 1) |
|---|---|
| `src/app/fonts.ts` | Export `bodyFont` (Source Sans 3, `--font-body`) + `jetbrainsMono`. No Inter. |
| `src/app/globals.css` | `@theme inline` maps utilities → vars; night + light palettes retuned to spec §3; unchanged: focus ring, reduced-motion, hero-art swap, grain keyframes. |
| `src/app/[locale]/layout.tsx` | Applies `bodyFont.variable`; centres the shell at `max-w-[1190px]` with `lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12`. |
| `src/app/global-not-found.tsx` | Applies `bodyFont.variable` (no Inter). |
| `src/components/sidebar.tsx` | The rail: profile mark `fa.`, name, role, availability link, `<Nav>`, GitHub link, rail note, `ThemeToggle` + `LocaleSwitcher`; mobile = floating panel with focus trap + `Esc`. |
| `src/components/nav.tsx` | 8 route items (no Dasbor yet), each `icon={key}`, `Karya` count badge, active `aria-current` + `→`. |
| `src/components/nav-item.tsx` | Renders icon (or index fallback) + label + active `→`. |
| `src/components/icon.tsx` | `IconName` union + `dashboard` + `code`; nav-route glyphs restyled to the lighter single-stroke set. |
| `messages/{id,en}.json` | `sidebar.railNote` added; `sidebar.name` added; keep `role`/`availability`/`footer`. |
| `tests/nav.test.tsx`, `tests/sidebar.test.tsx`, `tests/icon.test.tsx` | Unit coverage for the above. |
| `e2e/shell.spec.ts` | Desktop rail visible; mobile panel opens, `Esc` closes + restores focus. |
| `.gitignore` | Ignores `/public/design-preview/`. |

---

## Task 1: Commit the foundation WIP as the starting point

**Files:**
- Modify (commit only): `src/app/fonts.ts`, `src/app/globals.css`, `src/app/[locale]/layout.tsx`, `src/app/global-not-found.tsx`, `src/components/sidebar.tsx`, `src/components/nav.tsx`, `src/components/nav-item.tsx`, `tests/nav.test.tsx`, `tests/sidebar.test.tsx`, `e2e/shell.spec.ts`
- Leave uncommitted: `src/app/[locale]/page.tsx`, `src/components/pillar-card.tsx`, `tests/*` for those
- Untracked, do not add yet: `public/design-preview/`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a committed baseline where `bodyFont` exists, the shell is a `210px` grid, the rail is a partial `<header>` with a mobile panel, and `Nav` passes `icon={key}`.

- [ ] **Step 1: Verify the WIP compiles and tests pass as-is**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean; **120** unit tests pass (28 files).

- [ ] **Step 2: Run the build to confirm 34 pages, no warnings**

Run: `npm run build`
Expected: `✓ Compiled successfully`, 34 static pages, no `metadataBase` warning.

- [ ] **Step 3: Stage exactly the foundation files**

```bash
git add src/app/fonts.ts src/app/globals.css "src/app/[locale]/layout.tsx" src/app/global-not-found.tsx \
  src/components/sidebar.tsx src/components/nav.tsx src/components/nav-item.tsx \
  tests/nav.test.tsx tests/sidebar.test.tsx e2e/shell.spec.ts
git status --short
```
Expected: the 10 files staged; `src/app/[locale]/page.tsx`, `src/components/pillar-card.tsx`, `tests/case-study-body.test.tsx` (if present) and `public/design-preview/` still unstaged/untracked.

- [ ] **Step 4: Commit**

```bash
git commit --cleanup=strip -m "feat(redesign): single type family, centred shell, icon-nav rail scaffold

Phase 1 foundation. Source Sans 3 replaces Inter/Inter Tight; layout is a
210px rail + reading column; sidebar becomes a <header> with a mobile
floating panel; Nav items carry route icons. Tokens are retuned in the
next commit."
```

- [ ] **Step 5: Confirm the tree is clean of foundation changes**

Run: `git status --short`
Expected: only `page.tsx`, `pillar-card.tsx`, their tests, and `public/design-preview/` remain.

---

## Task 2: Ignore the design-preview sandbox

**Files:**
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: `public/design-preview/` no longer shows as untracked; it stays on disk as the build reference but never reaches `public/` in a commit.

- [ ] **Step 1: Append the ignore rule**

Add to `.gitignore`, under the existing "agent-local tooling" block or a new "redesign reference" comment:

```
# Redesign reference sandbox — kept locally, never shipped
/public/design-preview/
```

- [ ] **Step 2: Verify it's ignored**

Run: `git status --porcelain`
Expected: no `?? public/design-preview/` line; `.gitignore` shows as modified.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit --cleanup=strip -m "chore: gitignore the local design-preview sandbox"
```

---

## Task 3: Retune theme tokens to the spec palette

**Files:**
- Modify: `src/app/globals.css` (the `:root, :root[data-theme="night"]` block and `:root[data-theme="light"]` block)
- Test: `tests/tokens.test.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: night `--bg #101112`, `--surface #1b1d1e`, `--fg #eeefed`, `--fg-muted #a1a7a9`, `--border #33383b`, `--accent #efd45d`, `--on-accent #101112`; light `--bg #f7f3ec`, `--surface #efe9dd`, `--fg #2b2620`, `--fg-muted #6b6357`, `--border #ddd4c3`, `--accent #8f5f18`, `--on-accent #f7f3ec`. `--surface-2` and `--accent-dim` keep their `color-mix`/rgb formulas. Every `--color-*` mirror in each block updated to match.

- [ ] **Step 1: Write the failing test**

Create `tests/tokens.test.ts`:

```ts
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

const css = readFileSync(resolve(__dirname, '../src/app/globals.css'), 'utf8');

function block(selector: string): string {
  const start = css.indexOf(selector);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open, close);
}

describe('theme tokens', () => {
  it('night uses the redesign palette', () => {
    const night = block(':root[data-theme="night"]');
    expect(night).toContain('--bg: #101112');
    expect(night).toContain('--surface: #1b1d1e');
    expect(night).toContain('--accent: #efd45d');
    expect(night).toContain('--fg: #eeefed');
    expect(night).toContain('--border: #33383b');
    expect(night).toContain('--on-accent: #101112');
  });

  it('light uses the adapted warm palette', () => {
    const light = block(':root[data-theme="light"]');
    expect(light).toContain('--bg: #f7f3ec');
    expect(light).toContain('--surface: #efe9dd');
    expect(light).toContain('--accent: #8f5f18');
    expect(light).toContain('--fg: #2b2620');
  });

  it('mirrors each --color-* to its raw var value in the same block', () => {
    for (const sel of [':root[data-theme="night"]', ':root[data-theme="light"]']) {
      const b = block(sel);
      const bg = b.match(/--bg:\s*(#[0-9a-fA-F]{6})/)?.[1];
      expect(b).toContain(`--color-bg: ${bg}`);
    }
  });
});
```

- [ ] **Step 2: Run it — expect failure**

Run: `npx vitest run tests/tokens.test.ts`
Expected: FAIL (current night `--bg` is `#0A0A0B`).

- [ ] **Step 3: Edit `globals.css`**

In `:root, :root[data-theme="night"]` set: `--bg: #101112; --surface: #1b1d1e; --surface-2: #232427; --border: #33383b; --fg: #eeefed; --fg-muted: #a1a7a9; --accent: #efd45d; --accent-dim: rgb(239 212 93 / 0.14); --on-accent: #101112;` and update the matching `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-border`, `--color-fg`, `--color-fg-muted`, `--color-accent`, `--color-on-accent` to the same hex.

In `:root[data-theme="light"]` set: `--bg: #f7f3ec; --surface: #efe9dd; --surface-2: #e6ddca; --border: #ddd4c3; --fg: #2b2620; --fg-muted: #6b6357; --accent: #8f5f18; --accent-dim: rgb(143 95 24 / 0.14); --on-accent: #f7f3ec;` and mirror the `--color-*` entries.

Leave the `@theme inline`, `body`, `:focus-visible`, `prefers-reduced-motion`, hero-art, and grain rules untouched.

- [ ] **Step 4: Run the test — expect pass**

Run: `npx vitest run tests/tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Contrast check (manual, record result)**

Compute WCAG contrast for both themes:
- night: `--fg` on `--bg`, `--fg-muted` on `--bg`, `--fg-muted` on `--surface`, `--on-accent` on `--accent`.
- light: same pairs.

All body-text pairs must be ≥ 4.5:1; `--fg` on `--bg` should reach ≥ 7:1 where practical. If `--fg-muted` on `--surface` falls below 4.5:1, darken/lighten `--fg-muted` by one step and re-run Step 3–4. Record the four ratios per theme in a comment at the top of the light block and in the PR/commit body.

- [ ] **Step 6: Full check + commit**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: tsc clean, all unit tests pass (121 now), build 34 pages no warnings.

```bash
git add src/app/globals.css tests/tokens.test.ts
git commit --cleanup=strip -m "feat(redesign): retune night + light theme tokens

Night: #101112 bg / #efd45d accent. Light: warm paper #f7f3ec / ochre
#8f5f18. Contrast (fg/bg, muted/bg, muted/surface, on-accent/accent):
night <ratios>, light <ratios> — all >= 4.5:1."
```

---

## Task 4: Add the `dashboard` and `code` icons; restyle nav glyphs

**Files:**
- Modify: `src/components/icon.tsx`
- Test: `tests/icon.test.tsx` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: `IconName` gains `'dashboard' | 'code'`. `Icon` renders an `<svg>` for every `IconName`. Nav-route glyphs (`home`, `about`, `work`, `research`, `achievements`, `guestbook`, `contact`, `links`) use the lighter single-stroke paths from `public/design-preview/preview.js` `icons{}` where one exists; the rest keep their current path but at `strokeWidth` 1.6.

- [ ] **Step 1: Write the failing test**

Create `tests/icon.test.tsx`:

```tsx
import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Icon, type IconName} from '@/components/icon';
import {NAV_ITEMS} from '@/components/nav';

const ALL: IconName[] = [
  'build', 'teach', 'secure', 'home', 'about', 'work', 'research',
  'achievements', 'guestbook', 'contact', 'links', 'sun', 'moon',
  'dashboard', 'code'
];

describe('Icon', () => {
  it('renders an svg for every IconName', () => {
    for (const name of ALL) {
      const {container} = render(<Icon name={name} />);
      expect(container.querySelector('svg')).not.toBeNull();
    }
  });

  it('has a glyph for every nav route key', () => {
    for (const {key} of NAV_ITEMS) {
      const {container} = render(<Icon name={key} />);
      expect(container.querySelector('svg')?.childElementCount ?? 0).toBeGreaterThan(0);
    }
  });

  it('marks the svg decorative', () => {
    const {container} = render(<Icon name="home" />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
```

- [ ] **Step 2: Run it — expect failure**

Run: `npx vitest run tests/icon.test.tsx`
Expected: FAIL — `dashboard`/`code` missing from `ICON_PATHS`, TS error on the union.

- [ ] **Step 3: Extend `icon.tsx`**

Add `| 'dashboard' | 'code'` to `IconName`. Add to `ICON_PATHS`:

```tsx
dashboard: (
  <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </>
),
code: (
  <>
    <path d="m8 5-6 7 6 7" />
    <path d="m16 5 6 7-6 7" />
    <path d="M14 3l-4 18" />
  </>
)
```

Change the `<svg>` `strokeWidth` from `"1.75"` to `"1.6"` to match the sandbox weight. Leave `build`/`teach`/`secure`/`sun`/`moon` paths as they are.

- [ ] **Step 4: Run the test — expect pass**

Run: `npx vitest run tests/icon.test.tsx`
Expected: PASS.

- [ ] **Step 5: Full check + commit**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean, all pass.

```bash
git add src/components/icon.tsx tests/icon.test.tsx
git commit --cleanup=strip -m "feat(redesign): add dashboard + code icons, lighten nav glyph stroke"
```

---

## Task 5: Complete the personal rail

**Files:**
- Modify: `src/components/sidebar.tsx`
- Modify: `messages/id.json`, `messages/en.json`
- Modify: `tests/messages.test.ts` (add the new required keys)
- Test: `tests/sidebar.test.tsx` (extend)

**Interfaces:**
- Consumes: `Nav` (default export), `Icon` (`code`), `ThemeToggle`, `LocaleSwitcher`, `Link`/`usePathname` from `@/i18n/navigation`, `useTranslations` from `next-intl`.
- Produces: a `<header>` rail whose desktop form (≥1024px) is a sticky column containing, in order: profile mark (`fa` + accent dot, `aria-label` = `sidebar.name`), name (`sidebar.name`), role (`sidebar.role`), availability link (`sidebar.availability` → `/kontak`), `<Nav>` inside a `border-y` band, GitHub link (`code` icon + "Pratametheus ↗" → `https://github.com/Pratametheus`), rail note (`sidebar.railNote`), then `ThemeToggle` + `LocaleSwitcher`. Mobile form unchanged in behaviour (panel + focus trap + `Esc`), restyled to match.

- [ ] **Step 1: Add the message keys**

In `messages/id.json` `sidebar`:
```json
"name": "Ferry Andhika Pratama",
"railNote": "Membangun · Mengajar · Menguji"
```
In `messages/en.json` `sidebar`:
```json
"name": "Ferry Andhika Pratama",
"railNote": "Build · Teach · Secure"
```
Keep existing `role`, `availability`, `footer`.

- [ ] **Step 2: Write the failing test**

Extend `tests/sidebar.test.tsx` — add inside `describe('Sidebar', ...)`:

```tsx
it('renders the rail identity, availability, github link and note', () => {
  render(<Sidebar />);
  expect(screen.getByText('Ferry Andhika Pratama')).toBeInTheDocument();
  expect(screen.getByRole('link', {name: /Terbuka untuk kolaborasi/})).toHaveAttribute('href', expect.stringContaining('/kontak'));
  const gh = screen.getByRole('link', {name: /Pratametheus/});
  expect(gh).toHaveAttribute('href', 'https://github.com/Pratametheus');
  expect(screen.getByText('Membangun · Mengajar · Menguji')).toBeInTheDocument();
});
```

(The mock at the top of `tests/sidebar.test.tsx` already stubs `next-intl` / navigation — confirm `useTranslations` returns keys via `t('sidebar.name')` etc.; if the existing mock only handles a fixed set, extend it to pass through `sidebar.name`/`sidebar.railNote`.)

- [ ] **Step 3: Run it — expect failure**

Run: `npx vitest run tests/sidebar.test.tsx`
Expected: FAIL — no github link / note text yet.

- [ ] **Step 4: Rewrite the rail body in `sidebar.tsx`**

Replace the inner `<div ref={drawerRef} …>` contents (the profile block + toggles + `<Nav>` + footer) with, in order:

```tsx
<div className="mb-4 flex flex-col items-start gap-3 pt-3 lg:pt-0">
  <div
    aria-label={t('sidebar.name')}
    className="relative grid size-[68px] place-content-center rounded-[20px] border border-accent/40 bg-surface font-display text-[28px] font-semibold text-accent"
  >
    fa<span className="absolute bottom-3 right-4 text-accent">.</span>
  </div>
  <div>
    <p className="font-display text-[19px] font-semibold leading-tight text-fg">{t('sidebar.name')}</p>
    <p className="mt-1 text-sm leading-5 text-fg-muted">{t('sidebar.role')}</p>
  </div>
  <Link href="/kontak" className="border-b border-accent/50 pb-0.5 text-xs text-accent">
    {t('sidebar.availability')}
  </Link>
</div>

<div className="border-y border-border py-3">
  <Nav />
</div>

<a
  href="https://github.com/Pratametheus"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-3 flex items-center gap-2.5 px-2 py-3 text-xs text-fg-muted transition-colors hover:text-fg"
>
  <Icon name="code" className="size-4" />
  Pratametheus <span aria-hidden="true">↗</span>
</a>

<p className="px-2 text-[10px] text-fg-muted">{t('sidebar.railNote')}</p>

<div className="mt-6 flex items-center justify-between gap-2 lg:mt-8">
  <ThemeToggle />
  <LocaleSwitcher />
</div>
```

Add `import {Icon} from './icon';`. Keep the outer `<header>`, the mobile top bar, the overlay button, the focus-trap `useEffect`s, and `drawerRef`/`triggerRef` exactly as they are. Remove the old `<footer>© 2026…` line from the rail (the page-level footer carries the copyright now).

- [ ] **Step 5: Add the new keys to `tests/messages.test.ts`**

In the `requiredKeys` array add: `'sidebar.name'`, `'sidebar.railNote'`.

- [ ] **Step 6: Run the tests — expect pass**

Run: `npx vitest run tests/sidebar.test.tsx tests/messages.test.ts`
Expected: PASS.

- [ ] **Step 7: Full check + commit**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean, all pass.

```bash
git add src/components/sidebar.tsx messages/id.json messages/en.json tests/sidebar.test.tsx tests/messages.test.ts
git commit --cleanup=strip -m "feat(redesign): complete the personal rail (mark, availability, github, note)"
```

---

## Task 6: Nav — `Karya` count badge and active `→`

**Files:**
- Modify: `src/components/nav.tsx`, `src/components/nav-item.tsx`
- Test: `tests/nav.test.tsx` (extend)

**Interfaces:**
- Consumes: `getAllCaseStudies` from `@/lib/content`, `routing` from `@/i18n/routing`, `Icon`.
- Produces: `NavItem` renders a trailing `→` (`aria-hidden`) when `active`; the `work` item renders a small count badge equal to `getAllCaseStudies('id').length` (currently 3). `NAV_ITEMS` still has 8 entries.

- [ ] **Step 1: Write the failing test**

Extend `tests/nav.test.tsx`:

```tsx
it('shows a case-study count on the Karya item', () => {
  render(<Nav />);
  const work = screen.getByRole('link', {name: /Karya/});
  expect(work).toHaveTextContent('3');
});

it('adds a directional marker to the active item only', () => {
  render(<Nav />); // mock has pathname '/' → home active
  const home = screen.getByRole('link', {name: /Beranda/});
  expect(home).toHaveTextContent('→');
  const about = screen.getByRole('link', {name: /Tentang/});
  expect(about).not.toHaveTextContent('→');
});
```

- [ ] **Step 2: Run it — expect failure**

Run: `npx vitest run tests/nav.test.tsx`
Expected: FAIL — no count, no `→` (or `→` already present from WIP; if so this step just adds the count).

- [ ] **Step 3: Implement**

In `nav-item.tsx`, after the label `<span>`, ensure:
```tsx
{active ? <span aria-hidden="true" className="ml-auto text-accent">→</span> : null}
```
(Keep the existing icon-or-index logic.)

In `nav.tsx`:
```tsx
import {getAllCaseStudies} from '@/lib/content';
import {routing} from '@/i18n/routing';
// ...
const workCount = getAllCaseStudies(routing.defaultLocale).length;
```
Pass `count={key === 'work' ? workCount : undefined}` to `<NavItem>`, and in `nav-item.tsx` accept `count?: number` and render `{count != null ? <span className="ml-1 rounded border border-border px-1.5 text-[10px] text-fg-muted">{count}</span> : null}` right after the label (before the active `→`). Note: `nav.tsx` is `'use client'`; `getAllCaseStudies` is a plain sync import of static data — safe in a client component.

- [ ] **Step 4: Run the test — expect pass**

Run: `npx vitest run tests/nav.test.tsx`
Expected: PASS.

- [ ] **Step 5: Full check + commit**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean, all pass.

```bash
git add src/components/nav.tsx src/components/nav-item.tsx tests/nav.test.tsx
git commit --cleanup=strip -m "feat(redesign): Karya count badge + active nav marker"
```

---

## Task 7: e2e — rail on desktop, panel on mobile

**Files:**
- Modify: `e2e/shell.spec.ts`

**Interfaces:**
- Consumes: the running app (Playwright `webServer` from `playwright.config`).
- Produces: passing e2e for the rail's two forms.

- [ ] **Step 1: Write/adjust the specs**

Ensure `e2e/shell.spec.ts` contains:

```ts
test('desktop shows the rail with identity and route links', async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/id');
  await expect(page.getByText('Ferry Andhika Pratama')).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Navigasi utama'}).getByRole('link', {name: /Beranda/})).toBeVisible();
});

test('mobile opens the panel and Esc restores focus', async ({page}) => {
  await page.setViewportSize({width: 390, height: 800});
  await page.goto('/id');
  const trigger = page.getByRole('button', {name: /menu/i});
  await expect(trigger).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Navigasi utama'})).toBeHidden();
  await trigger.click();
  await expect(page.getByRole('navigation', {name: 'Navigasi utama'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('navigation', {name: 'Navigasi utama'})).toBeHidden();
});
```

Keep the existing `no theme flash` and `theme toggle … survives reload` specs.

- [ ] **Step 2: Run the e2e file**

Run: `npx playwright test e2e/shell.spec.ts`
Expected: all specs PASS (chromium + mobile projects).

- [ ] **Step 3: Commit**

```bash
git add e2e/shell.spec.ts
git commit --cleanup=strip -m "test(redesign): e2e for rail desktop/mobile forms"
```

---

## Task 8: Phase-1 verification gate

**Files:** none (verification only).

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 2: Unit**

Run: `npm test`
Expected: all pass (≈124 tests: 120 baseline + tokens + icon + sidebar/nav additions).

- [ ] **Step 3: Bundle budget**

Run: `npm run check:size`
Expected: ≤ 210.0 KB. Record the number.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, 34 static pages, no warnings.

- [ ] **Step 5: e2e**

Run: `npx playwright test`
Expected: all pass (baseline 80 + adjusted shell specs).

- [ ] **Step 6: Record in the ledger**

Append a "Phase 1 — Foundation (2026-09-09)" section to `docs/superpowers/SDD-ledger.md`: the retuned token values + contrast ratios, the two new icons, the rail's final composition, `design-preview` gitignored, and the final numbers (unit / e2e / tsc / build pages / check:size KB).

```bash
git add docs/superpowers/SDD-ledger.md
git commit --cleanup=strip -m "docs(ledger): Phase 1 foundation — tokens, rail, icons"
```

---

## Self-Review

**Spec coverage (§ vs task):**
- §3 fonts → Task 1 (commits codex's `fonts.ts`). §3 palette → Task 3. §3 scale → applied per-component in later phases; P1 only sets tokens.
- §4 layout grid → Task 1 (`layout.tsx` in the commit). §4 rail composition → Task 5. §4 mobile panel → Task 1 (behaviour) + Task 5 (restyle) + Task 7 (e2e). §4 nav → Task 6. §4 icons → Task 4.
- §11 P1 row: "nav has 9 items" — **corrected here to 8**; Dasbor route is added in Phase 6 (§7 wiring note). Tasks 6–7 assert 8.
- §13 item 1 (nav order) → kept as the current order in Task 1's `nav.tsx`; revisit only if Phase 6 insertion of Dasbor reads badly.
- §13 item 2 (light values after contrast) → Task 3 Step 5.
- §13 item 5 (design-preview disposition) → Task 2 (`.gitignore`, not delete — deleted in the final cleanup after Phase 6).

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to". Contrast ratios in Task 3 Step 5 are computed and recorded, not hand-waved. Icon paths are given inline.

**Type consistency:** `IconName` extended in Task 4 is consumed by Task 5 (`Icon name="code"`) and Task 6 (`icon={key}` already in WIP). `NAV_ITEMS` (8 entries, `{href, key}`) referenced by `tests/icon.test.tsx` (Task 4) and unchanged by Task 6. `sidebar.name`/`sidebar.railNote` added in Task 5 Step 1, asserted in Task 5 Step 2 and Task 5 Step 5.

**Gaps:** none for Phase 1 scope. `pillar-card.tsx` and `page.tsx` WIP remain uncommitted by design — Phase 3/5 plans consume them.
