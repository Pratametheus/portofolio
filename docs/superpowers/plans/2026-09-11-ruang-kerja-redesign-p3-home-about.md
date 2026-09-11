# Ruang Kerja Redesign — Phase 3: Wire Beranda + Tentang — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/` (Beranda) and `/tentang` (Tentang) on the Phase 1 shell using the Phase 2 components, per spec §7. First real pages in the "Personal" direction — everything before this phase was foundation and unwired components.

**Architecture:** Home and Tentang are independent page rewrites sharing one new component (`SiteFooter`) and several Phase 2 components (`SkillList`, `WorkCard`, `SectionHead`, `Timeline`/`CareerCard`, `DataEmpty`). Both pages **stop** using `PillarCard`, the illustrated hero (`ScrollSpin`, `hero/*.webp`), `ImageCard`, `ContactRow`, and `MagneticButton` — per spec §9, those components stay in the repo (removal is a Phase 5 decision) but this phase orphans them from `page.tsx`. The current uncommitted WIP in `page.tsx`/`pillar-card.tsx` (a partial restyle of the OLD structure, predating the Phase 2 components) is **discarded**, not built on — it doesn't match the spec's target layout.

**Tech Stack:** Next.js 16.3.3 App Router, next-intl 4 (`getTranslations` server-side), Tailwind v4, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-09-ruang-kerja-personal-redesign.md` — §7 (home + about rows), §8 (i18n retirements), §9 (ScrollSpin/PillarCard disposition), §11 Phase 3 row.

## Global Constraints

- One `<h1>` per page — home's `<h1>` is `home.helloHeading`; Tentang keeps `about.title` as its `<h1>`.
- JS budget **210 KB gzip**. Current **206.0 KB**. Wiring `SkillList` (client) and `WorkCard`/`SiteFooter` (server) into two pages, for the first time, is the real test of the Phase 2 budget headroom — measure after each page task; if either page's route pushes the shared client bundle over 208 KB, that page's filter/interactive piece needs a `next/dynamic({ssr:false})` wrapper (pattern already used by `src/components/motion/*.lazy.tsx`).
- Bilingual id/en — every new string in both `messages/id.json` and `messages/en.json`, every new key added to `tests/messages.test.ts` `requiredKeys`, every retired key removed from both files and from `requiredKeys`.
- `prefers-reduced-motion` and Lighthouse Accessibility 100 stay binding; keep `Reveal`/`Stagger` wraps on new sections the same way the current page uses them.
- Windows env; Bash tool for POSIX commands. `npx tsc --noEmit`, `npm test`, `npx playwright test`, `npm run build`, `npm run check:size`.
- Read `node_modules/next/dist/docs/` before Next-specific code.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/site-footer.tsx` | New. Shared footer: title + description + GitHub link + copyright. Used by every page from here on. |
| `src/app/[locale]/page.tsx` | Rewritten: hello (h1) → `SkillList` → "Karya pilihan" (`SectionHead` + featured `WorkCard`s) → Riset callout → `SiteFooter`. Discards the uncommitted WIP. |
| `src/components/pillar-card.tsx` | Reverted to its last committed state (the uncommitted WIP edit is stale once home stops using it) — file stays, orphaned, for a Phase 5 decision. |
| `src/app/[locale]/tentang/page.tsx` | Rewritten: `about.title` (h1) + biography paragraphs → Karier (`SectionHead` + `Timeline`) → Pendidikan (`SectionHead` + `Timeline` empty → `DataEmpty`) → `SkillList` → `SiteFooter`. |
| `messages/{id,en}.json` | `footer.*` (new), `home.hello*`/`home.intro*`/`home.aboutLink`/`home.selectedWorkAll`/`home.research*` (new); `home.eyebrow`/`tagline`/`statement`/`pillarsTitle`/`pillars.*`/`heroAlt`/`researchTitle`/`contactTitle`/`contactCta` (retired — removed). |
| `tests/messages.test.ts` | `requiredKeys` updated to match (additions + removals). |
| `e2e/home.spec.ts` | Rewritten to match the new DOM (no pillars, no full hero image test here, only 2 featured cards on home, "Semua karya" link). |
| `e2e/motion.spec.ts` | Hero-rotation tests removed (home has no `<figure>`/hero art anymore — `ScrollSpin` primitive itself is untouched, still covered by `tests/motion/scroll-spin.test.tsx`). "research stat" test retargeted from `/id` to `/id/riset`, where the old `ResearchCard`+`Counter` still lives untouched until Phase 5. "selected-work cards" test updated to the 2 featured cards + the "Semua karya" link to `/karya`. |

---

## Task 1: `SiteFooter`

**Files:**
- Create: `src/components/site-footer.tsx`
- Modify: `messages/id.json`, `messages/en.json` (new `footer` namespace), `tests/messages.test.ts`
- Test: `tests/site-footer.test.tsx`

**Interfaces:**
- Produces: `export function SiteFooter(): JSX.Element` — no props, reads its own `useTranslations('footer')`. Renders a `<footer>` with: `<h2>` title, `<p>` description, an external GitHub `<a>`, and a `<small>` copyright line spanning full width.
- i18n (new `footer` namespace, both files):
  - `footer.title` — id "Ada yang ingin dikerjakan bersama?" / en "Got something to work on together?"
  - `footer.description` — id "Produk, kelas, atau riset. Mulai dari konteksnya." / en "A product, a class, or research. Start from the context."
  - `footer.githubCta` — id "Temui saya di GitHub" / en "Find me on GitHub"
  - `footer.copyright` — id "© 2026 Ferry Andhika Pratama" / en "© 2026 Ferry Andhika Pratama"

- [ ] **Step 1: Write the failing test**

```tsx
// tests/site-footer.test.tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) =>
    ({
      title: 'Ada yang ingin dikerjakan bersama?',
      description: 'Produk, kelas, atau riset. Mulai dari konteksnya.',
      githubCta: 'Temui saya di GitHub',
      copyright: '© 2026 Ferry Andhika Pratama'
    }[k] ?? k)
}));

import {SiteFooter} from '@/components/site-footer';

describe('SiteFooter', () => {
  it('renders the title as an h2, the description, and a copyright line', () => {
    render(<SiteFooter />);
    expect(screen.getByRole('heading', {level: 2, name: 'Ada yang ingin dikerjakan bersama?'})).toBeInTheDocument();
    expect(screen.getByText('Produk, kelas, atau riset. Mulai dari konteksnya.')).toBeInTheDocument();
    expect(screen.getByText('© 2026 Ferry Andhika Pratama')).toBeInTheDocument();
  });

  it('links to GitHub in a new tab', () => {
    render(<SiteFooter />);
    const link = screen.getByRole('link', {name: /Temui saya di GitHub/});
    expect(link).toHaveAttribute('href', 'https://github.com/Pratametheus');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
```

- [ ] **Step 2: Run — expect fail** (`npx vitest run tests/site-footer.test.tsx` → module not found)

- [ ] **Step 3: Add the `footer` namespace to `messages/id.json` and `messages/en.json`** with the 4 keys above (place the namespace after `links`, before `metadata`, or wherever fits the existing file's ordering — check the file first). Add `'footer.title'`, `'footer.description'`, `'footer.githubCta'`, `'footer.copyright'` to `tests/messages.test.ts` `requiredKeys`.

- [ ] **Step 4: Create `src/components/site-footer.tsx`:**

```tsx
import {useTranslations} from 'next-intl';

export function SiteFooter() {
  const t = useTranslations('footer');

  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pb-8 pt-6">
      <div>
        <h2 className="font-display text-[17px] text-fg">{t('title')}</h2>
        <p className="mt-1 text-xs text-fg-muted">{t('description')}</p>
      </div>
      <a
        href="https://github.com/Pratametheus"
        target="_blank"
        rel="noopener noreferrer"
        className="border-b border-accent pb-0.5 text-xs text-accent transition-colors hover:text-fg"
      >
        {t('githubCta')} <span aria-hidden="true">↗</span>
      </a>
      <small className="w-full text-[10px] text-fg-muted">{t('copyright')}</small>
    </footer>
  );
}
```

- [ ] **Step 5: Run the test — expect pass.** `npx tsc --noEmit && npm test` → green.

- [ ] **Step 6: Commit**

```bash
git add src/components/site-footer.tsx messages/id.json messages/en.json tests/messages.test.ts tests/site-footer.test.tsx
git commit -m "feat(redesign): shared SiteFooter component"
```

---

## Task 2: Wire Beranda

**Files:**
- Discard (revert to committed, do not build on it): `src/app/[locale]/page.tsx`, `src/components/pillar-card.tsx`
- Rewrite: `src/app/[locale]/page.tsx`
- Modify: `messages/id.json`, `messages/en.json`, `tests/messages.test.ts`
- Modify: `e2e/home.spec.ts`, `e2e/motion.spec.ts`

**Interfaces:**
- Consumes: `SkillList` (`@/components/skill-list`), `SectionHead` (`@/components/section-head`), `WorkCard` (`@/components/work-card`), `SiteFooter` (`@/components/site-footer`), `Reveal`/`Stagger` (`@/components/motion/reveal`), `getAllCaseStudies` (`@/lib/content`), `getPathname` (`@/i18n/navigation`), `getTranslations`/`setRequestLocale` (`next-intl/server`), `hasLocale` (`next-intl`), `routing` (`@/i18n/routing`).
- The page keeps its `generateMetadata` unchanged (it already uses `home.eyebrow`? — check: `[locale]/layout.tsx`'s `generateMetadata` uses `metadata.title`/`metadata.description`, NOT `home.*` — confirm this before deleting `home.eyebrow`/`tagline`; if `layout.tsx` or any `generateMetadata` reads `home.eyebrow`/`home.tagline`, keep those two keys and skip retiring them, noting the discrepancy in the commit message).

**Step-by-step:**

- [ ] **Step 1: Discard the stale WIP**

```bash
git checkout -- "src/app/[locale]/page.tsx" src/components/pillar-card.tsx
git status --short   # both should disappear from the modified list
```

- [ ] **Step 2: Verify no other file reads the keys about to be retired**

```bash
grep -rn "home\.eyebrow\|home\.tagline\|home\.statement\|home\.pillarsTitle\|home\.pillars\.\|home\.heroAlt\|home\.researchTitle\|home\.contactTitle\|home\.contactCta\|'tagline'\|'statement'\|'heroAlt'" "src/app/[locale]/layout.tsx" src/lib/
```
Expected: no matches (already verified during planning — `[locale]/layout.tsx`'s `generateMetadata` reads `metadata.title`/`metadata.description`, a separate namespace). If this grep DOES find something, stop and do not delete that specific key — carry it forward and note it in the commit message instead.

- [ ] **Step 3: Add the new `home.*` keys** to `messages/id.json` and `messages/en.json` (nest inside the existing `home` object):

| Key | id | en |
|---|---|---|
| `helloEyebrow` | `SOFTWARE ENGINEER & GURU INFORMATIKA` | `SOFTWARE ENGINEER & COMPUTING TEACHER` |
| `helloHeading` | `Halo, saya Ferry` | `Hi, I'm Ferry` |
| `intro1` | `Saya membangun perangkat lunak untuk pekerjaan yang saya jalani sendiri. Dari sistem untuk mengajar informatika, alat menulis cerita, sampai pengujian keamanan aplikasi.` | `I build software for the work I do myself — from a system for teaching computing, to a writing tool, to application security testing.` |
| `intro2` | `Saya senang ketika sebuah ide bisa dipakai, diuji, lalu diperbaiki berdasarkan apa yang benar-benar terjadi.` | `I like it when an idea gets used, tested, and then improved based on what actually happens.` |
| `aboutLink` | `Sedikit tentang saya` | `A little about me` |
| `selectedWorkAll` | `Semua karya` | `All work` |
| `researchEyebrow` | `PUBLIKASI · JUTIF · 2026` | `PUBLICATION · JUTIF · 2026` |
| `researchHeadline` | `Keamanan yang diuji, bukan diasumsikan.` | `Security that's tested, not assumed.` |
| `researchSummary` | `Analisis kerentanan aplikasi web dengan metode black box testing. Sepuluh skenario pengujian, dicatat dalam publikasi SINTA 2.` | `A web application vulnerability analysis using black box testing. Ten test scenarios, recorded in a SINTA 2 publication.` |
| `researchLink` | `Jelajahi riset` | `Explore the research` |

`home.selectedWork` ("Karya terpilih" / "Selected work") is KEPT unchanged — reused as the "Karya pilihan" section's `SectionHead` title.

- [ ] **Step 4: Retire the now-dead `home.*` keys** from both message files: `eyebrow`, `tagline`, `statement`, `pillarsTitle`, `pillars` (whole object: `build`/`teach`/`secure`), `heroAlt`, `researchTitle`, `contactTitle`, `contactCta`. (Skip any one of these that Step 2's grep found still in use elsewhere — keep it and note why in the commit message.)

- [ ] **Step 5: Update `tests/messages.test.ts` `requiredKeys`** — remove the 12 retired dotted keys (`home.eyebrow`, `home.tagline`, `home.statement`, `home.pillarsTitle`, `home.pillars.build.title`, `home.pillars.build.body`, `home.pillars.teach.title`, `home.pillars.teach.body`, `home.pillars.secure.title`, `home.pillars.secure.body`, `home.researchTitle`, `home.contactTitle`, `home.contactCta`), add the 10 new ones (`home.helloEyebrow`, `home.helloHeading`, `home.intro1`, `home.intro2`, `home.aboutLink`, `home.selectedWorkAll`, `home.researchEyebrow`, `home.researchHeadline`, `home.researchSummary`, `home.researchLink`), plus `footer.title`/`footer.description`/`footer.githubCta`/`footer.copyright` if Task 1 hasn't already added them (it has — don't duplicate).

- [ ] **Step 6: Rewrite `src/app/[locale]/page.tsx`:**

```tsx
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Reveal, Stagger} from '@/components/motion/reveal';
import {SectionHead} from '@/components/section-head';
import {SkillList} from '@/components/skill-list';
import {WorkCard} from '@/components/work-card';
import {SiteFooter} from '@/components/site-footer';
import {Icon} from '@/components/icon';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }
  const locale = requested;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'home'});
  const featured = getAllCaseStudies(locale).filter((cs) => cs.featured);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <section>
        <Reveal>
          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-muted">
            {t('helloEyebrow')}
          </p>
        </Reveal>
        <Reveal>
          <h1 className="mt-3 font-display text-[34px] font-semibold leading-tight tracking-tight text-fg">
            {t('helloHeading')}
            <span className="text-accent">.</span>
          </h1>
        </Reveal>
        <Stagger className="mt-5 max-w-xl space-y-3 text-sm leading-8 text-fg-muted">
          <Reveal>
            <p>{t('intro1')}</p>
          </Reveal>
          <Reveal>
            <p>{t('intro2')}</p>
          </Reveal>
        </Stagger>
        <Reveal>
          <Link
            href="/tentang"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-fg"
          >
            {t('aboutLink')} <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </section>

      <div className="mt-8">
        <SkillList />
      </div>

      <section className="mt-8 border-t border-border pt-8">
        <SectionHead
          title={t('selectedWork')}
          aside={
            <Link href="/karya" className="text-xs text-accent hover:text-fg">
              {t('selectedWorkAll')} <span aria-hidden="true">→</span>
            </Link>
          }
        />
        <Stagger className="mt-6 grid gap-6 sm:grid-cols-2">
          {featured.map((caseStudy) => (
            <Reveal key={caseStudy.slug}>
              <WorkCard caseStudy={caseStudy} locale={locale} />
            </Reveal>
          ))}
        </Stagger>
      </section>

      <Reveal>
        <section className="mt-8 flex gap-5 border-t border-border pt-8">
          <div className="mt-1 grid size-10 shrink-0 place-items-center rounded-xl border border-border text-accent">
            <Icon name="research" className="size-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-fg-muted">
              {t('researchEyebrow')}
            </span>
            <h2 className="mt-2 font-display text-[19px] text-fg">{t('researchHeadline')}</h2>
            <p className="mt-2 max-w-lg text-sm leading-7 text-fg-muted">{t('researchSummary')}</p>
            <Link
              href="/riset"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-fg"
            >
              {t('researchLink')} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </Reveal>

      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 7: Rewrite `e2e/home.spec.ts`** — replace the content-specific tests (tagline, 3 pillars, "all 3 case studies") with assertions matching the new page; keep the locale-detection `describe` block, the 404 block, and the a11y block unchanged in shape (just adjust the text/heading names they check):

```ts
import {expect, test} from '@playwright/test';

test.describe('deteksi bahasa peramban di akar', () => {
  test('peramban berbahasa Indonesia dialihkan ke /id', async ({browser}) => {
    const context = await browser.newContext({locale: 'id-ID'});
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/id$/);
    await context.close();
  });

  test('peramban berbahasa Inggris dialihkan ke /en', async ({browser}) => {
    const context = await browser.newContext({locale: 'en-US'});
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await context.close();
  });

  test('peramban berbahasa yang tidak didukung jatuh ke /id', async ({browser}) => {
    const context = await browser.newContext({locale: 'ja-JP'});
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/id$/);
    await context.close();
  });
});

test('judul utama terlihat', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('heading', {level: 1})).toContainText('Halo, saya Ferry');
});

test('halaman Indonesia menampilkan intro Indonesia', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByText('Saya membangun perangkat lunak untuk pekerjaan yang saya jalani sendiri.', {exact: false})).toBeVisible();
});

test('halaman Inggris menampilkan intro Inggris', async ({page}) => {
  await page.goto('/en');
  await expect(page.getByText('I build software for the work I do myself', {exact: false})).toBeVisible();
});

test('dua karya pilihan tampil di beranda, dengan tautan ke semua karya', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('link', {name: 'SIAKAD Informatika'})).toBeVisible();
  await expect(page.getByRole('link', {name: 'City Courier'})).toBeVisible();
  await expect(page.getByRole('link', {name: /Semua karya/})).toHaveAttribute('href', '/id/karya');
});

test('keahlian berfilter tampil di beranda', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('group', {name: /Filter kategori keahlian/})).toBeVisible();
});

test('navigasi keyboard menjangkau kartu pertama dengan focus yang terlihat', async ({page}) => {
  await page.goto('/id');
  const firstLink = page.getByRole('link', {name: 'SIAKAD Informatika'});
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await page.keyboard.press('Tab');
    if (await firstLink.evaluate((element) => document.activeElement === element)) break;
  }
  await expect(firstLink).toBeFocused();

  const outline = await firstLink.evaluate((el) => {
    const style = getComputedStyle(el);
    return {outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth};
  });
  expect(outline.outlineStyle).not.toBe('none');
  expect(parseFloat(outline.outlineWidth)).toBeGreaterThan(0);
});

test.describe('kelengkapan aksesibilitas per halaman', () => {
  test('halaman id punya <title> dan urutan heading yang benar', async ({page}) => {
    await page.goto('/id');
    await expect(page).toHaveTitle('Ferry Andhika Pratama');
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');

    await expect(page.getByRole('heading', {level: 1})).toHaveCount(1);
    const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) =>
      headings.map((heading) => Number(heading.tagName.slice(1)))
    );
    expect(levels[0]).toBe(1);
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1);
    }
    await expect(page.getByRole('heading', {level: 2, name: 'Karya terpilih'})).toBeVisible();
  });

  test('halaman en punya <title> dan judul bagian dalam bahasa Inggris', async ({page}) => {
    await page.goto('/en');
    await expect(page).toHaveTitle('Ferry Andhika Pratama');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', {level: 2, name: 'Selected work'})).toBeVisible();
  });
});

test.describe('halaman 404', () => {
  for (const path of ['/id/rute-tidak-ada', '/xx', '/tidak/ada/rute/seperti/ini']) {
    test(`${path} menghasilkan 404 dengan <html lang> dan <title>`, async ({page}) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.locator('html')).toHaveAttribute('lang', 'id');
      await expect(page).toHaveTitle('Halaman tidak ditemukan');
      await expect(page.getByText('Halaman tidak ditemukan')).toBeVisible();
    });
  }
});
```

Note: verify `home.selectedWork` id-locale value is still exactly `"Karya terpilih"` and en is `"Selected work"` before relying on those literal heading-name assertions (Step 3 keeps this key unchanged, so it should already match).

- [ ] **Step 8: Fix `e2e/motion.spec.ts`** — home no longer has a `<figure>`/hero illustration or the inline `ResearchCard` counter, and now shows only 2 (not 3) case studies. Replace the file's content:

```ts
import {test, expect} from '@playwright/test';

test('hero copy is visible on load without scrolling', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  await expect(page.getByText('Saya membangun perangkat lunak', {exact: false}).first()).toBeVisible();
});

test('research stat reaches its final value', async ({page}) => {
  await page.goto('/id/riset');
  await expect(page.getByText(/^\s*10\s*$/)).toBeVisible({timeout: 4000});
});

test('selected-work cards are all present and linked', async ({page}) => {
  await page.goto('/id');
  for (const name of ['SIAKAD Informatika', 'City Courier']) {
    await expect(page.getByRole('link', {name})).toBeVisible();
  }
});
```

(The two `prefers-reduced-motion` hero-rotation tests and the `heroRotationDeg` helper are deleted along with the hero illustration — `ScrollSpin`'s own reduced-motion behaviour is still covered by `tests/motion/scroll-spin.test.tsx`, which is untouched by this phase.)

- [ ] **Step 9: Full verification**

```bash
npx tsc --noEmit
npm test
npm run build          # still 34 static pages, no warnings
npm run check:size     # record; must stay <= 210.0 KB
npx playwright test    # home.spec.ts + motion.spec.ts + everything else green
```

- [ ] **Step 10: Commit**

```bash
git add "src/app/[locale]/page.tsx" src/components/pillar-card.tsx messages/id.json messages/en.json tests/messages.test.ts e2e/home.spec.ts e2e/motion.spec.ts
git commit -m "feat(redesign): wire Beranda to the Personal shell

Hello section + filterable SkillList + 2 featured WorkCards ('Semua
karya' links to /karya) + a Riset callout linking /riset + SiteFooter.
Drops the illustrated hero, PillarCard, ImageCard, ContactRow and
MagneticButton from the home route (files kept, orphaned pending a
Phase 5 decision). Retires 12 dead home.* i18n keys, adds 10 new ones.
e2e/home.spec.ts and e2e/motion.spec.ts updated for the new DOM."
```

---

## Task 3: Wire Tentang

**Files:**
- Rewrite: `src/app/[locale]/tentang/page.tsx`
- Modify: `messages/id.json`, `messages/en.json`, `tests/messages.test.ts`

**Interfaces:**
- Consumes: `PageHeading` (`@/components/page-heading`), `SectionHead`, `Timeline` (`@/components/career-card`), `DataEmpty`, `SkillList`, `SiteFooter`; `CAREER`/`EDUCATION` from `@/content/career`.
- `generateMetadata` is UNCHANGED (still reads `about.meta.description` via `pageMetadata`) — do not touch it.
- New `about.*` i18n keys (nest inside existing `about` object):
  - `about.biography1` = current `about.body1` value verbatim (rename only)
  - `about.biography2` = current `about.body2` value verbatim
  - `about.biography3` = current `about.body3` value verbatim
  - `about.biography4` — NEW closing paragraph. id: `"Kalau ada hal yang bisa dikerjakan bersama — produk, kelas, atau riset — mulai dari konteksnya."` en: `"If there's something we could work on together — a product, a class, or research — start from the context."`
  - `about.signoff` — id `"Salam hangat,"` en `"Warm regards,"`

  `about.title`, `about.body1/2/3`, `about.meta.description` are KEPT as-is (do not delete `body1/2/3` — they'd be pure duplicates of `biography1/2/3`; **decide now**: delete `body1`/`body2`/`body3` since `generateMetadata` doesn't use them and the page won't either after rewrite — verify with `grep -rn "about\.body" src/ tests/` first, and only delete if the sole hits are the page you're rewriting and the `requiredKeys` list).

- [ ] **Step 1: Check for other consumers of `about.body1/2/3`**

```bash
grep -rn "about\.body\|'body1'\|'body2'\|'body3'" "src/app/[locale]/tentang/page.tsx" tests/ e2e/
```
Expected: only the page being rewritten and `tests/messages.test.ts`'s `requiredKeys`. If clean, proceed to retire them in Step 3; if not, keep them and skip that part of Step 3.

- [ ] **Step 2: Add the new `about.*` keys** (`biography1` = old `body1`'s exact value, `biography2` = old `body2`, `biography3` = old `body3`, `biography4` and `signoff` as given above) to both message files.

- [ ] **Step 3: Retire `about.body1`, `about.body2`, `about.body3`** from both message files (only if Step 1's grep came back clean). Update `tests/messages.test.ts` `requiredKeys`: remove `about.body1`, `about.body2`, `about.body3`; add `about.biography1`, `about.biography2`, `about.biography3`, `about.biography4`, `about.signoff`.

- [ ] **Step 4: Rewrite `src/app/[locale]/tentang/page.tsx`** (keep the existing `generateMetadata` function untouched — only the default export changes):

```tsx
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Reveal, Stagger} from '@/components/motion/reveal';
import {PageHeading} from '@/components/page-heading';
import {SectionHead} from '@/components/section-head';
import {Timeline} from '@/components/career-card';
import {DataEmpty} from '@/components/data-empty';
import {SkillList} from '@/components/skill-list';
import {SiteFooter} from '@/components/site-footer';
import {routing, type Locale} from '@/i18n/routing';
import {pageMetadata} from '@/lib/page-metadata';
import {CAREER, EDUCATION} from '@/content/career';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [nav, t] = await Promise.all([
    getTranslations({locale, namespace: 'nav'}),
    getTranslations({locale, namespace: 'about'})
  ]);
  return pageMetadata({
    locale,
    href: '/tentang',
    title: nav('about'),
    description: t('meta.description')
  });
}

export default async function AboutPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'about'});

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <PageHeading title={t('title')} description={t('biography1')} />

      <Stagger className="max-w-2xl space-y-5 text-sm leading-8 text-fg-muted">
        <Reveal>
          <p>{t('biography2')}</p>
        </Reveal>
        <Reveal>
          <p>{t('biography3')}</p>
        </Reveal>
        <Reveal>
          <p>{t('biography4')}</p>
        </Reveal>
        <Reveal>
          <p className="text-fg-muted">
            {t('signoff')}
            <br />
            <strong className="text-accent">Ferry Andhika Pratama</strong>
          </p>
        </Reveal>
      </Stagger>

      <section className="mt-8 border-t border-border pt-8">
        <SectionHead icon="work" title={t('career.title')} description={t('career.description')} />
        <div className="mt-6">
          <Timeline entries={CAREER[locale]} />
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-8">
        <SectionHead icon="teach" title={t('education.title')} description={t('education.description')} />
        <div className="mt-6">
          <Timeline entries={EDUCATION[locale]}>
            <DataEmpty
              icon="teach"
              title={t('education.emptyTitle')}
              description={t('education.emptyBody')}
            />
          </Timeline>
        </div>
      </section>

      <div className="mt-8 border-t border-border pt-8">
        <SkillList />
      </div>

      <SiteFooter />
    </main>
  );
}
```

Note: `PageHeading`'s `description` prop is being reused here for `biography1` (the opening paragraph reads naturally as the page's lead line, matching spec §7's "bio ... Karier ... Pendidikan-kosong ... SkillList" without inventing an extra field). `biography2`–`biography4` follow as body paragraphs.

- [ ] **Step 5: Full verification**

```bash
npx tsc --noEmit
npm test
npm run build          # still 34 pages, no warnings
npm run check:size     # record; must stay <= 210.0 KB
npx playwright test    # e2e/routes.spec.ts's generic /tentang + /en/about h1 check must still pass
```

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/tentang/page.tsx" messages/id.json messages/en.json tests/messages.test.ts
git commit -m "feat(redesign): wire Tentang to Karier/Pendidikan timeline + SkillList

Biography (4 paragraphs + signoff) + Karier timeline (real entry from
CAREER) + Pendidikan timeline (empty -> DataEmpty placeholder) +
filterable SkillList + SiteFooter. generateMetadata unchanged."
```

---

## Task 4: Phase-3 verification gate

**Files:** none.

- [ ] **Step 1:** `npx tsc --noEmit` → clean.
- [ ] **Step 2:** `npm test` → all pass. Record the count.
- [ ] **Step 3:** `npm run check:size` (clean rebuild: `rm -rf .next && npm run build && npm run check:size`) → ≤ 210.0 KB. Record the number and compare to Phase 2's 206.0 KB baseline — this is the first phase where the new components are actually wired in, so an increase is expected; if it exceeds ~208 KB, apply the lazy-wrap escape hatch to `SkillList` (it now renders twice per page — home and about) before closing this phase.
- [ ] **Step 4:** `npm run build` → `✓ Compiled successfully`, still 34 static pages (no new routes in Phase 3), no warnings.
- [ ] **Step 5:** `npx playwright test` → full suite green (baseline 80, adjusted for `home.spec.ts`/`motion.spec.ts` rewrites — exact count may shift; report it).
- [ ] **Step 6:** Manually confirm (via `npm run build` output or a local `next start` smoke check) that `/id`, `/en`, `/id/tentang`, `/en/about` all render without a hydration/console error — the two pages now share `SkillList` (a client component) rendered from two different server pages; this is the first time that pattern is exercised.
- [ ] **Step 7:** Append a "Phase 3 — Beranda + Tentang (2026-09-11)" section to `docs/superpowers/SDD-ledger.md`: what each page now renders, the i18n keys retired/added, the `PillarCard`/hero/`ImageCard`/`ContactRow`/`MagneticButton` orphaning note, and final numbers (unit / e2e / tsc / build / check:size).

```bash
git add docs/superpowers/SDD-ledger.md
git commit -m "docs(ledger): Phase 3 — Beranda + Tentang wired"
```

---

## Self-Review

**Spec coverage:** §7 home row → Task 2 (hello, SkillList, Karya pilihan with featured-only WorkCards + "Semua karya" link, Riset callout, footer). §7 about row → Task 3 (bio, Karier timeline, Pendidikan empty-state, SkillList, footer). §7's shared "footer block (contact CTA + GitHub link + © 2026)" → Task 1 (`SiteFooter`), which Phase 2's plan did not anticipate as a named component — this plan adds it. §9 ScrollSpin/PillarCard disposition → Task 2 Step 1 (discard WIP) + file-structure table (orphan, not delete). §8 i18n retirements → Task 2 Steps 3–5, Task 3 Steps 1–3.

**Placeholder scan:** no "TBD"/"handle it"/"similar to Task N". Every i18n string is given verbatim in both locales. Test code is complete where it matters (`SiteFooter`, the rewritten `home.spec.ts`/`motion.spec.ts`).

**Type consistency:** `SiteFooter` (Task 1, no props) is consumed identically by Task 2 and Task 3. `Timeline`/`CareerCard`'s `{entries, children}` contract (Phase 2) is exercised in Task 3 exactly as Phase 2 specified — `CAREER[locale]`/`EDUCATION[locale]` (both `CareerEntry[]`) match `Timeline`'s `entries` prop. `WorkCard`'s `{caseStudy, locale}` (Phase 2) is exercised in Task 2 unchanged. `SectionHead`'s `{icon?, title, description?, aside?}` (Phase 2) is used with and without `aside`/`icon` in the two pages, matching its optional-prop contract.

**Cross-task risk called out explicitly:** Task 2 Step 2 and Task 3 Step 1 both gate a key-retirement on a grep confirming no other consumer — if either grep is dirty, the plan tells the implementer to keep the key rather than guess.

**Gaps:** none for Phase 3 scope (2 pages). Phase 4 (Karya + Karya/[slug]) and Phase 5 (Riset/Pencapaian/Kontak/Links/Buku-tamu — including the final disposition of `PillarCard`, `ImageCard`, `ContactRow`, `MagneticButton`, and the old `ResearchCard`) follow as separate plans.
