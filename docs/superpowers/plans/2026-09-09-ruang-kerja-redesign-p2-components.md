# Ruang Kerja Redesign — Phase 2: Shared Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build every shared component and data module the redesigned pages need — with unit tests — **without wiring any of them into pages yet**. Phase 3+ imports them.

**Architecture:** New data modules (`src/lib/skills.ts`, `src/content/career.ts`, extended `CaseStudy` type). New components under `src/components/`, one responsibility each, following the existing pattern (see `src/components/pillar-card.tsx`, `research-card.tsx`): named export, typed props object, Tailwind utility classes resolving to theme vars, `'use client'` only where interaction requires it. Brand SVGs are static assets copied from the design-preview sandbox (devicon, MIT — `public/design-preview/icons/LICENSE`).

**Tech Stack:** Next.js 16.3.3, React 19, next-intl 4, Tailwind CSS v4 (`@theme inline` vars), Vitest 4 + Testing Library + `@testing-library/user-event`, `next/og` (already used).

**Spec:** `docs/superpowers/specs/2026-09-09-ruang-kerja-personal-redesign.md` — §5 (component contracts), §6 (data model), §8 (i18n keys), §10 (budget). Read the relevant §5.x / §6 entry before each task.

## Global Constraints

- JS budget: **210 KB gzip** initial (`npm run check:size`). Current after Phase 1: **206.0 KB** — **4 KB headroom**. Measure after every client-component task (Tasks 5, 6, 8, 10). If a task pushes over ~208 KB, wrap that component's default export in `next/dynamic({ssr: false})` via a `*.lazy.tsx` sibling (pattern: `src/components/motion/counter.lazy.tsx`) and note it in the ledger.
- Brand SVGs are **static assets in `public/tech/`**, never bundled JS. Do not `import` them into `.tsx`.
- Two themes: components use `bg-surface` / `text-fg` / `text-fg-muted` / `border-border` / `text-accent` / `bg-accent` / `text-on-accent` / `bg-accent-dim` utilities only — never hard-coded hex. New `--brand` custom prop is set inline (`style={{'--brand': color}}`) and consumed via `color-mix`.
- `prefers-reduced-motion`: any transition ≤150 ms colour-only; hover overlays render in their shown state with `transition-none` under the media query (Tailwind `motion-reduce:` variant).
- Every user-facing string comes from `messages/{id,en}.json`; every new key is added to **both** files and to `tests/messages.test.ts` `requiredKeys`. Skill names and brand names are NOT translated; their group labels ARE.
- One `<h1>` per page rule is a page concern (Phase 3+); in Phase 2, `PageHeading` renders `<h1>`, `SectionHead` renders `<h2>`, cards render `<h3>`. Components are tested in isolation so multiple `<h1>` across test files is fine.
- Accessibility: interactive controls ≥44px min-height (`min-h-11`). Filter groups have `aria-label`. Live regions (`aria-live="polite"`) on filtered result containers. `<form role="search">` for the achievement filter. Focus-visible ring is global (globals.css) — don't re-style it.
- Windows env; use the Bash tool for POSIX. Commands: `npx tsc --noEmit`, `npm test`, `npx vitest run <file>`, `npm run check:size`, `npm run build`.
- Read `node_modules/next/dist/docs/` before Next-specific code.

---

## File Structure

| File | Responsibility |
|---|---|
| `public/tech/*.svg` (12) + `public/tech/LICENSE` | Brand logos for skill badges. Copied verbatim from `public/design-preview/icons/`. |
| `src/lib/skills.ts` | `Skill` type, `SKILLS` (12), `SKILL_GROUPS`. Pure data. |
| `src/content/career.ts` | `CareerEntry` type, `CAREER` (per-locale, 1 entry), `EDUCATION` (per-locale, empty). |
| `src/content/types.ts` | `CaseStudy` gains `type: 'Web'\|'Mobile'`, `topic: 'Pendidikan'\|'Keamanan'\|'Penulisan'`. |
| `src/content/case-studies/{siakad-informatika,city-courier,mochitoon}.ts` | Each of the 6 locale objects gets `type` + `topic`. |
| `src/components/section-head.tsx` | `SectionHead` — bordered heading block. |
| `src/components/page-heading.tsx` | `PageHeading` — page `<h1>` + lead. |
| `src/components/data-empty.tsx` | `DataEmpty` — dashed placeholder block. |
| `src/components/tech-badge-row.tsx` | `TechBadgeRow` — non-interactive brand-logo row. |
| `src/components/skill-list.tsx` | `SkillList` — filterable brand badges (`'use client'`). |
| `src/components/work-card.tsx` | `WorkCard` — case-study card with cover + hover action. |
| `src/components/work-filters.tsx` | `WorkFilters` — type + category pill filters (`'use client'`). |
| `src/components/career-card.tsx` | `CareerCard` + `Timeline` wrapper. |
| `src/components/publication-cover.tsx` | `PublicationCover` — the JUTIF cover block. |
| `src/components/achievement-card.tsx` | `AchievementCard`. |
| `src/components/achievement-filters.tsx` | `AchievementFilters` — search + 2 selects (`'use client'`). |
| `src/components/publication-list-card.tsx` | `PublicationListCard` + `PaperStory`. |
| `src/components/social-card.tsx` | `SocialCard` — github (link) / email (inert). |
| `src/components/contact-draft-form.tsx` | `ContactDraftForm` — clipboard draft, no send (`'use client'`). |
| `src/components/dashboard-stat.tsx` | `DashboardStat` + `ConnectionState` + `RepoGrid`. |
| `tests/*` | One `*.test.tsx` per component file above (render + ≥1 interaction/branch). |
| `messages/{id,en}.json`, `tests/messages.test.ts` | New keys per spec §8 (only the subset these components consume — see each task). |

---

## Task 1: Skills data + brand SVGs

**Files:**
- Create: `src/lib/skills.ts`
- Copy: `public/design-preview/icons/*.svg` (12) + `LICENSE` → `public/tech/`
- Modify: `messages/id.json`, `messages/en.json` (add `skills.groups.*`), `tests/messages.test.ts`
- Test: `tests/skills.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type SkillGroup = 'Frontend' | 'Backend' | 'Mobile' | 'Database' | 'Tools';
  export type Skill = {name: string; slug: string; group: SkillGroup; brandColor: string};
  export const SKILLS: Skill[];              // 12 entries
  export const SKILL_GROUPS: readonly ['Semua', 'Frontend', 'Backend', 'Mobile', 'Database', 'Tools'];
  ```
  Data verbatim from `public/design-preview/profile-sections.js` `profileSkills` (`name`, `slug`, `group`, `color` → `brandColor`).
  i18n: `skills.groups.semua|frontend|backend|mobile|database|tools` in both message files (id: "Semua/Frontend/Backend/Mobile/Basis Data/Perkakas"; en: "All/Frontend/Backend/Mobile/Database/Tools").

- [ ] **Step 1: Copy the SVGs**

```bash
mkdir -p public/tech
cp public/design-preview/icons/*.svg public/design-preview/icons/LICENSE public/tech/
ls public/tech/
```
Expected: `css3.svg flutter.svg git.svg html5.svg laravel.svg LICENSE nextjs.svg postgresql.svg react.svg supabase.svg tailwindcss.svg typescript.svg vitejs.svg`

- [ ] **Step 2: Write the failing test**

`tests/skills.test.ts`:
```ts
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {SKILLS, SKILL_GROUPS} from '@/lib/skills';

describe('skills data', () => {
  it('has 12 skills, each with a group in SKILL_GROUPS and a hex brandColor', () => {
    expect(SKILLS).toHaveLength(12);
    for (const s of SKILLS) {
      expect(SKILL_GROUPS).toContain(s.group);
      expect(s.brandColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('ships a brand SVG for every skill slug', () => {
    for (const s of SKILLS) {
      expect(existsSync(resolve(__dirname, `../public/tech/${s.slug}.svg`)), s.slug).toBe(true);
    }
  });

  it('SKILL_GROUPS starts with Semua and every non-Semua group is used', () => {
    expect(SKILL_GROUPS[0]).toBe('Semua');
    for (const g of SKILL_GROUPS.slice(1)) {
      expect(SKILLS.some((s) => s.group === g), g).toBe(true);
    }
  });
});
```

- [ ] **Step 3: Run — expect fail** (`npx vitest run tests/skills.test.ts` → module not found)

- [ ] **Step 4: Create `src/lib/skills.ts`** with the type, `SKILLS` (12 entries from `profileSkills`), `SKILL_GROUPS`.

- [ ] **Step 5: Add `skills.groups.*` to both message files; add the 6 keys to `tests/messages.test.ts` `requiredKeys`.**

- [ ] **Step 6: Run — expect pass** (`npx vitest run tests/skills.test.ts tests/messages.test.ts`)

- [ ] **Step 7: `npx tsc --noEmit && npm test` — all green. Commit.**

```bash
git add src/lib/skills.ts public/tech tests/skills.test.ts messages/id.json messages/en.json tests/messages.test.ts
git commit -m "feat(redesign): skills data + brand SVGs"
```

---

## Task 2: Case-study taxonomy (`type` + `topic`)

**Files:**
- Modify: `src/content/types.ts`, `src/content/case-studies/{siakad-informatika,city-courier,mochitoon}.ts`
- Modify: `messages/{id,en}.json` (`work.filters.*`), `tests/messages.test.ts`
- Test: `tests/content.test.ts` (create)

**Interfaces:**
- Produces: `CaseStudy['type']: 'Web' | 'Mobile'`, `CaseStudy['topic']: 'Pendidikan' | 'Keamanan' | 'Penulisan'`. Assignments: siakad → Web/Pendidikan, city-courier → Mobile/Keamanan, mochitoon → Web/Penulisan (spec §6). Both locales of each file get identical `type`/`topic`.
- i18n: `work.filters.typeLabel`, `work.filters.type.{semua,web,mobile}`, `work.filters.categoryLabel`, `work.filters.category.{semua,pendidikan,keamanan,penulisan}` in both files. id: "Tipe" / "Semua","Web","Mobile" / "Kategori" / "Semua","Pendidikan","Keamanan","Penulisan". en: "Type" / "All","Web","Mobile" / "Category" / "All","Education","Security","Writing".

- [ ] **Step 1: Write the failing test**

`tests/content.test.ts`:
```ts
import {describe, expect, it} from 'vitest';
import {getAllCaseStudies} from '@/lib/content';

describe('case study taxonomy', () => {
  it('every case study has a valid type and topic in both locales', () => {
    for (const locale of ['id', 'en'] as const) {
      for (const cs of getAllCaseStudies(locale)) {
        expect(['Web', 'Mobile']).toContain(cs.type);
        expect(['Pendidikan', 'Keamanan', 'Penulisan']).toContain(cs.topic);
      }
    }
  });

  it('assigns the documented taxonomy', () => {
    const bySlug = Object.fromEntries(getAllCaseStudies('id').map((c) => [c.slug, c]));
    expect(bySlug['siakad-informatika']).toMatchObject({type: 'Web', topic: 'Pendidikan'});
    expect(bySlug['city-courier']).toMatchObject({type: 'Mobile', topic: 'Keamanan'});
    expect(bySlug['mochitoon']).toMatchObject({type: 'Web', topic: 'Penulisan'});
  });
});
```

- [ ] **Step 2: Run — expect fail** (TS: `type`/`topic` not on `CaseStudy`).

- [ ] **Step 3: Add `type` + `topic` to the `CaseStudy` type; add the fields to all 6 locale objects.**

- [ ] **Step 4: Add `work.filters.*` to both message files + `tests/messages.test.ts`.**

- [ ] **Step 5: `npx vitest run tests/content.test.ts tests/messages.test.ts` → pass. `npx tsc --noEmit && npm test` → green. Commit.**

```bash
git commit -m "feat(redesign): case-study type + topic taxonomy"
```

---

## Task 3: Career + education data

**Files:**
- Create: `src/content/career.ts`
- Modify: `messages/{id,en}.json` (`about.career.*`, `about.education.*`), `tests/messages.test.ts`
- Test: `tests/career.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type CareerEntry = {
    role: string; organization: string; period: string;
    category: string; mark: string; description: string;
  };
  export const CAREER: Record<Locale, CareerEntry[]>;      // 1 entry per locale
  export const EDUCATION: Record<Locale, CareerEntry[]>;   // {id: [], en: []}
  ```
  CAREER content from `public/design-preview/profile-sections.js` `profileCareer` (id) — role "Guru Informatika", organization "SDN Ujung XIII/38", period "Mulai April 2026" (en: "Since April 2026"), category "Pendidikan" (en "Education"), mark "SD", description as given (translate for `en`).
- i18n: `about.career.title` ("Karier"/"Career"), `about.career.description`, `about.career.detailSummary` ("Tampilkan detail"/"Show detail"), `about.education.title` ("Pendidikan"/"Education"), `about.education.description`, `about.education.emptyTitle`, `about.education.emptyBody`.

- [ ] **Step 1: Write the failing test**

`tests/career.test.ts`:
```ts
import {describe, expect, it} from 'vitest';
import {CAREER, EDUCATION} from '@/content/career';

describe('career data', () => {
  it('has one career entry per locale with all fields', () => {
    for (const locale of ['id', 'en'] as const) {
      expect(CAREER[locale]).toHaveLength(1);
      const e = CAREER[locale][0];
      for (const k of ['role', 'organization', 'period', 'category', 'mark', 'description'] as const) {
        expect(typeof e[k], `${locale}.${k}`).toBe('string');
        expect(e[k].length).toBeGreaterThan(0);
      }
    }
  });

  it('education is intentionally empty (placeholder handled by the page)', () => {
    expect(EDUCATION.id).toEqual([]);
    expect(EDUCATION.en).toEqual([]);
  });
});
```

- [ ] **Step 2: Run — expect fail. Step 3: create `career.ts`. Step 4: add i18n keys + messages.test. Step 5: `vitest run` those + `tsc` + `npm test` → green. Commit.**

```bash
git commit -m "feat(redesign): career + education data (education scaffolded empty)"
```

---

## Task 4: Primitives — SectionHead, PageHeading, DataEmpty

Read spec §5 `SectionHead`, `DataEmpty`, `PageHeading` and `public/design-preview/preview.css` (`.section-head`, `.profile-page-heading`, `.data-empty`).

**Files:**
- Create: `src/components/section-head.tsx`, `src/components/page-heading.tsx`, `src/components/data-empty.tsx`
- Test: `tests/section-head.test.tsx`, `tests/page-heading.test.tsx`, `tests/data-empty.test.tsx`

**Interfaces:**
- Produces:
  ```ts
  // section-head.tsx
  export function SectionHead(props: {
    icon?: IconName; title: string; description?: string; aside?: ReactNode;
  }): JSX.Element;  // <div> with <h2> (optional leading <Icon>), optional <p>, optional right aside

  // page-heading.tsx
  export function PageHeading(props: {title: string; description: string}): JSX.Element;
  // <header> with <h1> + <p>, dashed bottom border

  // data-empty.tsx
  export function DataEmpty(props: {
    icon?: IconName; title: string; description: string; action?: ReactNode;
  }): JSX.Element;  // dashed-border block; title is an <h3>
  ```

- [ ] **Step 1: Write the failing tests** — one per component. Examples:

```tsx
// tests/section-head.test.tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {SectionHead} from '@/components/section-head';

describe('SectionHead', () => {
  it('renders the title as an h2 and the optional description', () => {
    render(<SectionHead title="Keahlian" description="Teknologi yang digunakan" />);
    expect(screen.getByRole('heading', {level: 2, name: /Keahlian/})).toBeInTheDocument();
    expect(screen.getByText('Teknologi yang digunakan')).toBeInTheDocument();
  });
  it('renders the aside node when given', () => {
    render(<SectionHead title="x" aside={<a href="/y">Semua →</a>} />);
    expect(screen.getByRole('link', {name: 'Semua →'})).toBeInTheDocument();
  });
});
```

```tsx
// tests/page-heading.test.tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {PageHeading} from '@/components/page-heading';

describe('PageHeading', () => {
  it('renders one h1 and the lead paragraph', () => {
    render(<PageHeading title="Karya" description="Aplikasi yang saya bangun." />);
    expect(screen.getByRole('heading', {level: 1, name: 'Karya'})).toBeInTheDocument();
    expect(screen.getByText('Aplikasi yang saya bangun.')).toBeInTheDocument();
  });
});
```

```tsx
// tests/data-empty.test.tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {DataEmpty} from '@/components/data-empty';

describe('DataEmpty', () => {
  it('renders the title (h3), description, and optional action', () => {
    render(<DataEmpty title="Belum ada" description="Nanti muncul di sini." action={<button>Reset</button>} />);
    expect(screen.getByRole('heading', {level: 3, name: 'Belum ada'})).toBeInTheDocument();
    expect(screen.getByText('Nanti muncul di sini.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Reset'})).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the 3 files — expect fail (modules not found).**
- [ ] **Step 3: Implement the 3 components** per spec §5 styling (`border-t` + `SectionHead` block; `PageHeading` `border-b border-dashed`; `DataEmpty` `border border-dashed rounded` + icon + text + action).
- [ ] **Step 4: Run the 3 files — expect pass. `npx tsc --noEmit && npm test` → green.**
- [ ] **Step 5: Commit**

```bash
git add src/components/section-head.tsx src/components/page-heading.tsx src/components/data-empty.tsx tests/section-head.test.tsx tests/page-heading.test.tsx tests/data-empty.test.tsx
git commit -m "feat(redesign): SectionHead, PageHeading, DataEmpty primitives"
```

---

## Task 5: Skill badges — TechBadgeRow, SkillList

Read spec §5 `SkillList`, `TechBadgeRow` and `public/design-preview/profile-sections.js` (the `.skills` render block) + `profile-sections.css` (`.skill-filters`, `.tech-badges`, `.tech-badge`).

**Files:**
- Create: `src/components/tech-badge-row.tsx`, `src/components/skill-list.tsx` (`'use client'`)
- Modify: `messages/{id,en}.json` (`skills.title`, `skills.description`, `skills.filterLabel`), `tests/messages.test.ts`
- Test: `tests/tech-badge-row.test.tsx`, `tests/skill-list.test.tsx`

**Interfaces:**
- Consumes: `SKILLS`, `SKILL_GROUPS`, `SkillGroup` from `@/lib/skills`; `useTranslations` from `next-intl`.
- Produces:
  ```ts
  // tech-badge-row.tsx — non-interactive, server-safe
  export function TechBadgeRow(props: {slugs: string[]; size?: number}): JSX.Element;
  // renders <img src={`/tech/${slug}.svg`} alt={skill name or slug} width/height={size ?? 24} loading="lazy">

  // skill-list.tsx — 'use client'
  export function SkillList(): JSX.Element;
  // SectionHead(icon="code", title=t('skills.title'), description=t('skills.description'))
  // + filter <div role="group" aria-label={t('skills.filterLabel')}> of buttons (label + count span), aria-pressed
  // + <ul aria-live="polite"> of badges: <li class="tech-badge" style={{'--brand': skill.brandColor}}>
  //     <img src={`/tech/${skill.slug}.svg`} alt="" width={19} height={19} loading="lazy"> {skill.name}
  //   background: color-mix(in srgb, var(--brand) 20%, var(--color-bg))
  ```
  Default active group = `'Semua'`. Clicking a filter sets state, re-filters, updates `aria-pressed`.
  i18n: `skills.title` ("Keahlian"/"Skills"), `skills.description` (id "Teknologi yang digunakan dalam karya saya." / en "Technology used across my work."), `skills.filterLabel` ("Filter kategori keahlian"/"Filter skills by category").

- [ ] **Step 1: Write failing tests**

```tsx
// tests/skill-list.test.tsx
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) =>
    ({'skills.title': 'Keahlian', 'skills.description': 'Teknologi', 'skills.filterLabel': 'Filter kategori keahlian'}[k] ?? k)
}));

import {SkillList} from '@/components/skill-list';

describe('SkillList', () => {
  it('shows all skills by default and filters to a group on click', async () => {
    const user = userEvent.setup();
    render(<SkillList />);
    // 12 skills visible under "Semua"
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
    await user.click(screen.getByRole('button', {name: /Backend/}));
    // only Laravel is Backend
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Laravel');
    expect(screen.getByRole('button', {name: /Backend/})).toHaveAttribute('aria-pressed', 'true');
  });

  it('each badge references its /tech/<slug>.svg asset', () => {
    render(<SkillList />);
    const react = screen.getByText('React').closest('li');
    expect(react?.querySelector('img')).toHaveAttribute('src', '/tech/react.svg');
  });
});
```

```tsx
// tests/tech-badge-row.test.tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {TechBadgeRow} from '@/components/tech-badge-row';

describe('TechBadgeRow', () => {
  it('renders one lazy img per slug pointing at /tech/', () => {
    render(<TechBadgeRow slugs={['nextjs', 'react', 'supabase']} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs).toHaveLength(3);
    expect(imgs[0]).toHaveAttribute('src', '/tech/nextjs.svg');
    expect(imgs[0]).toHaveAttribute('loading', 'lazy');
  });
});
```

- [ ] **Step 2: Run — expect fail. Step 3: implement both. Step 4: add i18n keys + messages.test. Step 5: run tests + `tsc` + `npm test` → green.**
- [ ] **Step 6: `npm run check:size` — record. If > ~208 KB, add `src/components/skill-list.lazy.tsx` and note it.**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat(redesign): TechBadgeRow + filterable SkillList"
```

---

## Task 6: Work cards — WorkCard, WorkFilters

Read spec §5 `WorkCard`, `WorkFilters` and `public/design-preview/portfolio-pages.js` (`workCard`, the `routePage==='work'` block) + `portfolio-pages.css` (`.work-card`, `.work-cover`, `.featured-label`, `.cover-action`, `.work-filters`).

**Files:**
- Create: `src/components/work-card.tsx`, `src/components/work-filters.tsx` (`'use client'`)
- Modify: `messages/{id,en}.json` (`work.cardCta`, `work.count`, `work.empty.title`, `work.empty.body`, `work.coverAction`), `tests/messages.test.ts`
- Test: `tests/work-card.test.tsx`, `tests/work-filters.test.tsx`

**Interfaces:**
- Consumes: `CaseStudy` from `@/content/types`; `getPathname` from `@/i18n/navigation` (localised slug link — see how `src/components/image-card.tsx` does it); `TechBadgeRow`; `SectionHead`/`DataEmpty` (filters).
- Produces:
  ```ts
  // work-card.tsx — server-safe
  export function WorkCard(props: {caseStudy: CaseStudy; locale: Locale}): JSX.Element;
  // <article>: cover <a href={localised /karya/[slug]}> with <img /karya/<slug>.webp aspect-[1.8]>,
  //   {featured && <span>{t('work.filters... ' or a literal 'Pilihan' key)}</span>},
  //   <span class="cover-action motion-reduce:transition-none">{t('work.coverAction')}</span>
  // body: <span>{topic} · {type}</span>, <h3><a>{title}</a></h3>, <p>{tagline}</p>,
  //   <TechBadgeRow slugs={stackSlugs}>, <a>{t('work.cardCta')} →</a>
  // NOTE: map caseStudy.stack (names) to slugs via SKILLS (name->slug); skip unknown.

  // work-filters.tsx — 'use client'
  export function WorkFilters(props: {
    caseStudies: CaseStudy[]; locale: Locale;
  }): JSX.Element;
  // two role="group" rows (aria-label from work.filters.typeLabel / categoryLabel),
  //   pill buttons Semua/Web/Mobile and Semua/Pendidikan/Keamanan/Penulisan, aria-pressed
  // <p role="status">{t('work.count', {n})}</p>  (ICU plural-free: "{n} karya")
  // <ul> of <WorkCard> for the filtered set; empty -> <DataEmpty title=work.empty.title body=work.empty.body>
  ```
  i18n: `work.cardCta` ("Cerita di balik proyek"/"The story behind it"), `work.coverAction` ("Lihat detail ↗"/"View details ↗"), `work.count` (id "{n} karya" en "{n} projects"), `work.empty.title` (id "Belum ada karya dalam kombinasi ini" en "No projects in this combination"), `work.empty.body` (id "Pilih Semua pada tipe atau kategori." en "Choose All for type or category."), `work.featuredLabel` ("Pilihan"/"Featured").

- [ ] **Step 1: Write failing tests**

```tsx
// tests/work-card.test.tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  getPathname: ({href}: any) => (typeof href === 'string' ? href : `/karya/${href.params.slug}`)
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => k
}));

import {WorkCard} from '@/components/work-card';

const cs = {
  slug: 'city-courier', title: 'City Courier', tagline: 'Kurir + keamanan.',
  year: 2026, stack: ['Flutter', 'Laravel'], featured: true, type: 'Mobile', topic: 'Keamanan',
  thumbnail: {src: '/karya/city-courier.webp', alt: 'x'}, sections: []
} as any;

describe('WorkCard', () => {
  it('links the cover + title to the localised case study and shows topic · type', () => {
    render(<WorkCard caseStudy={cs} locale="id" />);
    const links = screen.getAllByRole('link');
    expect(links.every((a) => a.getAttribute('href') === '/karya/city-courier')).toBe(true);
    expect(screen.getByRole('heading', {level: 3, name: 'City Courier'})).toBeInTheDocument();
    expect(screen.getByText(/Keamanan · Mobile/)).toBeInTheDocument();
  });

  it('shows the featured label only when featured', () => {
    render(<WorkCard caseStudy={{...cs, featured: false}} locale="id" />);
    expect(screen.queryByText('work.featuredLabel')).toBeNull();
  });

  it('renders the cover image from /karya and tech logos from /tech', () => {
    render(<WorkCard caseStudy={cs} locale="id" />);
    expect(screen.getByAltText('x')).toHaveAttribute('src', '/karya/city-courier.webp');
    expect(screen.getByAltText('Flutter')).toHaveAttribute('src', '/tech/flutter.svg');
  });
});
```

```tsx
// tests/work-filters.test.tsx  (mock next-intl + @/i18n/navigation as above)
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// ... same mocks ...
import {WorkFilters} from '@/components/work-filters';

const list = [
  {slug: 'a', title: 'A', tagline: '', year: 2026, stack: [], featured: true, type: 'Web', topic: 'Pendidikan', thumbnail: {src: '', alt: 'a'}, sections: []},
  {slug: 'b', title: 'B', tagline: '', year: 2026, stack: [], featured: false, type: 'Mobile', topic: 'Keamanan', thumbnail: {src: '', alt: 'b'}, sections: []}
] as any[];

describe('WorkFilters', () => {
  it('counts all by default then narrows by type', async () => {
    const user = userEvent.setup();
    render(<WorkFilters caseStudies={list} locale="id" />);
    expect(screen.getByRole('status')).toHaveTextContent('2');
    await user.click(screen.getByRole('button', {name: 'Mobile'}));
    expect(screen.getByRole('status')).toHaveTextContent('1');
    expect(screen.getByRole('heading', {name: 'B'})).toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'A'})).toBeNull();
  });

  it('shows the empty state for an impossible combination', async () => {
    const user = userEvent.setup();
    render(<WorkFilters caseStudies={list} locale="id" />);
    await user.click(screen.getByRole('button', {name: 'Mobile'}));
    await user.click(screen.getByRole('button', {name: 'Pendidikan'}));
    expect(screen.getByText('work.empty.title')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — fail. Step 3: implement. Step 4: i18n + messages.test. Step 5: tests + tsc + npm test green. Step 6: `npm run check:size` — record; lazy-wrap `work-filters` if over. Step 7: commit.**

```bash
git commit -m "feat(redesign): WorkCard + WorkFilters"
```

---

## Task 7: Timeline — CareerCard + Timeline

Read spec §5 `Timeline` + `CareerCard` and `public/design-preview/profile-sections.css` (`.career-card`, `.organization-mark`, `details`, `summary`).

**Files:**
- Create: `src/components/career-card.tsx` (exports `CareerCard` and `Timeline`)
- Test: `tests/career-card.test.tsx`

**Interfaces:**
- Consumes: `CareerEntry` from `@/content/career`; `useTranslations` (for `about.career.detailSummary`).
- Produces:
  ```ts
  export function CareerCard(props: {entry: CareerEntry}): JSX.Element;
  // <article>: <div class="organization-mark">{mark}</div>
  //   <div>: <h3>{role}</h3> <p>{organization}</p> <small>{period} · {category}</small>
  //   <details><summary>{t('about.career.detailSummary')}</summary><p>{description}</p></details>
  export function Timeline(props: {entries: CareerEntry[]; children?: ReactNode}): JSX.Element;
  // renders <CareerCard> per entry; if entries is empty, renders `children` (the page passes a <DataEmpty>)
  ```

- [ ] **Step 1: Write failing test**

```tsx
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({useTranslations: () => (k: string) => k}));
import {CareerCard, Timeline} from '@/components/career-card';

const entry = {role: 'Guru Informatika', organization: 'SDN Ujung XIII/38', period: 'Mulai April 2026', category: 'Pendidikan', mark: 'SD', description: 'Mengajar kelas 4-6.'};

describe('CareerCard', () => {
  it('shows role, org, period · category, and reveals the description on expand', async () => {
    const user = userEvent.setup();
    render(<CareerCard entry={entry} />);
    expect(screen.getByRole('heading', {level: 3, name: 'Guru Informatika'})).toBeInTheDocument();
    expect(screen.getByText('SDN Ujung XIII/38')).toBeInTheDocument();
    expect(screen.getByText(/Mulai April 2026 · Pendidikan/)).toBeInTheDocument();
    expect(screen.queryByText('Mengajar kelas 4-6.')).not.toBeVisible();
    await user.click(screen.getByText('about.career.detailSummary'));
    expect(screen.getByText('Mengajar kelas 4-6.')).toBeVisible();
  });
});

describe('Timeline', () => {
  it('renders a card per entry, or the fallback when empty', () => {
    const {rerender} = render(<Timeline entries={[entry]} />);
    expect(screen.getByRole('heading', {level: 3, name: 'Guru Informatika'})).toBeInTheDocument();
    rerender(<Timeline entries={[]}>{<p>empty-fallback</p>}</Timeline>);
    expect(screen.getByText('empty-fallback')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: fail → Step 3: implement → Step 4: tests + tsc + npm test → Step 5: commit** `"feat(redesign): CareerCard + Timeline"`

---

## Task 8: Achievements — PublicationCover, AchievementCard, AchievementFilters

Read spec §5 achievements block and `public/design-preview/profile-sections.js` (`currentPage==='achievements'` block) + `profile-sections.css` (`.achievement-*`, `.publication-cover`, `.record-*`).

**Files:**
- Create: `src/components/publication-cover.tsx`, `src/components/achievement-card.tsx`, `src/components/achievement-filters.tsx` (`'use client'`)
- Modify: `messages/{id,en}.json` (`achievements.filters.*`, `achievements.total`, `achievements.empty.*`, `achievements.reset`, `achievements.dataNote`, `achievements.detailSummary`), `tests/messages.test.ts`
- Test: `tests/publication-cover.test.tsx`, `tests/achievement-card.test.tsx`, `tests/achievement-filters.test.tsx`

**Interfaces:**
- Produces:
  ```ts
  export type Achievement = {
    title: string; issuer: string; year: string;
    type: 'Publikasi' | 'Sertifikat'; category: 'Keamanan' | 'Pendidikan' | 'Pengembangan';
    description: string; url?: string;
  };
  export function PublicationCover(props: {size?: 'grid' | 'list'}): JSX.Element; // static JUTIF cover
  export function AchievementCard(props: {item: Achievement}): JSX.Element;
  export function AchievementFilters(props: {items: Achievement[]}): JSX.Element;
  // <form role="search"> (preventDefault): search input + Jenis <select> + Kategori <select>
  // <p role="status">{t('achievements.total', {n})}</p>
  // grid of <AchievementCard>; no match -> <DataEmpty ... action={<button>{t('achievements.reset')}</button>}>
  // reset button restores the form and re-renders
  ```
  The single real achievement (JUTIF publication) comes from a constant in `achievement-filters.tsx` for now (spec §6: "keep the existing single publication"); the page will pass it in Phase 5. Export `PUBLICATION: Achievement` from `src/content/career.ts`? — no; put `export const ACHIEVEMENTS: Achievement[]` in a new `src/content/achievements.ts` (Step adds it here, one entry, from `profile-sections.js` `profileAchievements[0]`, both-locale via `Record<Locale, Achievement[]>`).
- i18n: `achievements.filters.searchLabel` ("Cari pencapaian"/"Search achievements"), `achievements.filters.searchPlaceholder`, `achievements.filters.typeLabel` ("Jenis"/"Type"), `achievements.filters.type.{semua,publikasi,sertifikat}`, `achievements.filters.categoryLabel`, `achievements.filters.category.{semua,keamanan,pendidikan,pengembangan}`, `achievements.total` ("Total: {n}"), `achievements.empty.title` ("Tidak ada hasil yang cocok"/"No matching results"), `achievements.empty.body`, `achievements.reset` ("Hapus filter"/"Clear filters"), `achievements.dataNote`, `achievements.detailSummary` ("Detail publikasi"/"Publication details").

- [ ] **Step 1: failing tests** (one per component; the filter test: type a non-matching query → `DataEmpty` shows; click reset → cards back). **Step 2: fail. Step 3: implement + `src/content/achievements.ts`. Step 4: i18n + messages.test. Step 5: tests + tsc + npm test. Step 6: check:size (lazy-wrap filter if over). Step 7: commit** `"feat(redesign): achievement cover, card, filters + data"`

---

## Task 9: Research — PublicationListCard + PaperStory

Read spec §5 research block and `public/design-preview/portfolio-pages.js` (`routePage==='research'||'paper'`) + `.research-list-card`, `.project-story`.

**Files:**
- Create: `src/components/publication-list-card.tsx` (exports `PublicationListCard`, `PaperStory`)
- Modify: `messages/{id,en}.json` (`research.count`, `research.listCardCta`, `research.paper.*` story headings), `tests/messages.test.ts`
- Test: `tests/publication-list-card.test.tsx`

**Interfaces:**
- Consumes: `ACHIEVEMENTS` from `src/content/achievements.ts`, `PublicationCover`, `TechBadgeRow`(no) — `SectionHead`. `buildScholarlyArticleSchema` from `@/lib/jsonld` stays with the page, not here.
- Produces:
  ```ts
  export function PublicationListCard(props: {item: Achievement; href: string}): JSX.Element;
  // <article>: <a href={href}>{<PublicationCover size="list"/>}</a> + body: category eyebrow, <h3><a href>{title}</a>,
  //   <p>{description}</p>, record-tags, <a href>{t('research.listCardCta')} →</a>
  export function PaperStory(props: {item: Achievement}): JSX.Element;
  // <PublicationCover size="list"/> + <article> of 4 <section><h2>..</h2><p>..</p>: Fokus, Metode, Publikasi (link to url), Proyek terkait (link to /karya/city-courier)
  ```
- i18n: `research.count` ("{n} publikasi"/"{n} publication"), `research.listCardCta` ("Lihat penelitian"/"See the research"), `research.paper.focusTitle`, `research.paper.focusBody`, `research.paper.methodTitle`, `research.paper.methodBody`, `research.paper.pubTitle`, `research.paper.relatedTitle`, `research.paper.readAtPublisher` ("Baca naskah di penerbit ↗").

- [ ] **Steps 1–5 as before. Commit** `"feat(redesign): PublicationListCard + PaperStory"`

---

## Task 10: Contact — SocialCard + ContactDraftForm

Read spec §5 contact block and `public/design-preview/portfolio-pages.js` (`routePage==='contact'`) + `.social-card`, `.github-card`, `.email-card`, `#contact-draft`.

**Files:**
- Create: `src/components/social-card.tsx`, `src/components/contact-draft-form.tsx` (`'use client'`)
- Modify: `messages/{id,en}.json` (`contact.connectTitle`, `contact.github.*`, `contact.email.*`, `contact.form.*`), `tests/messages.test.ts`
- Test: `tests/social-card.test.tsx`, `tests/contact-draft-form.test.tsx`

**Interfaces:**
- Produces:
  ```ts
  export function SocialCard(props: {variant: 'github' | 'email'}): JSX.Element;
  // github: <a href="https://github.com/Pratametheus" target="_blank" rel="noopener noreferrer">, icon 'code',
  //   <h3>{t('contact.github.title')}</h3> <p>{t('contact.github.body')}</p> <strong>{t('contact.github.cta')} ↗</strong>
  // email: <div> (no link), icon 'contact', title/body from contact.email.*, <small>{t('contact.email.status')}</small>

  export function ContactDraftForm(props: {}): JSX.Element;   // 'use client'
  // <form> (onSubmit preventDefault): Nama <input required>, Email <input type=email required>, Pesan <textarea required>
  //   <button type="submit">{t('contact.form.submit')}</button>
  //   <p role="status" id="copy-status">
  // onSubmit: navigator.clipboard.writeText(`Dari: ${name} <${email}>\n\n${message}`)
  //   -> status = t('contact.form.statusOk'); catch -> t('contact.form.statusFail'). NEVER sends anything.
  ```
- i18n: `contact.connectTitle` ("Mari terhubung"/"Let's connect"), `contact.github.{title,body,cta}`, `contact.email.{title,body,status}` (status: "Belum terhubung"/"Not connected"), `contact.form.{prepareTitle,note,name,email,message,submit,statusOk,statusFail}`. statusOk id "Draf disalin. Belum ada pesan yang dikirim." en "Draft copied. Nothing was sent." statusFail id "Browser tidak mengizinkan akses clipboard. Salin pesan secara manual." en "Clipboard blocked by the browser. Copy the message manually."

- [ ] **Step 1: failing tests.** The form test mocks `navigator.clipboard.writeText`:

```tsx
// tests/contact-draft-form.test.tsx
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({useTranslations: () => (k: string) => k}));
import {ContactDraftForm} from '@/components/contact-draft-form';

describe('ContactDraftForm', () => {
  it('copies a formatted draft to the clipboard and never fetches', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {clipboard: {writeText}});
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    render(<ContactDraftForm />);
    await user.type(screen.getByLabelText('contact.form.name'), 'Rin');
    await user.type(screen.getByLabelText('contact.form.email'), 'rin@example.com');
    await user.type(screen.getByLabelText('contact.form.message'), 'Halo');
    await user.click(screen.getByRole('button', {name: 'contact.form.submit'}));
    expect(writeText).toHaveBeenCalledWith('Dari: Rin <rin@example.com>\n\nHalo');
    expect(screen.getByRole('status')).toHaveTextContent('contact.form.statusOk');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reports a clipboard failure without throwing', async () => {
    Object.assign(navigator, {clipboard: {writeText: vi.fn().mockRejectedValue(new Error('no'))}});
    const user = userEvent.setup();
    render(<ContactDraftForm />);
    await user.type(screen.getByLabelText('contact.form.name'), 'A');
    await user.type(screen.getByLabelText('contact.form.email'), 'a@b.co');
    await user.type(screen.getByLabelText('contact.form.message'), 'x');
    await user.click(screen.getByRole('button', {name: 'contact.form.submit'}));
    expect(screen.getByRole('status')).toHaveTextContent('contact.form.statusFail');
  });
});
```

- [ ] **Steps 2–7 as before (incl. check:size). Commit** `"feat(redesign): SocialCard + ContactDraftForm (clipboard only, no send)"`

---

## Task 11: Dashboard — DashboardStat, ConnectionState, RepoGrid

Read spec §5 dashboard block and `public/design-preview/portfolio-pages.js` (`routePage==='dashboard'`) + `.dashboard-*`, `.connection-state`, `.repo-grid`.

**Files:**
- Create: `src/components/dashboard-stat.tsx` (exports `DashboardStat`, `ConnectionState`, `RepoGrid`)
- Modify: `messages/{id,en}.json` (`dashboard.notConnected`, `dashboard.statValueLabel`), `tests/messages.test.ts`
- Test: `tests/dashboard-stat.test.tsx`

**Interfaces:**
- Consumes: `useTranslations`; `CaseStudy` + `getPathname` (RepoGrid links the 3 case studies).
- Produces:
  ```ts
  export function DashboardStat(props: {label: string}): JSX.Element;
  // <div>: <span>{label}</span> <strong aria-label={t('dashboard.statValueLabel')}>—</strong> <small>{t('dashboard.notConnected')}</small>
  export function ConnectionState(props: {title: string; description: string}): JSX.Element;   // dashed block
  export function RepoGrid(props: {caseStudies: CaseStudy[]; locale: Locale}): JSX.Element;
  // grid of <a href={localised /karya/[slug]}>: <h3>{title} ↗</h3> <p>{tagline}</p> <small>{stack.join(' · ')}</small>
  ```
  **No fabricated numbers anywhere** — every stat value is the literal `—`.
- i18n: `dashboard.notConnected` ("Belum terhubung"/"Not connected"), `dashboard.statValueLabel` ("Belum tersedia"/"Not available").

- [ ] **Step 1: failing test**

```tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
vi.mock('next-intl', () => ({useTranslations: () => (k: string) => k}));
vi.mock('@/i18n/navigation', () => ({getPathname: ({href}: any) => `/karya/${href.params.slug}`}));
import {DashboardStat, RepoGrid} from '@/components/dashboard-stat';

describe('DashboardStat', () => {
  it('renders an em dash value and the not-connected note — no numbers', () => {
    render(<DashboardStat label="Pengikut" />);
    expect(screen.getByText('Pengikut')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('dashboard.notConnected')).toBeInTheDocument();
  });
});

describe('RepoGrid', () => {
  it('links each case study by localised slug', () => {
    const cs = [{slug: 'mochitoon', title: 'MochiToon', tagline: 't', stack: ['React'], sections: []}] as any[];
    render(<RepoGrid caseStudies={cs} locale="id" />);
    expect(screen.getByRole('link', {name: /MochiToon/})).toHaveAttribute('href', '/karya/mochitoon');
  });
});
```

- [ ] **Steps 2–5. Commit** `"feat(redesign): DashboardStat + ConnectionState + RepoGrid"`

---

## Task 12: Phase-2 verification gate

**Files:** none.

- [ ] **Step 1:** `npx tsc --noEmit` → clean.
- [ ] **Step 2:** `npm test` → all pass (baseline 127 + ~30 new). Record count.
- [ ] **Step 3:** `npm run check:size` → ≤ 210.0 KB. Record. If any client component pushed it over and wasn't lazy-wrapped, do so now and re-measure.
- [ ] **Step 4:** `npm run build` → `✓ Compiled successfully`, 34 static pages (no new routes in Phase 2), no warnings.
- [ ] **Step 5:** `npx playwright test` → 80 pass (no page wiring changed).
- [ ] **Step 6:** Append a "Phase 2 — Shared Components (2026-09-09)" section to `docs/superpowers/SDD-ledger.md`: the component list, `src/content/achievements.ts` added, any `*.lazy.tsx` wrappers and why, `public/tech/` asset weight, final numbers (unit / e2e / tsc / build / check:size). Commit `"docs(ledger): Phase 2 shared components"`.

---

## Self-Review

**Spec coverage (§5 component → task):** SectionHead/PageHeading/DataEmpty → T4. SkillList/TechBadgeRow → T5. WorkCard/WorkFilters → T6. Timeline/CareerCard → T7. AchievementFilters/AchievementCard/PublicationCover → T8. PublicationListCard/PaperStory → T9. SocialCard/ContactDraftForm → T10. DashboardStat/ConnectionState/RepoGrid → T11. §6 data: skills → T1, CaseStudy type/topic → T2, career/education → T3, achievements → T8 (`src/content/achievements.ts`). §8 i18n: each task adds only the keys its components read; the page-level keys (hello, biography prose, dashboard section titles, etc.) land in Phase 3–6 with the pages that use them. §10 budget: measured in T5/T6/T8/T10 + T12, lazy-wrap escape hatch specified.

**Placeholder scan:** No "TBD"/"handle errors"/"similar to". Every task has ≥1 concrete test with assertions. Styling detail is delegated to the spec §5 entry + the named sandbox CSS class — the executor reads those, they are not placeholders.

**Type consistency:** `Skill`/`SkillGroup`/`SKILLS`/`SKILL_GROUPS` (T1) consumed by T5, T6 (name→slug map), T11 label list. `CaseStudy.type`/`.topic` (T2) consumed by T6, T11. `CareerEntry`/`CAREER`/`EDUCATION` (T3) consumed by T7. `Achievement`/`ACHIEVEMENTS` (T8, in `src/content/achievements.ts`) consumed by T9. `getPathname` localised-slug pattern (from `image-card.tsx`) used by T6, T11. `SectionHead`/`DataEmpty` (T4) consumed by T5, T6, T8.

**Gaps:** none for Phase 2 scope. Components are unwired — `next build` page count stays 34, e2e unchanged. Phase 3 is the first wiring.
