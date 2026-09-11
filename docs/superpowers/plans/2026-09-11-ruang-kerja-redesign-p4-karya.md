# Ruang Kerja Redesign — Phase 4: Wire Karya + Karya/[slug] — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/karya` (Karya list) and `/karya/[slug]` (case study detail) on the Personal shell using Phase 2's `WorkFilters`/`WorkCard`/`TechBadgeRow`, per spec §7. Third of the four page-wiring phases (Beranda + Tentang shipped in Phase 3).

**Architecture:** Both pages are independent rewrites. `/karya` becomes thin — `WorkFilters` already owns the filter UI, the grid, and the empty state (Phase 2), so the page is just `PageHeading` + `WorkFilters`. `/karya/[slug]` keeps its existing hero-image treatment (`ParallaxY`) and its existing full case-study prose (`CaseStudyBody`, untouched, still rendering every section) but wraps it in the new shell chrome: back-link, translated detail-meta, a `TechBadgeRow`, two short "teaser" sections pulled from the case study's own first two sections, a "Teknologi" section, and a "Karya lainnya" cross-link grid. `ImageCard` becomes fully orphaned once Task 1 lands (its only other caller, home, was removed in Phase 3) — left in the repo per spec §9's established pattern, a Phase 5 decision.

**Tech Stack:** Next.js 16.3.3 App Router, next-intl 4, Tailwind v4, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-09-ruang-kerja-personal-redesign.md` — §7 (karya/detail rows), §11 Phase 4 row.

## Global Constraints

- **Taxonomy labels must be translated, not raw.** Phase 2's final whole-branch review found `CaseStudy.type`/`.topic` rendering as untranslated Indonesian literals on `en` in three components; the fix was `src/lib/taxonomy-labels.ts` (`WORK_TYPE_LABEL_KEY`, `WORK_TOPIC_LABEL_KEY`). Any new code in this phase that displays `caseStudy.type`/`caseStudy.topic` **must** route through those same maps via `t(WORK_TYPE_LABEL_KEY[caseStudy.type])` / `t(WORK_TOPIC_LABEL_KEY[caseStudy.topic])` — do not re-introduce the bug on the detail page.
- **`getByRole('link', {name: '<case-study title>'})` locators need `exact: true`.** `WorkCard`'s cover-image `alt` text ("Tangkapan layar aplikasi <Title>" / similar) substring-matches the same accessible name as the title link, which is a Playwright strict-mode violation — this exact class of bug was fixed twice already in Phase 3. Every e2e locator by case-study title in this phase's touched files must carry `exact: true`.
- JS budget **210 KB gzip**. Current **200.1 KB** (Phase 3 end). Neither page in this phase adds a new client component (`WorkFilters` is already committed and already measured in Phase 2/3's headroom analysis) — expect this number to stay flat or move slightly; record it regardless.
- Bilingual id/en — new strings in both `messages/id.json`/`messages/en.json`, added to `tests/messages.test.ts` `requiredKeys`.
- One `<h1>` per page (`PageHeading` on both).
- `prefers-reduced-motion` / Lighthouse Accessibility 100 stay binding. Keep `Reveal`/`Stagger`/`ParallaxY` usage on the detail page's hero exactly as it is today — this phase does not touch that motion treatment.
- Windows env; Bash tool for POSIX commands. `npx tsc --noEmit`, `npm test`, `npx playwright test`, `npm run build`, `npm run check:size`.
- Read `node_modules/next/dist/docs/` before Next-specific code.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/app/[locale]/karya/page.tsx` | Rewritten: `PageHeading` (`work.title`/`work.intro`, both already exist) + `WorkFilters` (owns filtering, grid, empty state). |
| `src/app/[locale]/karya/[slug]/page.tsx` | Rewritten: back-link → detail-meta (translated topic/type + stack) → `TechBadgeRow` → existing hero (`ParallaxY`, untouched) → 2 teaser sections (from `sections[0]`/`sections[1]`) → "Teknologi" section → "Studi kasus lengkap" (full, untouched `CaseStudyBody`) → "Karya lainnya" (`WorkCard` grid of the other 2 case studies) → `SiteFooter`. `generateMetadata` and `generateStaticParams` unchanged. |
| `messages/{id,en}.json` | New `work.detail.*` namespace (4 keys: back, techTitle, fullCaseTitle, relatedTitle). |
| `tests/messages.test.ts` | `requiredKeys` gains the 4 new keys. |
| `e2e/karya.spec.ts` | Locator fixes (`exact: true`) for the case-study-title links, now that `/karya` renders via `WorkCard`. |

---

## Task 1: Wire `/karya`

**Files:**
- Rewrite: `src/app/[locale]/karya/page.tsx`
- Modify: `e2e/karya.spec.ts`

**Interfaces:**
- Consumes: `PageHeading` (`@/components/page-heading`), `WorkFilters` (`@/components/work-filters`), `getAllCaseStudies` (`@/lib/content`).
- `generateMetadata` is UNCHANGED (still reads `work.meta.description` via `pageMetadata`).
- No new i18n — `work.title` and `work.intro` already exist in both message files and already read correctly for `PageHeading`.

- [ ] **Step 1: Rewrite `src/app/[locale]/karya/page.tsx`** (keep `generateMetadata` byte-identical, only the default export changes):

```tsx
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeading} from '@/components/page-heading';
import {WorkFilters} from '@/components/work-filters';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies} from '@/lib/content';
import {pageMetadata} from '@/lib/page-metadata';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [nav, t] = await Promise.all([
    getTranslations({locale, namespace: 'nav'}),
    getTranslations({locale, namespace: 'work'})
  ]);
  return pageMetadata({
    locale,
    href: '/karya',
    title: nav('work'),
    description: t('meta.description')
  });
}

export default async function WorkPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: requested} = await params;
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }
  const locale = requested;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'work'});
  const caseStudies = getAllCaseStudies(locale);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <PageHeading title={t('title')} description={t('intro')} />
      <WorkFilters caseStudies={caseStudies} locale={locale} />
    </main>
  );
}
```

- [ ] **Step 2: Fix `e2e/karya.spec.ts`'s locators** — `WorkCard`'s cover image now renders on this page for the first time, and its `alt` text substring-matches the same case-study-title link name. Update:

```ts
import {test, expect} from '@playwright/test';

test('all three case studies are reachable from the list', async ({page}) => {
  await page.goto('/id/karya');
  for (const name of ['SIAKAD Informatika', 'City Courier', 'MochiToon']) {
    await expect(page.getByRole('link', {name, exact: true})).toBeVisible();
  }
  await page.getByRole('link', {name: 'City Courier', exact: true}).click();
  await expect(page).toHaveURL(/\/id\/karya\/city-courier$/);
  await expect(page.getByRole('heading', {level: 1, name: /City Courier/})).toBeVisible();
});

test('english list localises to /en/work', async ({page}) => {
  await page.goto('/en/work');
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
});
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm test
npm run build          # still 34 static pages, no warnings
npm run check:size     # record; must stay <= 210.0 KB
npx playwright test    # full suite, especially e2e/karya.spec.ts
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/karya/page.tsx" e2e/karya.spec.ts
git commit -m "feat(redesign): wire Karya list to WorkFilters

PageHeading + WorkFilters (owns the type/category filters, the grid,
and the empty state — all Phase 2 work). Fixes the now-recurring
WorkCard cover-image alt-text locator ambiguity in e2e/karya.spec.ts."
```

---

## Task 2: Wire `/karya/[slug]`

**Files:**
- Rewrite: `src/app/[locale]/karya/[slug]/page.tsx`
- Modify: `messages/id.json`, `messages/en.json`, `tests/messages.test.ts`

**Interfaces:**
- Consumes: `PageHeading`, `TechBadgeRow` (`@/components/tech-badge-row`), `WorkCard`, `SiteFooter`, `CaseStudyBody` (unchanged), `ParallaxY` (unchanged), `WORK_TYPE_LABEL_KEY`/`WORK_TOPIC_LABEL_KEY` (`@/lib/taxonomy-labels`), `SKILLS` (`@/lib/skills`), `Link` (`@/i18n/navigation`), `getAllCaseStudies`/`getCaseStudy` (`@/lib/content`).
- `generateMetadata` and `generateStaticParams` are UNCHANGED — only the default export (`CaseStudyPage`) changes.
- New i18n (`work.detail.*`, nest inside the existing `work` object):
  - `work.detail.back` — id `"Kembali ke Karya"` / en `"Back to Work"`
  - `work.detail.techTitle` — id `"Teknologi"` / en `"Technology"`
  - `work.detail.fullCaseTitle` — id `"Studi kasus lengkap"` / en `"Full case study"`
  - `work.detail.relatedTitle` — id `"Karya lainnya"` / en `"Other work"`

- [ ] **Step 1: Add the 4 `work.detail.*` keys** to both message files, and to `tests/messages.test.ts` `requiredKeys`.

- [ ] **Step 2: Rewrite `src/app/[locale]/karya/[slug]/page.tsx`:**

```tsx
import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {CaseStudyBody} from '@/components/case-study-body';
import {PageHeading} from '@/components/page-heading';
import {TechBadgeRow} from '@/components/tech-badge-row';
import {WorkCard} from '@/components/work-card';
import {SiteFooter} from '@/components/site-footer';
import {ParallaxY} from '@/components/motion/parallax-y.lazy';
import type {CaseStudy} from '@/content/types';
import {routing} from '@/i18n/routing';
import {getAllCaseStudies, getCaseStudy} from '@/lib/content';
import {buildCaseStudyArticleSchema} from '@/lib/jsonld';
import {pageMetadata} from '@/lib/page-metadata';
import {SKILLS} from '@/lib/skills';
import {WORK_TYPE_LABEL_KEY, WORK_TOPIC_LABEL_KEY} from '@/lib/taxonomy-labels';

export function generateStaticParams() {
  const slugs = getAllCaseStudies('id').map((caseStudy) => caseStudy.slug);
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({locale, slug})));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  let caseStudy: CaseStudy;
  try {
    caseStudy = getCaseStudy(slug, locale);
  } catch {
    return {};
  }
  return pageMetadata({
    locale,
    href: {pathname: '/karya/[slug]', params: {slug}},
    title: caseStudy.title,
    description: caseStudy.tagline,
    images: [caseStudy.thumbnail.src]
  });
}

function firstParagraph(section: CaseStudy['sections'][number]): string {
  const block = section.blocks.find((b) => b.type === 'p');
  if (!block || block.type !== 'p') return '';
  return block.text.split('\n\n')[0];
}

export default async function CaseStudyPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale: requested, slug} = await params;
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }
  const locale = requested;
  setRequestLocale(locale);

  let caseStudy: CaseStudy;
  try {
    caseStudy = getCaseStudy(slug, locale);
  } catch {
    notFound();
  }

  const t = await getTranslations({locale, namespace: 'work'});
  const schema = buildCaseStudyArticleSchema(slug, locale);
  const stackSlugs = caseStudy.stack
    .map((name) => SKILLS.find((s) => s.name === name)?.slug)
    .filter((s): s is string => Boolean(s));
  const otherCaseStudies = getAllCaseStudies(locale).filter((cs) => cs.slug !== slug);
  const [teaserA, teaserB] = caseStudy.sections;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-0 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(schema).replace(/</g, '\\u003c')}}
      />

      <Link href="/karya" className="mb-6 inline-block text-sm text-fg-muted transition-colors hover:text-fg">
        ← {t('detail.back')}
      </Link>

      <PageHeading title={caseStudy.title} description={caseStudy.tagline} />

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-fg-muted">
        <span>
          {`${t(WORK_TOPIC_LABEL_KEY[caseStudy.topic])} · ${t(WORK_TYPE_LABEL_KEY[caseStudy.type])}`}
        </span>
        <span>{caseStudy.stack.join(' · ')}</span>
      </div>
      <div className="mt-4">
        <TechBadgeRow slugs={stackSlugs} size={28} />
      </div>

      <figure className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl bg-surface-2">
        <ParallaxY className="absolute -inset-4">
          <Image
            src={caseStudy.thumbnail.src}
            alt={caseStudy.thumbnail.alt}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            priority
            className="object-cover"
          />
        </ParallaxY>
      </figure>

      <article className="mt-8 max-w-2xl">
        {teaserA ? (
          <section className="border-b border-border py-6">
            <h2 className="font-display text-xl text-fg">{teaserA.heading}</h2>
            <p className="mt-3 text-[15px] leading-8 text-fg-muted">{firstParagraph(teaserA)}</p>
          </section>
        ) : null}
        {teaserB ? (
          <section className="border-b border-border py-6">
            <h2 className="font-display text-xl text-fg">{teaserB.heading}</h2>
            <p className="mt-3 text-[15px] leading-8 text-fg-muted">{firstParagraph(teaserB)}</p>
          </section>
        ) : null}
        <section className="border-b border-border py-6">
          <h2 className="font-display text-xl text-fg">{t('detail.techTitle')}</h2>
          <p className="mt-3 text-[15px] leading-8 text-fg-muted">{caseStudy.stack.join(' · ')}</p>
        </section>
        <section className="py-6">
          <h2 className="font-display text-xl text-fg">{t('detail.fullCaseTitle')}</h2>
          <div className="mt-6">
            <CaseStudyBody sections={caseStudy.sections} />
          </div>
        </section>
      </article>

      <section className="mt-8 border-t border-border pt-8">
        <h2 className="font-display text-xl text-fg">{t('detail.relatedTitle')}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {otherCaseStudies.map((cs) => (
            <WorkCard key={cs.slug} caseStudy={cs} locale={locale} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
```

Note: `firstParagraph` returns `''` if a section has no `'p'`-type block (none of the current 3 case studies' first two sections hit this — all start with a `'p'` block — but the guard keeps the page from crashing if content changes later).

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm test
npm run build          # still 34 static pages (3 slugs × 2 locales, unchanged), no warnings
npm run check:size     # record; must stay <= 210.0 KB
npx playwright test    # full suite — e2e/karya.spec.ts's "City Courier" detail-page h1 check must pass
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/karya/[slug]/page.tsx" messages/id.json messages/en.json tests/messages.test.ts
git commit -m "feat(redesign): wire case-study detail to the Personal shell

Back-link, translated topic/type + TechBadgeRow, two teaser sections
pulled from the case study's own Problem/User sections, a Teknologi
section, the full untouched CaseStudyBody under 'Studi kasus lengkap',
a Karya lainnya cross-link grid, and SiteFooter. generateMetadata and
generateStaticParams unchanged. Topic/type routed through the shared
taxonomy-labels maps to avoid the untranslated-literal bug Phase 2's
final review found."
```

---

## Task 3: Phase-4 verification gate

**Files:** none.

- [ ] **Step 1:** `npx tsc --noEmit` → clean.
- [ ] **Step 2:** `npm test` → all pass. Record the count.
- [ ] **Step 3:** `npm run check:size` (clean rebuild: `rm -rf .next && npm run build && npm run check:size`) → ≤ 210.0 KB. Record the number and compare to Phase 3's 200.1 KB.
- [ ] **Step 4:** `npm run build` → `✓ Compiled successfully`, still 34 static pages, no warnings.
- [ ] **Step 5:** `npx playwright test` → full suite green.
- [ ] **Step 6:** Manually confirm via `next start` that `/id/karya`, `/en/work`, `/id/karya/city-courier`, `/en/work/city-courier` all render 200 with no raw i18n key leaking into the HTML (grep the response body for stray `work.` / `WORK_` substrings the way Phase 3's gate did).
- [ ] **Step 7:** Append a "Phase 4 — Karya + Karya/[slug] (2026-09-11)" section to `docs/superpowers/SDD-ledger.md`: what each page now renders, the `ImageCard` orphaning note, final numbers.

```bash
git add docs/superpowers/SDD-ledger.md
git commit -m "docs(ledger): Phase 4 — Karya + Karya/[slug] wired"
```

---

## Self-Review

**Spec coverage:** §7 karya row → Task 1 (`PageHeading` + `WorkFilters`, which already owns filters/grid/empty-state from Phase 2). §7 karya/[slug] row → Task 2 (back-link, meta, `TechBadgeRow`, hero unchanged, story sections, full `CaseStudyBody` kept under "Studi kasus lengkap" exactly as spec's note requires — "nothing removed" — related grid). §11 Phase 4 row → both tasks + gate.

**Placeholder scan:** no "TBD"/"handle it". `firstParagraph`'s empty-section fallback is a real, if currently unreachable, guard — not a placeholder for missing logic.

**Type consistency:** `WorkCard`, `TechBadgeRow`, `PageHeading`, `SiteFooter`, `WORK_TYPE_LABEL_KEY`/`WORK_TOPIC_LABEL_KEY` (all Phase 2 / Phase-2-final-review artifacts) are consumed here with the exact signatures they were committed with — no new props invented. `CaseStudy['sections'][number]` indexing in `firstParagraph`'s signature matches `src/content/types.ts`'s `CaseStudySection`.

**Cross-task risk called out explicitly:** the Global Constraints section leads with the taxonomy-label and e2e-locator lessons from Phase 2/3's final reviews, specifically so this phase's implementer doesn't reintroduce either bug — both apply directly to `/karya/[slug]` (taxonomy) and `/karya` (locator).

**Gaps:** none for Phase 4 scope. Phase 5 (Riset, Pencapaian, Kontak, Links, Buku-tamu — plus the final disposition of `PillarCard`, `ImageCard`, `ContactRow`, `MagneticButton`, the old `ResearchCard`, and `tests/assets.test.ts`'s pinned hero assets) is the last page-wiring phase before Phase 6 (Dasbor).
