# "Ruang Kerja" Motion Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. Iron Law of TDD: failing test → watch it fail → minimal code → watch it pass → commit. Separate `fix:` commits for follow-ups — do NOT `git commit --amend` task commits.

**Goal:** Give the site purposeful, restrained motion — scroll reveals, a scroll-tied hero animation, hover micro-interactions, an animated stat counter, a sliding nav indicator, and a faint grain overlay — without turning it into effect soup and without blowing the JS budget past ~200 KB.

**Architecture:** One motion library (`motion`, framer-motion v12), imported only by a small set of shared primitives in `src/components/motion/`. Every primitive is SSR-safe (content is visible with no JS and to crawlers) and no-ops under `prefers-reduced-motion`. Pages compose the primitives; they never import `motion` directly. Registry components (`@react-bits`, `@componentry`) are pulled in as starting points and stripped to essentials.

**Tech Stack:** Next.js 16.3.2 · React 19 · `motion` ^12 · Tailwind v4 · Vitest + Testing Library · Playwright

**Spec:** design agreed in chat 2026-08-31 (this file is the record). Prior context: `docs/superpowers/specs/2026-08-30-ruang-kerja-design.md`, `docs/superpowers/SDD-ledger.md`.

## Global Constraints

- **Node ≥ 20.11 · npm.** Next 16 conventions (`proxy.ts`, not `middleware.ts`).
- **One motion library:** `motion` (framer-motion v12). No GSAP, no three.js/OGL, no cursor-trail / aurora / particle-text effects.
- **`motion` is imported ONLY by `src/components/motion/*`.** Pages and other components compose those primitives.
- **SSR / no-JS / crawler safety:** a `Reveal`-wrapped block MUST render its content visible and in the DOM without JavaScript. Animate *from* a near-visible state after mount, or gate the hidden `initial` behind a mounted flag. Never ship `opacity: 0` as the server-rendered state.
- **`prefers-reduced-motion`:** every primitive degrades — reveals appear instantly, the counter shows its final value immediately, magnetic/parallax/scroll-spin apply no transform, the grain is static. Use `motion`'s `useReducedMotion()`.
- **Motion vocabulary (single source: `src/lib/motion.ts`):** ease `[0.16, 1, 0.3, 1]`; durations `fast 0.15s`, `base 0.22s`, `slow 0.3s`; reveal travel `12px`; stagger step `0.06s`. Nothing longer than `0.3s`, nothing travelling more than `16px`.
- **No hex literals in components** (existing rule). Colour via Tailwind utilities → `var(--color-*)`.
- **JS budget:** `npm run check:size` raised to **210 KB** (from 160). Measure the real total after Phase 3 and again at the end; report it. Do not exceed 210 without sign-off.
- **Lighthouse:** Accessibility stays asserted `error` (=100) in `lighthouserc.json`. Watch the Performance warning — avoid blanket `will-change`; only set it transiently.
- **Existing suites stay green:** 81 unit, 68 e2e (10 skipped) as the starting baseline on `main` @ `2b1e7eb`.
- **Commits:** Conventional Commits, one per green task, separate `fix:` commits for follow-ups.

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `components.json` | shadcn config + `@react-bits` / `@componentry` registries | 1 |
| `src/lib/motion.ts` | ease, durations, travel, stagger constants | 2 |
| `src/components/motion/reveal.tsx` | `Reveal`, `Stagger` — scroll-in fade+rise, SSR-safe, reduced-motion no-op | 3 |
| `src/components/motion/counter.tsx` | `Counter` — count-up on in-view | 4 |
| `src/components/motion/glare-card.tsx` | `GlareCard` — CSS hover glare + lift (no dep) | 5 |
| `src/components/motion/magnetic-button.tsx` | `MagneticButton` — pointer spring + shimmer | 6 |
| `src/components/motion/noise.tsx` | `Noise` — fixed CSS grain overlay | 7 |
| `src/components/motion/scroll-spin.tsx` | `ScrollSpin` — wraps hero art, rotation ∝ scroll, `ssr:false` | 8 |
| `src/components/nav.tsx` · `nav-item.tsx` | active indicator → sliding `layoutId` pill | 9 |
| `src/app/[locale]/layout.tsx` | mount `<Noise/>` | 9 |
| `src/app/[locale]/page.tsx` | Beranda: hero stagger, `ScrollSpin`, `Reveal`, `Counter`, `GlareCard`, `MagneticButton` | 10 |
| `src/components/image-card.tsx` | wrap media in `GlareCard` | 10 |
| `src/components/research-card.tsx` | the numeric stat → `Counter` | 10 |
| `src/components/case-study-body.tsx` | section `Reveal`, `quote` scale-in | 11 |
| `src/app/[locale]/karya/[slug]/page.tsx` | thumbnail figure parallax | 11 |
| `src/app/[locale]/{tentang,riset,pencapaian,links,karya}/page.tsx`, `not-found.tsx` | body sections `Reveal`/`Stagger` | 12 |
| `package.json` · `lighthouserc.json` · `README.md` | budget bump, docs | 2, 13 |
| `tests/motion/*`, `e2e/motion.spec.ts` | per-primitive + behavioural tests | 3–8, 10, 13 |

---

## Phase 1 — Setup

### Task 1: shadcn init + registries

**Files:** Create `components.json`.

- [ ] **Step 1:** Run `npx shadcn@latest init --base-color neutral --css-variables --yes` (non-interactive). If it prompts anyway, answer: TypeScript yes, `src/` yes, RSC yes, Tailwind v4, components alias `@/components`, utils `@/lib/utils`. It may create `src/lib/utils.ts` (a `cn()` helper) and touch `globals.css` — keep `cn()`, and **revert any colour/token changes** shadcn makes to `globals.css` (our two-theme system stays as-is; `git checkout -- src/app/globals.css` if needed, then re-add only a `@import` line if shadcn required one — it should not for v4).
- [ ] **Step 2:** Edit `components.json` `registries` to:
  ```json
  "registries": {
    "@react-bits": "https://reactbits.dev/r/{name}.json",
    "@componentry": "https://componentry.dev/r/{name}.json"
  }
  ```
- [ ] **Step 3:** Verify — `npx shadcn@latest view @react-bits @componentry` lists items without error; `src/lib/utils.ts` exports `cn`; `npm test` + `npx tsc --noEmit` still clean; `git diff src/app/globals.css` shows no token changes.
- [ ] **Step 4:** Commit: `chore: shadcn init + register react-bits and componentry`.

### Task 2: motion dependency + constants + budget

**Files:** Modify `package.json`; Create `src/lib/motion.ts`, `tests/motion/constants.test.ts`.

- [ ] **Step 1:** Failing test — `tests/motion/constants.test.ts`:
  ```ts
  import {describe, expect, it} from 'vitest';
  import {EASE, DUR, REVEAL_TRAVEL, STAGGER_STEP} from '@/lib/motion';
  describe('motion vocabulary', () => {
    it('uses the FASE-3 easing curve', () => expect(EASE).toEqual([0.16, 1, 0.3, 1]));
    it('keeps every duration at or below 0.3s', () => {
      for (const d of Object.values(DUR)) expect(d).toBeLessThanOrEqual(0.3);
    });
    it('reveal travel is small', () => expect(REVEAL_TRAVEL).toBeLessThanOrEqual(16));
    it('stagger step is subtle', () => expect(STAGGER_STEP).toBeLessThanOrEqual(0.08));
  });
  ```
- [ ] **Step 2:** Run → FAIL (`Cannot find module '@/lib/motion'`).
- [ ] **Step 3:** `npm i motion` (record the resolved version). Create `src/lib/motion.ts`:
  ```ts
  export const EASE = [0.16, 1, 0.3, 1] as const;
  export const DUR = {fast: 0.15, base: 0.22, slow: 0.3} as const;
  export const REVEAL_TRAVEL = 12;
  export const STAGGER_STEP = 0.06;
  ```
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** `npm pkg set scripts.check:size="node scripts/check-bundle-size.mjs 210"`. Append a ruling to `docs/superpowers/SDD-ledger.md` (new dated bullet) recording the 160→210 bump and why (motion pass, user-approved 2026-08-31, FASE-3 allowed ≤200 KB for effects).
- [ ] **Step 6:** `npm run build && npm run check:size` — passes (motion not yet imported anywhere, so total unchanged). Commit: `chore: add motion, raise JS budget to 210 KB`.

---

## Phase 2 — Motion primitives

### Task 3: Reveal + Stagger

**Files:** Create `src/components/motion/reveal.tsx`, `tests/motion/reveal.test.tsx`.

**Interfaces:**
- `Reveal({children, as?, delay?, className}: {children: ReactNode; as?: 'div'|'section'|'li'; delay?: number; className?: string})` — `'use client'`. Renders `children` visible immediately (SSR + no-JS). After mount, if motion is allowed, it animates from `{opacity: 0.001, y: REVEAL_TRAVEL}` to `{opacity: 1, y: 0}` when scrolled into view (`whileInView`, `viewport={{once: true, margin: '0px 0px -10% 0px'}}`, transition `{duration: DUR.base, ease: EASE, delay}`). Under `useReducedMotion()` it renders a plain element with no animation props.
- `Stagger({children, as?, className}: ...)` — a `motion` container; sets `variants` so direct `Reveal` children (or elements with the shared variant) stagger by `STAGGER_STEP`. Simplest robust implementation: `Stagger` provides `staggerChildren` via a parent variant and `Reveal` consumes `variants` when inside one (accept an optional `index` prop as a fallback: `delay={index * STAGGER_STEP}`).

- [ ] **Step 1:** Failing test:
  ```tsx
  import {describe, expect, it, vi, beforeEach} from 'vitest';
  import {render, screen} from '@testing-library/react';
  import {Reveal, Stagger} from '@/components/motion/reveal';

  function mockReducedMotion(v: boolean) {
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: v && q.includes('reduce'), media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
      addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(), onchange: null
    }));
  }
  beforeEach(() => mockReducedMotion(false));

  describe('Reveal', () => {
    it('renders its children (visible, in the DOM) regardless of scroll', () => {
      render(<Reveal>hello world</Reveal>);
      expect(screen.getByText('hello world')).toBeVisible();
    });
    it('renders the requested element tag', () => {
      render(<Reveal as="section">x</Reveal>);
      expect(screen.getByText('x').closest('section')).toBeInTheDocument();
    });
    it('under prefers-reduced-motion renders a plain element with no inline opacity:0', () => {
      mockReducedMotion(true);
      const {container} = render(<Reveal>y</Reveal>);
      expect(container.firstElementChild?.getAttribute('style') ?? '').not.toContain('opacity: 0');
    });
  });
  describe('Stagger', () => {
    it('renders all children', () => {
      render(<Stagger><Reveal>a</Reveal><Reveal>b</Reveal></Stagger>);
      expect(screen.getByText('a')).toBeVisible();
      expect(screen.getByText('b')).toBeVisible();
    });
  });
  ```
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. Use `motion`'s `m` or `motion.<tag>` with `whileInView`. Guard the animated variant behind a `const reduce = useReducedMotion()` — when `reduce`, return `<Tag className={className}>{children}</Tag>`. Ensure the non-reduced path's SSR output is still visible (framer-motion renders `initial` inline styles on first paint — set `initial={false}` on the server or use a `mounted` state: `const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), [])` and only pass `initial`/`whileInView` once `mounted`). Pick whichever keeps the DOM text visible pre-hydration.
- [ ] **Step 4:** Run → PASS. `npx tsc --noEmit`.
- [ ] **Step 5:** Commit: `feat: Reveal and Stagger scroll primitives (SSR-safe, reduced-motion aware)`.

### Task 4: Counter

**Files:** Create `src/components/motion/counter.tsx`, `tests/motion/counter.test.tsx`.

**Interfaces:** `Counter({to, from?, duration?, className, format?}: {to: number; from?: number; duration?: number; className?: string; format?: (n: number) => string})` — `'use client'`. Renders `format?.(to) ?? String(to)` as the SSR value. On mount + in-view, animates the displayed number `from → to` over `duration ?? DUR.slow * 3` with `EASE`. Under reduced motion (or no-JS), it just shows the final `to`.

- [ ] **Step 1:** Failing test — renders final value in the DOM on first render; with `format`, applies it; under reduced-motion shows `to` immediately.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement — adapt React Bits `CountUp` (`npx shadcn@latest add @react-bits/count-up` into `src/components/motion/` then trim to this interface and our constants), or hand-roll with `motion`'s `useMotionValue` + `animate()` + `useInView`. Keep it dependency-light.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: Counter (count-up on in-view, final value without JS)`.

### Task 5: GlareCard

**Files:** Create `src/components/motion/glare-card.tsx`, `tests/motion/glare-card.test.tsx`.

**Interfaces:** `GlareCard({children, className}: {children: ReactNode; className?: string})` — a wrapper `<div>` that on pointer-move positions a radial highlight (CSS custom props `--glare-x/--glare-y`) and lifts slightly on hover (`transition: transform DUR.base`). Pure CSS/DOM, **no `motion` import**. Under reduced motion, the lift/glare are disabled via a `motion-reduce:` Tailwind variant or a `matchMedia` check.

- [ ] **Step 1:** Failing test — renders children; the root has `position: relative` / the glare layer is `aria-hidden`; a `pointermove` updates a style custom property.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement (adapt React Bits `GlareHover`). Glare layer `pointer-events-none` + `aria-hidden`. Respect `motion-reduce`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: GlareCard hover treatment (CSS-only)`.

### Task 6: MagneticButton

**Files:** Create `src/components/motion/magnetic-button.tsx`, `tests/motion/magnetic-button.test.tsx`.

**Interfaces:** `MagneticButton({children, href?, onClick?, className, strength?}: {children: ReactNode; href?: string; onClick?: () => void; className?: string; strength?: number})` — renders an `<a>` when `href` is set, else a `<button type="button">`. On pointer-move within a small radius, the element eases toward the cursor by `strength ?? 0.25` of the offset (spring via `motion`), snapping back on leave. A CSS shimmer sweep plays on hover. Under reduced motion: no translate, shimmer still allowed (it's subtle) or disabled — disable it, keep it simple.

- [ ] **Step 1:** Failing test — `href` → link with that href and the text; no `href` → `button[type=button]` that calls `onClick`; under reduced-motion no inline `transform: translate` after a simulated `pointermove`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement (adapt React Bits `Magnet`). Keyboard focus + activation must work unchanged (it's a real `<a>`/`<button>`).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: MagneticButton for primary CTAs`.

### Task 7: Noise

**Files:** Create `src/components/motion/noise.tsx`, `tests/motion/noise.test.tsx`.

**Interfaces:** `Noise()` — a `fixed inset-0 pointer-events-none z-[1] mix-blend-soft-light opacity-[0.035]` layer with an SVG `feTurbulence` data-URI background, `aria-hidden`. A very slow CSS `@keyframes` shifts the background position; under `prefers-reduced-motion` the animation is disabled (static grain). Add the keyframes to `globals.css`.

- [ ] **Step 1:** Failing test — renders one `aria-hidden` element, `pointer-events: none`, not focusable, contains no text.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. Keep opacity ≤ 0.04 so it reads as texture, not fog, on both themes.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: Noise grain overlay`.

### Task 8: ScrollSpin

**Files:** Create `src/components/motion/scroll-spin.tsx`, `tests/motion/scroll-spin.test.tsx`.

**Interfaces:** `ScrollSpin({children, max?, className}: {children: ReactNode; max?: number; className?: string})` — `'use client'`. Wraps `children` (the hero key-ring `<figure>` contents). Uses `motion`'s `useScroll` (target = the wrapper) + `useTransform` to map scroll progress 0→1 to `rotate` 0→`max ?? 18` degrees, applied to a `motion.div`. Under reduced motion, renders a static wrapper (no `rotate`). Exported via `next/dynamic(() => import(...), {ssr: false})` from a sibling `scroll-spin.client.tsx` if needed to keep it off the server path; simpler: mark the file `'use client'` and let the page import it directly — it hydrates lazily as a client component regardless.

- [ ] **Step 1:** Failing test — renders children; under reduced-motion the wrapper carries no `transform: rotate` inline style after render.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. `rotate` small (≤ 20°) — this is a gentle drift, not a spin.
- [ ] **Step 4:** Run → PASS. `npx tsc --noEmit`.
- [ ] **Step 5:** Commit: `feat: ScrollSpin for the hero key-ring`.

---

## Phase 3 — Shell + Beranda

### Task 9: Grain overlay + sliding nav indicator

**Files:** Modify `src/app/[locale]/layout.tsx`, `src/components/nav.tsx`, `src/components/nav-item.tsx`. Test: extend `tests/nav.test.tsx`.

- [ ] **Step 1:** Failing test — `tests/nav.test.tsx`: the active `NavItem` still gets `aria-current="page"` (unchanged); add: exactly one element with the indicator test-id (`data-testid="nav-indicator"`) renders, and it sits within the active item's row. (Keep it assertion-light — `motion`'s `layoutId` animation itself isn't unit-tested.)
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. In `Nav`, wrap the list in a `motion` context; in `NavItem`, when `active`, render `<motion.span layoutId="nav-indicator" data-testid="nav-indicator" className="... bg-accent-dim ...">` as the pill background (absolutely positioned behind the label), so `motion` animates it between items on route change. Non-active items render no indicator. Under reduced motion, the pill still shows on the active item (just no slide). In `layout.tsx`, add `<Noise />` as the first child of `<body>` after the theme script.
- [ ] **Step 4:** Run → PASS. `npm run test:e2e -- shell` still green (sidebar/theme/drawer unaffected).
- [ ] **Step 5:** Commit: `feat: grain overlay + sliding active-nav indicator`.

### Task 10: Beranda motion

**Files:** Modify `src/app/[locale]/page.tsx`, `src/components/image-card.tsx`, `src/components/research-card.tsx`. Create `e2e/motion.spec.ts`.

- [ ] **Step 1:** Failing e2e — `e2e/motion.spec.ts`:
  ```ts
  import {test, expect} from '@playwright/test';

  test('hero copy is visible on load without scrolling', async ({page}) => {
    await page.goto('/id');
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    await expect(page.getByText('Saya membangun perangkat lunak')).toBeVisible();
  });

  test('prefers-reduced-motion: hero art carries no rotation transform', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto('/id');
    const fig = page.locator('figure').first();
    const t = await fig.evaluate((el) => getComputedStyle(el).transform);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(t);
  });

  test('research stat reaches its final value', async ({page}) => {
    await page.goto('/id');
    await page.getByRole('heading', {name: /riset/i}).scrollIntoViewIfNeeded();
    await expect(page.getByText(/^\s*10\s*$/)).toBeVisible({timeout: 4000});
  });

  test('selected-work cards are all present and linked', async ({page}) => {
    await page.goto('/id');
    for (const name of ['SIAKAD Informatika', 'City Courier', 'MochiToon']) {
      await expect(page.getByRole('link', {name})).toBeVisible();
    }
  });
  ```
- [ ] **Step 2:** Run → the reduced-motion / counter tests FAIL (no motion yet the first two may pass).
- [ ] **Step 3:** Implement:
  - Hero: wrap eyebrow + `<h1>` + role + tagline + statement in a `Stagger`; each line a `Reveal` (small delay ladder). The `<figure>` inner images wrapped in `<ScrollSpin>`.
  - Each `<section>` (pillars, selected work, research, contact) wrapped in `Reveal as="section"` (keep the `aria-labelledby` on the same element — pass it through, or wrap inside).
  - Pillar cards / image-card grid: `Stagger` with per-card `Reveal`.
  - `ResearchCard`: the numeric `10` becomes `<Counter to={10} />` (keep the surrounding `attack scenarios` / label text as-is, still in `font-mono`).
  - `ImageCard`: wrap the `<div className="relative aspect-[16/10] ...">` media box in `<GlareCard>`.
  - Contact CTA: replace the `<Link className="... bg-accent ...">` with `<MagneticButton href={contactHref} className="... bg-accent ...">`.
- [ ] **Step 4:** Run → PASS (`npm run test:e2e -- motion` + the full `home`/`shell` specs still green). `npx tsc --noEmit`. `npm run build && npm run check:size` — **report the total**; must be < 210.
- [ ] **Step 5:** Commit: `feat: Beranda motion — hero stagger, scroll-spin, reveals, counter, glare, magnetic CTA`.

---

## Phase 4 — Remaining pages

### Task 11: Case-study body + detail

**Files:** Modify `src/components/case-study-body.tsx`, `src/app/[locale]/karya/[slug]/page.tsx`. Test: extend `tests/case-study-body.test.tsx`.

- [ ] **Step 1:** Failing test — `CaseStudyBody` still renders every section heading and every block's text (unchanged assertions), plus: each section is wrapped such that its content is present in the DOM without scrolling (query by text succeeds immediately).
- [ ] **Step 2:** Run → FAIL only if a wrapper hides content; otherwise write one new assertion that a `quote` block's text is present, then implement, keeping it green.
- [ ] **Step 3:** Implement — wrap each `<section>` in `Reveal`; render `quote` blocks inside a `Reveal` that also scales from `0.98`→`1` (add an optional `scaleIn` prop to `Reveal`). On the detail page, wrap the thumbnail `<figure>` so it gets a small `y` parallax via `useScroll`/`useTransform` (reuse `ScrollSpin`'s pattern or add a tiny `ParallaxY` — prefer reusing: generalise `ScrollSpin` to accept a `mode: 'rotate' | 'parallax'`? No — keep `ScrollSpin` single-purpose; add `src/components/motion/parallax-y.tsx` mirroring its structure, with its own test).
- [ ] **Step 4:** Run → PASS. `npm run test:e2e -- karya` green.
- [ ] **Step 5:** Commit: `feat: case-study reveals, quote scale-in, thumbnail parallax`.

### Task 12: About / Research / Achievements / Links / Karya list / 404

**Files:** Modify `src/app/[locale]/{tentang,riset,pencapaian,links,karya}/page.tsx`, `src/app/[locale]/not-found.tsx` (and `src/app/global-not-found.tsx` if it renders body content). Test: `e2e/routes.spec.ts` stays green; add nothing new unless a wrapper regresses "exactly one visible h1".

- [ ] **Step 1:** Run `npm run test:e2e -- routes` — record the green baseline.
- [ ] **Step 2:** Implement — wrap each page's body sections in `Reveal`/`Stagger`. Keep exactly one `<h1>` per page and heading order intact. The `links` page list: `Stagger` the link rows. 404: `Reveal` the heading + back-link on mount (use `whileInView` with the element already in view → reveals immediately).
- [ ] **Step 3:** Run → `npm run test:e2e` full suite green; `npx tsc --noEmit` clean.
- [ ] **Step 4:** Commit: `feat: scroll reveals across the remaining route pages`.

---

## Phase 5 — Verify + integrate

### Task 13: Full verification + docs + merge

- [ ] **Step 1:** Grep `src/` — confirm `from 'motion'` / `'framer-motion'` appears **only** under `src/components/motion/`. Fix any stray import by routing through a primitive.
- [ ] **Step 2:** Full suite:
  - `npm test` — all green (baseline 81 + the new primitive tests).
  - `npm run test:e2e` — all green (68 prior + `motion.spec.ts`; 10 still skipped).
  - `npx tsc --noEmit` — clean.
  - `npm run build && npm run check:size` — **report the KB**; must be < 210. If it's over, the first lever is lazy-loading `ScrollSpin`/`ParallaxY`/`Counter` via `next/dynamic({ssr:false})`; report before raising the budget.
- [ ] **Step 3:** Reduced-motion manual pass (or a scripted Playwright check): with `reducedMotion: 'reduce'`, load `/id` and `/id/karya/city-courier` — content fully visible, no transforms animating, counter shows `10`, grain static.
- [ ] **Step 4:** `README.md` — add a "Motion" line under Stack (one `motion` lib, all effects `prefers-reduced-motion`-aware, primitives in `src/components/motion/`). `docs/superpowers/SDD-ledger.md` — close-out bullet: what shipped, final KB, any deferral.
- [ ] **Step 5:** Commit: `test: verify motion pass; budget and a11y hold`. Push the branch.
- [ ] **Step 6:** Fast-forward the branch onto `main` if clean, push `main`. Report the final numbers and a before/after note.

---

## Self-Review

**Coverage vs the agreed design:** hero text reveal (T10) · scroll-tied key-ring (T8/T10) · section reveals everywhere (T10/T11/T12) · stat counter (T4/T10) · card glare+lift (T5/T10) · magnetic CTA (T6/T10) · sliding nav indicator (T9) · grain overlay (T7/T9) · reduced-motion everywhere (every task) · SSR-safe reveals (T3 constraint, T10/T11 e2e) · budget → 210 (T2) · Lighthouse a11y unchanged (T13). No WebGL / aurora / cursor-trail anywhere. ✓

**Placeholder scan:** none. Each primitive task carries its interface and a concrete test. Registry `add` commands are exact (`@react-bits/count-up`, `@react-bits/glare-hover`, `@react-bits/magnet`, `@react-bits/noise`) — if a name 404s, hand-roll from the interface (all are small).

**Type/name consistency:** `Reveal`, `Stagger`, `Counter`, `GlareCard`, `MagneticButton`, `Noise`, `ScrollSpin`, `ParallaxY` — each defined once in `src/components/motion/` and consumed by name. Constants `EASE`, `DUR`, `REVEAL_TRAVEL`, `STAGGER_STEP` from `@/lib/motion` used everywhere; no ad-hoc durations.

**Scope check:** one plan, one library, ~13 tasks, each independently testable. Fits.

## Execution Handoff

Run by a **claude** sub-agent in an Orca worktree off `main` (codex is at its usage limit). Controller dispatches phase-by-phase and reviews between phases, same as the code rebuild. Inline execution with `superpowers:executing-plans` inside the agent.
