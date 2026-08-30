# "Ruang Kerja" Site Rebuild — Implementation Plan (Plan B of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.
>
> Every task follows the Iron Law of TDD: write a failing test, watch it fail, write minimal code, watch it pass, commit. `create-next-app`-style generated code is the only exception and there is none here.

**Goal:** Rebuild the Next.js site to match the approved "Ruang Kerja" Figma design — a persistent sidebar shell, a runtime night/light theme, eight localised routes, real image cards for selected work, and the eight-part case studies — with the test suites kept green and the JS budget held.

**Architecture:** Tailwind v4 `@theme inline` maps `--color-*` utilities onto plain CSS custom properties that are redefined per `:root[data-theme]`, so a `data-theme` swap on `<html>` retint s the whole page with no rebuild and no flash (a tiny pre-paint script sets the attribute before first paint). Content stays typed structured data (not Markdown). Routes are localised via `next-intl` `pathnames`. Components are small, presentational where possible, and unit-tested with Vitest + Testing Library; whole flows are covered by Playwright.

**Tech Stack:** Next.js 16.3.2 (App Router) · React 19 · next-intl 4 · Tailwind CSS v4 · Vitest 4 + Testing Library · Playwright 1.62

**Spec:** `docs/superpowers/specs/2026-08-30-ruang-kerja-design.md`
**Design QA (what the Figma actually contains):** `docs/superpowers/ruang-kerja-figma-qa.md`
**Copy source:** `docs/spec/FASE-2-Copy-Studi-Kasus.md`
**Figma file:** `0bLl0krxjy0mofkU4vCSe5` — pages `Design System`, `Portfolio · Night`, `Portfolio · Light`

## Global Constraints

Copied from the spec / QA note — every task inherits these:

- **Node ≥ 20.11. Package manager: `npm`.** Next.js 16 conventions: `proxy.ts` not `middleware.ts`; read `node_modules/next/dist/docs/` before writing Next-specific code.
- **Locales:** `id` (default) and `en`. The locale prefix is always in the URL (`localePrefix: 'always'`).
- **No hex literals in components.** Colour comes only from Tailwind utilities that resolve to `var(--color-*)`. A test enforces "no `#rrggbb` in `src/**/*.tsx`".
- **One accent per theme.** Night `--accent: #FACC15`; light `--accent: #8F5F18`. Default theme is **night** (`<html data-theme="night">` server-rendered).
- **Night tokens:** bg `#0A0A0B` · surface `#131316` · surface-2 `#1B1B1F` · border `#26262B` · fg `#EDEDEF` · fg-muted `#9B9BA3` · accent `#FACC15` · accent-dim `rgb(250 204 21 / .13)` · on-accent `#0A0A0B`.
- **Light tokens:** bg `#F7F3EC` · surface `#EFE9DE` · surface-2 `#E7DFD1` · border `#DED4C2` · fg `#2B2925` · fg-muted `#6B6459` · accent `#8F5F18` · accent-dim `rgb(143 95 24 / .14)` · on-accent `#F7F3EC`.
- **Fonts:** Inter (body + display), JetBrains Mono (data). No third family. `src/app/fonts.ts` already wires `--font-inter`, `--font-inter-tight` (kept as an alias of Inter), `--font-jetbrains-mono`.
- **Mono is semantic:** every number, date, file size, year, DOI, technical term renders in `font-mono`.
- **Motion:** 150–300 ms, `cubic-bezier(0.16, 1, 0.3, 1)`; `prefers-reduced-motion` disables all of it. Theme change cross-fades ≤ 200 ms.
- **Nav (id → en label · id route → en route):** Beranda/Home `/` · Tentang/About `/tentang`→`/about` · Karya/Work `/karya`→`/work` · Riset/Research `/riset`→`/research` · Pencapaian/Achievements `/pencapaian`→`/achievements` · Buku Tamu/Guestbook `/buku-tamu`→`/guestbook` · Kontak/Contact `/kontak`→`/contact` · Links/Links `/links`.
- **Case-study slugs (locale-independent):** `siakad-informatika`, `city-courier`, `mochitoon`.
- **Budgets:** initial JS < 150 KB gzip (baseline ~143.5 KB — **no new runtime dependency without measuring and reporting**); Lighthouse Perf (mobile) ≥ 90, Accessibility **100**; LCP < 2.5 s; CLS < 0.1. One `<h1>` per page; no heading-level skips.
- **Commits:** Conventional Commits, one per green task. Work on `main` (repo history is linear from empty; the SDD-ledger ruling stands).

## Delegation

| Owner | Tasks |
|---|---|
| `codex` / `opencode` (driven headless from the controller session) | 1, 2, 3, 4, 5, 6, 9, 10, 11, 14, 17, 19 — the plan carries the full code; this is transcription + running tests |
| Controller (Claude) — write directly, or review delegated output closely | 7, 8, 12, 13, 15, 16, 18, 20 — layout/visual judgement, asset placement, final verification |

Delegated task prompt shape: *"Implement Task N of `docs/superpowers/plans/2026-08-30-ruang-kerja-code.md` exactly. Follow every step in order, run the stated commands, do not deviate. Report the commands you ran and their output."* Review each with `superpowers:requesting-code-review` before the next dependent task.

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `src/app/globals.css` | `@theme inline` map + `:root` / `[data-theme]` token sets + base + reduced-motion | 1 |
| `src/lib/theme.ts` | `THEMES`, `DEFAULT_THEME`, `THEME_STORAGE_KEY`, `themeInitScript` | 2 |
| `src/components/theme-toggle.tsx` | client; set `data-theme` + persist; `resolveInitialTheme()` pure helper | 3 |
| `src/i18n/routing.ts` | + `pathnames` map | 4 |
| `src/components/locale-switcher.tsx` | client; swap locale, keep pathname | 5 |
| `src/components/nav-item.tsx` · `nav.tsx` | numbered nav rows, active state | 6 |
| `src/components/sidebar.tsx` | rail + mobile drawer (focus trap) | 7 |
| `src/app/[locale]/layout.tsx` | `<html data-theme>`, pre-paint script, shell grid | 8 |
| `src/content/types.ts` | `CaseStudy` extended: 8-part `sections`, `thumbnail`, `links` | 9 |
| `src/content/case-studies/{siakad-informatika,city-courier,mochitoon}.ts` · `index.ts` | per-project content, both locales | 10 |
| `src/lib/jsonld.ts` | + `buildCaseStudyArticleSchema(slug, locale)` | 11 |
| `src/components/image-card.tsx` | `next/image` thumbnail card | 12 |
| `src/components/case-study-body.tsx` | renders the 8 `sections` | 13 |
| `src/app/[locale]/karya/page.tsx` · `karya/[slug]/page.tsx` | list + detail (+ localised `/work`) | 13 |
| `src/components/icon.tsx` | inline SVG sprite (build/teach/secure/nav/sun/moon) | 17 |
| `src/components/pillar-card.tsx` · `research-card.tsx` · `contact-row.tsx` | Beranda blocks | 15 |
| `src/app/[locale]/page.tsx` | Beranda rebuild | 15 |
| `src/app/[locale]/{tentang,riset,pencapaian,buku-tamu,kontak,links}/page.tsx` | route pages | 16 |
| `messages/{id,en}.json` | full nav + every page's copy | 14 |
| `public/hero/*.webp` · `public/karya/*.webp` · `public/favicon.*` | optimised assets | 18 |
| `scripts/check-bundle-size.mjs` · `tests/bundle-size.test.ts` | CI budget gate | 19 |
| `tests/*` · `e2e/*` | per-task tests | all |

---

## Phase 1 — Theme system

### Task 1: Two-theme token stylesheet

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tests/tokens.test.ts`

**Interfaces:**
- Produces: Tailwind utilities `bg-bg`, `bg-surface`, `bg-surface-2`, `border-border`, `text-fg`, `text-fg-muted`, `text-accent`, `bg-accent`, `bg-accent-dim`, `text-on-accent`, `ring-ring` — each resolving to a `var()` that changes with `html[data-theme]`.

- [ ] **Step 1: Rewrite the token test**

Replace `tests/tokens.test.ts` with:

```ts
import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf8');

const NIGHT: Array<[string, string]> = [
  ['--color-bg', '#0A0A0B'],
  ['--color-surface', '#131316'],
  ['--color-surface-2', '#1B1B1F'],
  ['--color-border', '#26262B'],
  ['--color-fg', '#EDEDEF'],
  ['--color-fg-muted', '#9B9BA3'],
  ['--color-accent', '#FACC15'],
  ['--color-on-accent', '#0A0A0B']
];
const LIGHT: Array<[string, string]> = [
  ['--color-bg', '#F7F3EC'],
  ['--color-surface', '#EFE9DE'],
  ['--color-surface-2', '#E7DFD1'],
  ['--color-border', '#DED4C2'],
  ['--color-fg', '#2B2925'],
  ['--color-fg-muted', '#6B6459'],
  ['--color-accent', '#8F5F18'],
  ['--color-on-accent', '#F7F3EC']
];

function block(selector: string): string {
  const i = css.indexOf(selector);
  expect(i, `${selector} present`).toBeGreaterThan(-1);
  return css.slice(i, css.indexOf('}', i));
}

describe('design tokens', () => {
  it('maps every color utility through a var() in @theme inline', () => {
    const theme = block('@theme inline');
    for (const [name] of NIGHT) {
      expect(theme).toMatch(new RegExp(`${name.replace('--color', '--color')}:\\s*var\\(`));
    }
  });

  it('defines the night palette on :root', () => {
    const root = block(':root');
    for (const [name, value] of NIGHT) expect(root).toContain(`${name}: ${value}`);
  });

  it('defines the light palette on [data-theme="light"]', () => {
    const light = block('[data-theme="light"]');
    for (const [name, value] of LIGHT) expect(light).toContain(`${name}: ${value}`);
  });

  it('keeps exactly one accent value per theme', () => {
    expect(block(':root').match(/--color-accent:/g) ?? []).toHaveLength(1);
    expect(block('[data-theme="light"]').match(/--color-accent:/g) ?? []).toHaveLength(1);
  });

  it('honours prefers-reduced-motion', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
```

- [ ] **Step 2: Run it — must fail**

Run: `npm test tests/tokens.test.ts`
Expected: FAIL (old file has `#4ADE80`, no `[data-theme="light"]` block, no `@theme inline`).

- [ ] **Step 3: Write `src/app/globals.css`**

```css
@import "tailwindcss";

/* Utilities resolve to vars so a [data-theme] swap retints without a rebuild. */
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-border: var(--border);
  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-accent: var(--accent);
  --color-accent-dim: var(--accent-dim);
  --color-on-accent: var(--on-accent);
  --color-ring: var(--accent);

  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-display: var(--font-inter-tight), var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Night — default, server-rendered as <html data-theme="night"> */
:root,
:root[data-theme="night"] {
  --bg: #0A0A0B;
  --surface: #131316;
  --surface-2: #1B1B1F;
  --border: #26262B;
  --fg: #EDEDEF;
  --fg-muted: #9B9BA3;
  --accent: #FACC15;
  --accent-dim: rgb(250 204 21 / 0.13);
  --on-accent: #0A0A0B;
  color-scheme: dark;
}

:root[data-theme="light"] {
  --bg: #F7F3EC;
  --surface: #EFE9DE;
  --surface-2: #E7DFD1;
  --border: #DED4C2;
  --fg: #2B2925;
  --fg-muted: #6B6459;
  --accent: #8F5F18;
  --accent-dim: rgb(143 95 24 / 0.14);
  --on-accent: #F7F3EC;
  color-scheme: light;
}

body {
  background-color: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.2s var(--ease-out-expo), color 0.2s var(--ease-out-expo);
}

:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Run — must pass**

Run: `npm test tests/tokens.test.ts` → PASS. Then `npx tsc --noEmit` (unaffected) and `npm run build` to confirm Tailwind compiles `@theme inline`.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tests/tokens.test.ts
git commit -m "feat: two-theme token system (night default, light via data-theme)"
```

---

### Task 2: Theme module + no-flash script

**Files:**
- Create: `src/lib/theme.ts`, `tests/theme.test.ts`

**Interfaces:**
- Produces:
  - `THEMES = ['night', 'light'] as const`; `type Theme = (typeof THEMES)[number]`
  - `DEFAULT_THEME: Theme = 'night'`
  - `THEME_STORAGE_KEY = 'ruang-kerja-theme'`
  - `themeInitScript: string` — an IIFE that reads `localStorage[THEME_STORAGE_KEY]`, falls back to `matchMedia('(prefers-color-scheme: light)')`, and sets `document.documentElement.dataset.theme` before paint. Must not throw if storage is unavailable.

- [ ] **Step 1: Failing test** — `tests/theme.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {THEMES, DEFAULT_THEME, THEME_STORAGE_KEY, themeInitScript} from '@/lib/theme';

describe('theme module', () => {
  it('exposes exactly night and light', () => {
    expect([...THEMES]).toEqual(['night', 'light']);
  });
  it('defaults to night', () => {
    expect(DEFAULT_THEME).toBe('night');
  });
  it('names a storage key', () => {
    expect(THEME_STORAGE_KEY).toMatch(/theme/);
  });
  it('init script references the storage key and prefers-color-scheme and is guarded', () => {
    expect(themeInitScript).toContain(THEME_STORAGE_KEY);
    expect(themeInitScript).toContain('prefers-color-scheme');
    expect(themeInitScript).toContain('try');
    expect(themeInitScript).toContain('documentElement');
  });
  it('init script is a self-invoking expression (no bare statements leaking)', () => {
    expect(themeInitScript.trim().startsWith('(')).toBe(true);
  });
});
```

- [ ] **Step 2: Run — FAIL** (`Cannot find module '@/lib/theme'`). `npm test tests/theme.test.ts`.

- [ ] **Step 3: Implement `src/lib/theme.ts`:**

```ts
export const THEMES = ['night', 'light'] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'night';
export const THEME_STORAGE_KEY = 'ruang-kerja-theme';

export const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'light' || stored === 'night'
      ? stored
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'night');
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = '${DEFAULT_THEME}';
  }
})();`;
```

- [ ] **Step 4: Run — PASS.**

- [ ] **Step 5: Commit** `feat: theme constants and no-flash init script`.

---

### Task 3: ThemeToggle component

**Files:**
- Create: `src/components/theme-toggle.tsx`, `tests/theme-toggle.test.tsx`

**Interfaces:**
- Consumes: `Theme`, `THEMES`, `THEME_STORAGE_KEY`, `DEFAULT_THEME` from `@/lib/theme`.
- Produces:
  - `resolveInitialTheme(stored: string | null, prefersLight: boolean): Theme` — pure.
  - default export `ThemeToggle` — a `'use client'` component: two buttons (sun = light, moon = night) in a `role="group"` labelled "Tema"; clicking sets `document.documentElement.dataset.theme`, writes `localStorage`, and updates `aria-pressed`.

- [ ] **Step 1: Failing test** — `tests/theme-toggle.test.tsx`:

```tsx
import {describe, expect, it, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle, {resolveInitialTheme} from '@/components/theme-toggle';

describe('resolveInitialTheme', () => {
  it('prefers a valid stored value', () => {
    expect(resolveInitialTheme('light', false)).toBe('light');
    expect(resolveInitialTheme('night', true)).toBe('night');
  });
  it('falls back to the OS preference when unset', () => {
    expect(resolveInitialTheme(null, true)).toBe('light');
    expect(resolveInitialTheme(null, false)).toBe('night');
  });
  it('ignores a junk stored value', () => {
    expect(resolveInitialTheme('banana', true)).toBe('light');
  });
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'night';
    localStorage.clear();
  });
  it('renders a labelled group with two options', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('group', {name: /tema/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /terang|light/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /gelap|malam|night|dark/i})).toBeInTheDocument();
  });
  it('switches the document theme and persists it', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole('button', {name: /terang|light/i}));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('ruang-kerja-theme')).toBe('light');
    expect(screen.getByRole('button', {name: /terang|light/i})).toHaveAttribute('aria-pressed', 'true');
  });
});
```

- [ ] **Step 2: Run — FAIL.**

- [ ] **Step 3: Implement `src/components/theme-toggle.tsx`** (`'use client'`):

```tsx
'use client';

import {useEffect, useState} from 'react';
import {THEMES, THEME_STORAGE_KEY, DEFAULT_THEME, type Theme} from '@/lib/theme';

export function resolveInitialTheme(stored: string | null, prefersLight: boolean): Theme {
  if (stored === 'light' || stored === 'night') return stored;
  return prefersLight ? 'light' : 'night';
}

const LABELS: Record<Theme, {id: string}> = {
  light: {id: 'Terang'},
  night: {id: 'Malam'}
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === 'light' || current === 'night') setTheme(current);
  }, []);

  function choose(next: Theme) {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the choice still applies for this page */
    }
    setTheme(next);
  }

  return (
    <div role="group" aria-label="Tema" className="inline-flex rounded-lg border border-border p-0.5">
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => choose(option)}
          className="min-h-6 rounded-md px-2 py-1 font-mono text-xs text-fg-muted transition-colors aria-pressed:bg-surface-2 aria-pressed:text-fg"
        >
          {LABELS[option].id}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run — PASS.** `npx tsc --noEmit`.

- [ ] **Step 5: Commit** `feat: ThemeToggle with OS-preference fallback and persistence`.

---

## Phase 2 — Shell

### Task 4: Localised route pathnames

**Files:**
- Modify: `src/i18n/routing.ts`
- Modify: `tests/routing.test.ts`
- Create: `tests/pathnames.test.ts`

**Interfaces:**
- Produces: `routing.pathnames` — a map keyed by the canonical (id) path, each value `{id: string, en: string}`. Canonical keys: `/`, `/tentang`, `/karya`, `/karya/[slug]`, `/riset`, `/pencapaian`, `/buku-tamu`, `/kontak`, `/links`.

- [ ] **Step 1: Extend the routing test** — append to `tests/routing.test.ts`:

```ts
import {routing} from '@/i18n/routing';

describe('localised pathnames', () => {
  it('maps every nav route for both locales', () => {
    const p = routing.pathnames as Record<string, {id: string; en: string}>;
    expect(p['/tentang']).toEqual({id: '/tentang', en: '/about'});
    expect(p['/karya']).toEqual({id: '/karya', en: '/work'});
    expect(p['/karya/[slug]']).toEqual({id: '/karya/[slug]', en: '/work/[slug]'});
    expect(p['/riset']).toEqual({id: '/riset', en: '/research'});
    expect(p['/pencapaian']).toEqual({id: '/pencapaian', en: '/achievements'});
    expect(p['/buku-tamu']).toEqual({id: '/buku-tamu', en: '/guestbook'});
    expect(p['/kontak']).toEqual({id: '/kontak', en: '/contact'});
    expect(p['/links']).toEqual({id: '/links', en: '/links'});
  });
});
```

- [ ] **Step 2: Run — FAIL** (`routing.pathnames` undefined).

- [ ] **Step 3: Implement `src/i18n/routing.ts`:**

```ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['id', 'en'],
  defaultLocale: 'id',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/tentang': {id: '/tentang', en: '/about'},
    '/karya': {id: '/karya', en: '/work'},
    '/karya/[slug]': {id: '/karya/[slug]', en: '/work/[slug]'},
    '/riset': {id: '/riset', en: '/research'},
    '/pencapaian': {id: '/pencapaian', en: '/achievements'},
    '/buku-tamu': {id: '/buku-tamu', en: '/guestbook'},
    '/kontak': {id: '/kontak', en: '/contact'},
    '/links': '/links'
  }
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
```

- [ ] **Step 4: Update `src/i18n/navigation.ts`** — no code change needed (`createNavigation(routing)` picks up `pathnames`), but re-run `npm test` to confirm nothing regressed. Add `tests/pathnames.test.ts` asserting `getPathname` from navigation resolves `/karya` → `/en/work` for `en`:

```ts
import {describe, expect, it} from 'vitest';
import {getPathname} from '@/i18n/navigation';

describe('getPathname', () => {
  it('localises a static route to English', () => {
    expect(getPathname({href: '/karya', locale: 'en'})).toBe('/en/work');
  });
  it('localises a dynamic case-study route', () => {
    expect(
      getPathname({href: {pathname: '/karya/[slug]', params: {slug: 'city-courier'}}, locale: 'en'})
    ).toBe('/en/work/city-courier');
  });
});
```

If `getPathname` is not exported from `createNavigation`, export it there: `export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);`

- [ ] **Step 5: Run all — PASS.** `npm test`.

- [ ] **Step 6: Commit** `feat: localised route pathnames (id/en)`.

---

### Task 5: LocaleSwitcher

**Files:**
- Create: `src/components/locale-switcher.tsx`, `tests/locale-switcher.test.tsx`

**Interfaces:**
- Consumes: `usePathname`, `useRouter` from `@/i18n/navigation`; `routing.locales`.
- Produces: default export `LocaleSwitcher` (`'use client'`) — a `role="group"` labelled "Bahasa" with an `ID` and `EN` button; clicking calls `router.replace(pathname, {locale})` keeping the current pathname; `aria-pressed` marks the active locale (from `useLocale()`).

- [ ] **Step 1: Failing test** — mock `@/i18n/navigation`:

```tsx
import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replace = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/karya',
  useRouter: () => ({replace})
}));
vi.mock('next-intl', () => ({useLocale: () => 'id'}));

import LocaleSwitcher from '@/components/locale-switcher';

describe('LocaleSwitcher', () => {
  it('marks the current locale and switches on the other, keeping the path', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher />);
    expect(screen.getByRole('button', {name: 'ID'})).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', {name: 'EN'}));
    expect(replace).toHaveBeenCalledWith('/karya', {locale: 'en'});
  });
});
```

- [ ] **Step 2: Run — FAIL.**

- [ ] **Step 3: Implement:**

```tsx
'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export default function LocaleSwitcher() {
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div role="group" aria-label="Bahasa" className="inline-flex rounded-lg border border-border p-0.5">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          aria-pressed={locale === active}
          onClick={() => router.replace(pathname, {locale})}
          className="min-h-6 rounded-md px-2 py-1 font-mono text-xs uppercase text-fg-muted transition-colors aria-pressed:bg-surface-2 aria-pressed:text-fg"
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run — PASS.**

- [ ] **Step 5: Commit** `feat: LocaleSwitcher preserving the current route`.

---

### Task 6: NavItem + Nav

**Files:**
- Create: `src/components/nav-item.tsx`, `src/components/nav.tsx`, `tests/nav.test.tsx`

**Interfaces:**
- Consumes: `Link`, `usePathname` from `@/i18n/navigation`; `useTranslations('nav')`.
- Produces:
  - `NAV_ITEMS: ReadonlyArray<{href: AppPathname; key: string}>` exported from `nav.tsx` — `/`(home), `/tentang`(about), `/karya`(work), `/riset`(research), `/pencapaian`(achievements), `/buku-tamu`(guestbook), `/kontak`(contact), `/links`(links).
  - `NavItem({href, index, label, active}: {href: string; index: string; label: string; active: boolean})` — renders `<Link>` with a 2-digit `index` in mono, the `label`, `aria-current="page"` when `active`, min-height 44.
  - default `Nav` — maps `NAV_ITEMS`, computes `active` by comparing `usePathname()` to each `href` (exact for `/`, prefix for the rest).

- [ ] **Step 1: Failing test:**

```tsx
import {describe, expect, it, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/karya',
  Link: ({children, href}: {children: React.ReactNode; href: string}) => <a href={href}>{children}</a>
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) =>
    ({home: 'Beranda', about: 'Tentang', work: 'Karya', research: 'Riset', achievements: 'Pencapaian', guestbook: 'Buku Tamu', contact: 'Kontak', links: 'Links'}[k] ?? k)
}));

import Nav from '@/components/nav';

describe('Nav', () => {
  it('renders eight numbered items', () => {
    render(<Nav />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(8);
    expect(within(links[0]).getByText('01')).toBeInTheDocument();
  });
  it('marks the active route with aria-current', () => {
    render(<Nav />);
    expect(screen.getByRole('link', {name: /Karya/}).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', {name: /Beranda/}).getAttribute('aria-current')).toBeNull();
  });
});
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** `nav-item.tsx` and `nav.tsx` per the Interfaces block. `NavItem` root class: `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-fg-muted transition-colors hover:bg-surface-2 aria-[current=page]:bg-accent-dim aria-[current=page]:text-fg`. Index span: `font-mono text-xs`.
- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit** `feat: numbered sidebar navigation with active state`.

---

### Task 7: Sidebar (rail + mobile drawer)

**Files:**
- Create: `src/components/sidebar.tsx`, `tests/sidebar.test.tsx`

**Interfaces:**
- Consumes: `Nav`, `ThemeToggle`, `LocaleSwitcher`, `useTranslations`.
- Produces: default `Sidebar` — `<aside>` containing: monogram `FA`, name `Ferry Andhika Pratama`, role line (`t('role')`), a row with `<ThemeToggle/>` + `<LocaleSwitcher/>`, `<Nav/>`, and a footer `© 2026 Ferry Andhika Pratama`. On < 1024 px it is a drawer: a `<button aria-expanded aria-controls>` toggles it; open state traps focus and closes on `Esc` / route change / backdrop click.

- [ ] **Step 1: Failing test** — desktop render shows nav + toggles; the drawer button toggles `aria-expanded`; `Esc` closes it. (Use `vi.mock` for `@/i18n/navigation`, `next-intl` as in Task 6.)

```tsx
// key assertions
render(<Sidebar />);
expect(screen.getByRole('navigation')).toBeInTheDocument();
const trigger = screen.getByRole('button', {name: /menu/i});
expect(trigger).toHaveAttribute('aria-expanded', 'false');
await user.click(trigger);
expect(trigger).toHaveAttribute('aria-expanded', 'true');
await user.keyboard('{Escape}');
expect(trigger).toHaveAttribute('aria-expanded', 'false');
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement.** `'use client'` (needs `useState`/`useEffect` for the drawer + `usePathname` to close on navigation). Rail: `hidden lg:flex lg:w-[280px] lg:flex-col`; drawer wrapper on mobile with a translucent backdrop. Focus trap: on open, move focus to the first nav link; on `Esc`, close and restore focus to the trigger. Respect `prefers-reduced-motion` (no slide transition when set).
- [ ] **Step 4: Run — PASS.** `npx tsc --noEmit`.
- [ ] **Step 5: Commit** `feat: sidebar shell with mobile drawer`.

---

### Task 8: Layout — html[data-theme], pre-paint script, shell grid

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Create: `e2e/shell.spec.ts`

**Interfaces:**
- Consumes: `themeInitScript`, `DEFAULT_THEME` from `@/lib/theme`; `Sidebar`.

- [ ] **Step 1: Failing e2e** — `e2e/shell.spec.ts`:

```ts
import {test, expect} from '@playwright/test';

test('no theme flash: <html data-theme> is set before first paint', async ({page}) => {
  await page.goto('/id');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /night|light/);
});

test('desktop shows the sidebar rail', async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/id');
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByRole('link', {name: /Beranda/})).toBeVisible();
});

test('mobile collapses the sidebar to a drawer', async ({page}) => {
  await page.setViewportSize({width: 390, height: 800});
  await page.goto('/id');
  const trigger = page.getByRole('button', {name: /menu/i});
  await expect(trigger).toBeVisible();
  await expect(page.getByRole('navigation')).toBeHidden();
  await trigger.click();
  await expect(page.getByRole('navigation')).toBeVisible();
});

test('theme toggle flips data-theme and survives reload', async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/id');
  await page.getByRole('button', {name: /terang/i}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
```

- [ ] **Step 2: Run — FAIL** (`npm run test:e2e -- shell`).

- [ ] **Step 3: Rewrite `layout.tsx`:**

```tsx
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {siteUrl} from '@/lib/site';
import {themeInitScript, DEFAULT_THEME} from '@/lib/theme';
import Sidebar from '@/components/sidebar';
import {inter, interTight, jetbrainsMono} from '../fonts';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({locale, namespace: 'metadata'});
  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    alternates: {languages: {id: '/id', en: '/en'}}
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      data-theme={DEFAULT_THEME}
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
      </head>
      <body>
        <NextIntlClientProvider>
          <div className="lg:grid lg:grid-cols-[280px_1fr]">
            <Sidebar />
            <div className="min-w-0">{children}</div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run — PASS.** Then `npm test` (unit unaffected), `npx tsc --noEmit`, `npm run build`.

- [ ] **Step 5: Commit** `feat: app shell — themed html, sidebar grid, no-flash script`.

---

## Phase 3 — Content + case studies

### Task 9: Extend the CaseStudy type

**Files:**
- Modify: `src/content/types.ts`
- Modify: `tests/content.test.ts` (add shape assertions)

**Interfaces:**
- Produces:

```ts
export type {Locale} from '@/i18n/routing';

export type CaseStudySection = {
  heading: string;
  /** ordered blocks; keep it small — no Markdown */
  blocks: Array<
    | {type: 'p'; text: string}
    | {type: 'list'; items: string[]}
    | {type: 'table'; rows: Array<[string, string]>}
    | {type: 'quote'; text: string}
  >;
};

export type CaseStudy = {
  slug: 'siakad-informatika' | 'city-courier' | 'mochitoon';
  title: string;
  tagline: string;
  scope?: string;
  year: number;
  stack: string[];
  featured: boolean;
  liveUrl?: string;
  repositoryNote?: string;
  thumbnail: {src: string; alt: string};
  /** the eight-part structure from FASE-2, in order */
  sections: CaseStudySection[];
};
```

- [ ] **Step 1: Failing test** — extend `tests/content.test.ts`:

```ts
import {getAllCaseStudies} from '@/lib/content';

describe('case study shape', () => {
  it.each(['id', 'en'] as const)('%s: every study has a thumbnail and eight sections', (locale) => {
    for (const cs of getAllCaseStudies(locale)) {
      expect(cs.thumbnail.src).toMatch(/^\/karya\//);
      expect(cs.thumbnail.alt.length).toBeGreaterThan(8);
      expect(cs.sections).toHaveLength(8);
      for (const s of cs.sections) expect(s.blocks.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run — FAIL** (type + data missing). 
- [ ] **Step 3: Implement `types.ts`** as above.
- [ ] **Step 4:** test still fails on data — that's Task 10. Commit the type only: `git add src/content/types.ts && git commit -m "feat: eight-part CaseStudy content type"`. (Leave `tests/content.test.ts` staged-but-red note in the commit body; Task 10 turns it green.)

---

### Task 10: Case-study content, per file, both locales

**Files:**
- Create: `src/content/case-studies/siakad-informatika.ts`, `city-courier.ts`, `mochitoon.ts`
- Modify: `src/content/case-studies/index.ts`
- Modify: `tests/content-parity.test.ts`

**Interfaces:**
- Consumes: `CaseStudy`, `CaseStudySection` from `../types`.
- Produces: `caseStudies: Record<Locale, CaseStudy[]>` from `index.ts`, order `[siakad-informatika, city-courier, mochitoon]`.

- [ ] **Step 1: Parity test** — rewrite `tests/content-parity.test.ts` to assert, per slug, that `id` and `en` have the same `sections[i].heading` count and the same `blocks[j].type` sequence (text differs, structure matches):

```ts
import {describe, expect, it} from 'vitest';
import {caseStudies} from '@/content/case-studies';

describe('case-study id/en structural parity', () => {
  it('matches section and block structure across locales', () => {
    const id = caseStudies.id;
    const en = caseStudies.en;
    expect(id.map((c) => c.slug)).toEqual(en.map((c) => c.slug));
    id.forEach((cs, i) => {
      const other = en[i];
      expect(cs.sections.map((s) => s.blocks.map((b) => b.type))).toEqual(
        other.sections.map((s) => s.blocks.map((b) => b.type))
      );
    });
  });
});
```

- [ ] **Step 2: Run — FAIL.**

- [ ] **Step 3: Author the three content files.** Each exports `const <name>: Record<Locale, CaseStudy>`. Fill `sections` from `docs/spec/FASE-2-Copy-Studi-Kasus.md` — the eight headings per study are: `Problem · User · Solution · Key Features · Challenge · Impact · Tech Choices · Screenshot`. Use `id` text verbatim from FASE-2; write the `en` as a genuine rewrite (not a literal translation), keeping the same block types. `thumbnail.src`: `/karya/siakad-informatika.webp`, `/karya/city-courier.webp`, `/karya/mochitoon.webp`. `thumbnail.alt` per locale (e.g. id: "Tangkapan layar aplikasi SIAKAD Informatika"). Carry over existing fields: SIAKAD `liveUrl: 'https://jurnal-mengajar-blond.vercel.app/'`, `repositoryNote`; City Courier no `liveUrl`; MochiToon `liveUrl: 'https://manga-studio-one.vercel.app/'`. `stack`, `year: 2026`, `featured` (SIAKAD + City Courier true, MochiToon false).

> This is a large transcription task. Split it across three sub-agent runs (one per file) if delegating; each run's deliverable is one file + the parity test passing for that slug.

- [ ] **Step 4:** rewrite `index.ts`:

```ts
import type {CaseStudy, Locale} from '../types';
import {siakadInformatika} from './siakad-informatika';
import {cityCourier} from './city-courier';
import {mochitoon} from './mochitoon';

export const caseStudies: Record<Locale, CaseStudy[]> = {
  id: [siakadInformatika.id, cityCourier.id, mochitoon.id],
  en: [siakadInformatika.en, cityCourier.en, mochitoon.en]
};
```

- [ ] **Step 5: Run — PASS** (`tests/content.test.ts`, `tests/content-parity.test.ts`, `tests/messages.test.ts` unaffected).
- [ ] **Step 6: Commit** `feat: eight-part case-study content (id/en) as typed data`.

---

### Task 11: Case-study Article JSON-LD

**Files:**
- Modify: `src/lib/jsonld.ts`, `tests/jsonld.test.ts`

**Interfaces:**
- Consumes: `getCaseStudy` from `@/lib/content`; `siteName`, `siteUrl`.
- Produces: `buildCaseStudyArticleSchema(slug: string, locale: Locale)` → a JSON-LD `Article` object: `@type: 'Article'`, `headline` = title, `about` = tagline, `datePublished` = `${year}-01-01`, `author` = `{'@type':'Person', name: siteName}`, `inLanguage` = locale, `url` = `${siteUrl}/${locale}/karya/${slug}` (use `en` path for `en`).

- [ ] **Step 1: Failing test** — add to `tests/jsonld.test.ts`:

```ts
import {buildCaseStudyArticleSchema} from '@/lib/jsonld';

describe('buildCaseStudyArticleSchema', () => {
  it('builds a valid Article for a known slug', () => {
    const s = buildCaseStudyArticleSchema('city-courier', 'en');
    expect(s['@type']).toBe('Article');
    expect(s.headline).toMatch(/City Courier/);
    expect(s.inLanguage).toBe('en');
    expect(s.url).toContain('/en/work/city-courier');
  });
  it('throws for an unknown slug', () => {
    expect(() => buildCaseStudyArticleSchema('nope', 'id')).toThrow();
  });
});
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** — reuse `getCaseStudy` (throws on unknown slug). Build the `en`/`id` URL segment from `slug` and locale (`karya` vs `work`).
- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit** `feat: Article JSON-LD per case study`.

---

## Phase 4 — Pages, cards, messages

### Task 12: ImageCard

**Files:**
- Create: `src/components/image-card.tsx`, `tests/image-card.test.tsx`
- Modify: delete `src/components/case-study-card.tsx` + `tests/case-study-card.test.tsx` (replaced)

**Interfaces:**
- Consumes: `CaseStudy`, `Locale`; `getPathname` from `@/i18n/navigation`; `next/image`.
- Produces: `ImageCard({caseStudy, locale, priority}: {caseStudy: CaseStudy; locale: Locale; priority?: boolean})` — an `<article>`: a 16:10 `next/image` (`fill`, `sizes="(min-width:1024px) 360px, 100vw"`, `priority` on the first card only, `alt` from `caseStudy.thumbnail.alt`), then title as a `<Link>` to the localised `/karya/[slug]`, tagline, `year` in mono, `stack` tags, and a `Kunjungi aplikasi` / `Visit application` link when `liveUrl` is set.

- [ ] **Step 1: Failing test:**

```tsx
import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';

vi.mock('next/image', () => ({default: (p: any) => <img alt={p.alt} src={typeof p.src === 'string' ? p.src : p.src.src} />}));
vi.mock('@/i18n/navigation', () => ({
  getPathname: ({href}: any) => (typeof href === 'string' ? href : `/karya/${href.params.slug}`),
  Link: ({children, href}: any) => <a href={href}>{children}</a>
}));

import {ImageCard} from '@/components/image-card';

const cs = {
  slug: 'city-courier', title: 'City Courier', tagline: 'JWKS, diserang lalu diterbitkan.',
  year: 2026, stack: ['Flutter', 'Laravel'], featured: true,
  liveUrl: undefined, thumbnail: {src: '/karya/city-courier.webp', alt: 'Ilustrasi City Courier'}, sections: []
} as any;

describe('ImageCard', () => {
  it('renders the thumbnail alt, title link, year and tags', () => {
    render(<ImageCard caseStudy={cs} locale="id" />);
    expect(screen.getByRole('img', {name: 'Ilustrasi City Courier'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'City Courier'})).toHaveAttribute('href', '/karya/city-courier');
    expect(screen.getByText('2026')).toHaveClass('font-mono');
    expect(screen.getByText('Flutter')).toBeInTheDocument();
  });
  it('omits the visit link when there is no liveUrl', () => {
    render(<ImageCard caseStudy={cs} locale="id" />);
    expect(screen.queryByRole('link', {name: /kunjungi/i})).toBeNull();
  });
});
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement.** Card: `rounded-2xl border border-border bg-surface overflow-hidden`. Image wrapper: `relative aspect-[16/10] bg-surface-2`. Body: `p-6` with `font-display` title, `text-fg-muted` tagline, `font-mono text-xs` year + tags.
- [ ] **Step 4: Run — PASS.** Remove the old card + its test; `npm test` still green.
- [ ] **Step 5: Commit** `feat: ImageCard for selected work; drop text-only card`.

---

### Task 13: Karya list + detail routes

**Files:**
- Create: `src/components/case-study-body.tsx`, `tests/case-study-body.test.tsx`
- Create: `src/app/[locale]/karya/page.tsx`, `src/app/[locale]/karya/[slug]/page.tsx`
- Create: `e2e/karya.spec.ts`

**Interfaces:**
- Consumes: `getAllCaseStudies`, `getCaseStudy`, `ImageCard`, `buildCaseStudyArticleSchema`, `CaseStudySection`.
- Produces: `CaseStudyBody({sections}: {sections: CaseStudySection[]})` — renders each section as `<section>` with an `<h2>` (`font-display`) and its blocks (`<p>`, `<ul><li>`, a 2-col `<table>` in mono, `<blockquote>`).

- [ ] **Step 1: Failing tests.** `case-study-body.test.tsx`: given two sections with mixed blocks, renders 2 `<h2>`, the list items, the table cells. `e2e/karya.spec.ts`:

```ts
import {test, expect} from '@playwright/test';

test('all three case studies are reachable from the list', async ({page}) => {
  await page.goto('/id/karya');
  for (const name of ['SIAKAD Informatika', 'City Courier', 'MochiToon']) {
    await expect(page.getByRole('link', {name})).toBeVisible();
  }
  await page.getByRole('link', {name: 'City Courier'}).click();
  await expect(page).toHaveURL(/\/id\/karya\/city-courier$/);
  await expect(page.getByRole('heading', {level: 1, name: /City Courier/})).toBeVisible();
});

test('english list localises to /en/work', async ({page}) => {
  await page.goto('/en/work');
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
});
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement.**
  - `karya/page.tsx`: `setRequestLocale`, `getAllCaseStudies(locale)`, `<h1>` from `t('work.title')`, grid of `<ImageCard priority={i===0}>`.
  - `karya/[slug]/page.tsx`: `generateStaticParams` from the 3 slugs × 2 locales; `getCaseStudy(slug, locale)` (404 via `notFound()` on throw); `<h1>` = title; `<figure>` with the thumbnail; `<CaseStudyBody sections={cs.sections}/>`; inject `buildCaseStudyArticleSchema(slug, locale)` as `<script type="application/ld+json">`.
  - Both must satisfy heading order (single `<h1>`, sections use `<h2>`).
- [ ] **Step 4: Run — PASS** (unit + `npm run test:e2e -- karya`). `npx tsc --noEmit`, `npm run build`.
- [ ] **Step 5: Commit** `feat: karya list and case-study detail routes (id/en)`.

---

### Task 14: Message files — full copy

**Files:**
- Modify: `messages/id.json`, `messages/en.json`
- Modify: `tests/messages.test.ts` (already checks key parity — keep it)

**Interfaces:**
- Produces: keys — `nav.{home,about,work,research,achievements,guestbook,contact,links}`, `sidebar.{role,availability,footer}`, `home.{eyebrow,tagline,statement,pillarsTitle,pillars.{build,teach,secure}.{title,body},selectedWork,researchTitle,contactTitle,contactCta}`, `work.{title,intro}`, `about.{title,body*}`, `research.{title,paper.*}`, `achievements.{title,*}`, `guestbook.{title,empty}`, `contact.{title,*}`, `links.{title,*}`, `metadata.{title,description}`, `notFound.*`, plus `common.visitApp`.

- [ ] **Step 1: Confirm `tests/messages.test.ts` enforces "every key in id.json exists in en.json and vice-versa".** If it only checks one direction, make it bidirectional first (write the failing assertion, watch it fail on a deliberately missing key, then fix).
- [ ] **Step 2:** author both files with the full key set. `id` verbatim from FASE-2 / FASE-3 where copy exists; `en` a real rewrite. Keep `home.tagline` containing the substring `"I build software"` in `en` (an existing e2e depends on it — or update that e2e in Task 20).
- [ ] **Step 3: Run — PASS** `npm test tests/messages.test.ts`.
- [ ] **Step 4: Commit** `feat: complete id/en message catalog`.

---

### Task 15: Beranda rebuild

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Create: `src/components/pillar-card.tsx`, `src/components/research-card.tsx`, `src/components/contact-row.tsx`
- Create: `tests/pillar-card.test.tsx`, `tests/beranda.test.tsx` (or extend `e2e/home.spec.ts`)

**Interfaces:**
- Consumes: `getAllCaseStudies`, `ImageCard`, `Icon` (Task 17), `useTranslations`/`getTranslations`.
- Produces:
  - `PillarCard({icon, title, body}: {icon: 'build'|'teach'|'secure'; title: string; body: string})`.
  - `ResearchCard({locale})` — JUTIF card: title, `JUTIF · Vol 7 No 2 (2026) · hal. 1834–1852 · SINTA 2` in mono, DOI link `https://doi.org/10.52436/1.jutif.2026.7.2.5662`.
  - `ContactRow({label, value, href?})`.
  - Beranda: eyebrow (`PUBLIC DOSSIER · FA-2026-0830`, mono), `<h1>` name, role sub, statement, three `PillarCard`s, `Karya terpilih` heading + `ImageCard` grid, `ResearchCard`, `Kontak` heading + `ContactRow`s. One `<h1>`, sections as `<h2>`.

- [ ] **Step 1: Failing test** — `tests/pillar-card.test.tsx` (renders icon + title + body); update `e2e/home.spec.ts` to assert the `<h1>`, the three pillar titles, and three `ImageCard` links are visible, heading order h1→h2 with no skip.
- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** the three components + the page. No hex literals; mono on every number/date.
- [ ] **Step 4: Run — PASS.** `npm run test:e2e -- home`.
- [ ] **Step 5: Commit** `feat: rebuild Beranda — hero, pillars, image cards, research, contact`.

---

### Task 16: Remaining route pages

**Files:**
- Create: `src/app/[locale]/tentang/page.tsx`, `riset/page.tsx`, `pencapaian/page.tsx`, `buku-tamu/page.tsx`, `kontak/page.tsx`, `links/page.tsx`
- Create: `e2e/routes.spec.ts`

**Interfaces:**
- Each page: `setRequestLocale(locale)`, one `<h1>` from its `t('<page>.title')`, content from the message catalog. `riset` also renders `ResearchCard` + injects `buildScholarlyArticleSchema()` (already in `jsonld.ts`). `buku-tamu` renders a read-only empty state (`t('guestbook.empty')`) — no form (FASE-4). `links` renders a list of external links from the catalog (`rel="noopener noreferrer"`, `target="_blank"`).

- [ ] **Step 1: Failing e2e** — `e2e/routes.spec.ts`: for each of `/id/tentang`, `/id/riset`, `/id/pencapaian`, `/id/buku-tamu`, `/id/kontak`, `/id/links` and their `/en/...` equivalents, assert HTTP 200 and exactly one `<h1>` visible; `/en/about` etc. resolve (localised paths).
- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** the six pages. Keep them lean — heading + catalog copy + the one card on `riset`.
- [ ] **Step 4: Run — PASS.** `npx tsc --noEmit`, `npm run build` (confirms all routes prerender for both locales).
- [ ] **Step 5: Commit** `feat: tentang / riset / pencapaian / buku-tamu / kontak / links routes`.

---

### Task 17: Icon sprite

**Files:**
- Create: `src/components/icon.tsx`, `tests/icon.test.tsx`

**Interfaces:**
- Produces: `Icon({name, className}: {name: IconName; className?: string})` — inline `<svg width=24 height=24 fill=none stroke=currentColor stroke-width=1.75>` selecting one `<path>` set by `name`. `IconName = 'build'|'teach'|'secure'|'home'|'about'|'work'|'research'|'achievements'|'guestbook'|'contact'|'links'|'sun'|'moon'`. Paths for `build`/`teach`/`secure` are the ones authored for the Figma pass (`assets/source/icons/*.svg` — copy the `<path d="…">` values verbatim). `aria-hidden="true"` (decorative; labels come from text).

- [ ] **Step 1: Failing test** — renders an `<svg>` with the expected number of `<path>`s for `build` (3) and `secure` (6); unknown name → renders nothing / throws (pick one, test it).
- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** with a `Record<IconName, ReactNode>` of path fragments. `stroke-linecap="round" stroke-linejoin="round"`.
- [ ] **Step 4: Run — PASS.** Wire `Icon` into `PillarCard` (Task 15) and `NavItem` if adding nav glyphs (optional — numbered nav is fine without).
- [ ] **Step 5: Commit** `feat: inline SVG icon set`.

---

## Phase 5 — Assets, budget, verification

### Task 18: Optimised assets in public/

**Files:**
- Create: `public/hero/operator-night.webp`, `public/hero/operator-light.webp`, `public/karya/siakad-informatika.webp`, `public/karya/city-courier.webp`, `public/karya/mochitoon.webp`, `public/favicon.ico` (+ `icon.svg`)
- Modify: `.gitignore` — these are committed (they're product assets); `/assets/` stays ignored.

**Interfaces:**
- Consumed by: `ImageCard` (`/karya/*.webp`), Beranda hero (`/hero/*.webp`).

- [ ] **Step 1:** from `assets/source/`, produce web-optimised copies:
  - heroes → `public/hero/operator-{night,light}.webp`, max width 1040, quality ~78 (`npx sharp` or `squoosh-cli`; if neither is available, note it and commit the PNGs re-encoded to webp by any local tool).
  - case-study thumbnails → `public/karya/<slug>.webp`, 1200×750 (16:10), quality ~80. SIAKAD + MochiToon from the live-site screenshots; City Courier = the key-van art composited on a `#131316` panel (or a plain crop — the card sits on `bg-surface` anyway).
  - favicon from a simple mark (the yellow key-ring glyph) — `icon.svg` + a 32×32 `favicon.ico`.
- [ ] **Step 2:** verify each file exists and is < 200 KB. Add a test `tests/assets.test.ts` asserting the five `public/**` files exist and each case study's `thumbnail.src` resolves to a real file.
- [ ] **Step 3: Run — PASS.**
- [ ] **Step 4: Commit** `chore: add optimised hero and case-study assets`.

---

### Task 19: Bundle-size CI gate

**Files:**
- Create: `scripts/check-bundle-size.mjs`, `tests/bundle-size.test.ts`
- Modify: `.github/workflows/ci.yml`, `package.json`

This is Task 1 of the superseded FASE-3 plan `docs/superpowers/plans/2026-08-19-studi-kasus-dan-guardrails.md` — reuse its code verbatim (Steps 1–4 there): `parseBudget`, `formatKb`, reads `.next/build-manifest.json`, gzips `rootMainFiles` + the `/[locale]` page chunks, `process.exit(1)` over budget.

- [ ] **Step 1–4:** copy that task's test + script. Budget arg default `150`.
- [ ] **Step 5:** `package.json` → `"check:size": "node scripts/check-bundle-size.mjs"`. `ci.yml` → after `npm run build`, run `npm run check:size` and `npx tsc --noEmit`.
- [ ] **Step 6: Run** `npm run build && npm run check:size` — must report the current total and pass under 150 KB. If the shell rebuild pushed it over, that is a finding: report the number, do not raise the budget without sign-off.
- [ ] **Step 7: Commit** `ci: gate initial JS bundle at 150 KB gzip`.

---

### Task 20: Full verification + e2e reconciliation

**Files:**
- Modify: `e2e/home.spec.ts` and any e2e that asserted the old single-page structure (e.g. `getByRole('link')).toHaveCount(3)` — rescope to `getByRole('link', {name: /SIAKAD|City Courier|MochiToon/})`).
- Modify: `tests/smoke.test.ts` if it referenced removed modules.

- [ ] **Step 1:** grep the test tree for assumptions that no longer hold (the old `case-study-card`, the flat homepage, `--color-accent: #4ADE80`, link counts). Fix each to describe the new structure. Watch each edited test fail against a deliberately wrong expectation once, then correct.
- [ ] **Step 2: Run the whole suite:**
  - `npm test` — all Vitest green.
  - `npm run test:e2e` — all Playwright green (shell, karya, home, routes, locale switch, `prefers-reduced-motion` disables transitions, keyboard reaches every nav link with a visible focus ring).
  - `npx tsc --noEmit` — clean.
  - `npm run build` — succeeds; `npm run check:size` — under budget.
- [ ] **Step 3:** manual Lighthouse spot-check (`npm run build && npm start`, Chrome DevTools) on `/id` and `/id/karya/city-courier`: Performance ≥ 90 mobile, Accessibility 100, CLS < 0.1. Record the numbers in the commit body. If Accessibility < 100, fix the specific audit before proceeding (usual suspects: heading order, `html-has-lang`, contrast, target size).
- [ ] **Step 4:** update `README.md` "Layout" table with the new routes and component list.
- [ ] **Step 5: Commit** `test: reconcile suite with the sidebar rebuild; verify budgets and a11y`.
- [ ] **Step 6:** push `main`, open the site, hand back to Ferry with the Lighthouse numbers and a short before/after.

---

## Self-Review

**Spec coverage** (`2026-08-30-ruang-kerja-design.md`):

| Spec section | Task(s) |
|---|---|
| §2 concept — character art, motion notes | 15 (hero), 18 (assets); key-ring WebGL stays out (spec §10 stretch) |
| §3 sidebar IA, nav labels id/en | 6, 7, 8 |
| §3 route inventory (8 routes + case detail) | 8, 13, 16 |
| §4 tokens — night + light, `data-theme` swap, no flash | 1, 2, 8 |
| §4 type scale, mono rule | enforced per component task; `no-hex` + mono checks in 1/12/15 |
| §4 contrast targets | values baked into Task 1 tokens; Lighthouse a11y in 20 |
| §5 image thumbnails, 3 sources | 10 (data), 12 (card), 13/15 (render), 18 (files) |
| §6 (Figma) | delivered in Plan A; this plan consumes it |
| §7 assets are ours | 17 (icons from our SVGs), 18 (our heroes/screenshots) |
| §8 file-level shape, testing, thresholds | matches the File Structure table; Task 19 budget, Task 20 thresholds |
| §8 Next 16 conventions (`proxy.ts`) | unchanged — `src/proxy.ts` already correct; no task reintroduces `middleware.ts` |

**Placeholder scan:** no "TBD/TODO/handle appropriately". The two large transcription tasks (10 case-study content, 14 message catalog) point at exact source docs and exact key lists rather than inlining thousands of words — acceptable per "repeat the code" spirit because the source is a committed file in this repo, not another task.

**Type / name consistency:** `Theme`, `THEMES`, `DEFAULT_THEME`, `THEME_STORAGE_KEY`, `themeInitScript` (Tasks 2/3/8). `CaseStudy`, `CaseStudySection`, `caseStudies`, `getAllCaseStudies`, `getCaseStudy` (Tasks 9/10/11/12/13/15). `NAV_ITEMS`, `NavItem`, `Nav` (Tasks 6/7). `ImageCard`, `CaseStudyBody`, `PillarCard`, `ResearchCard`, `ContactRow`, `Icon` — each defined once and consumed by name. `buildCaseStudyArticleSchema` (Task 11 → 13). Route segment `karya` (id) / `work` (en) via `routing.pathnames` (Task 4) used consistently in 11/12/13.

**Gaps found & closed during review:** added `common.visitApp` to Task 14's key list (used by `ImageCard` in Task 12); made Task 4 export `getPathname` explicitly (Task 12 depends on it); noted the `home.tagline` "I build software" substring coupling so Task 14 or Task 20 handles the existing e2e.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-08-30-ruang-kerja-code.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — the controller dispatches `codex` / `opencode` per task for the transcription-heavy tasks (1–6, 9–11, 14, 17, 19), reviews each with `superpowers:requesting-code-review`, and writes the judgement tasks (7, 8, 12, 13, 15, 16, 18, 20) directly. Fast iteration, review between tasks.

**2. Inline Execution** — the controller runs every task in-session with `superpowers:executing-plans`, batched with checkpoints.

**Which approach?**
