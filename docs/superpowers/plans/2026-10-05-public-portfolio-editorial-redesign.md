# Public Portfolio Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh every public portfolio route into a coherent, responsive editorial experience while preserving current content, routes, behavior, and the existing light palette.

**Architecture:** Keep the current Next.js App Router, Tailwind v4 token system, `next-intl`, and Motion library. Establish the design system centrally in global tokens and shared public primitives, then apply it to existing public components and routes without altering admin, D1, Server Actions, or content sources. Preserve the existing animation components, calibrating their behavior and tests rather than adding a motion dependency.

**Tech Stack:** Next.js 16.3, React 19, TypeScript, Tailwind CSS v4, next-intl, Motion, Vitest, Testing Library, Playwright, OpenNext Cloudflare.

**Spec:** `docs/superpowers/specs/2026-10-05-public-portfolio-editorial-redesign-design.md`

## Global Constraints

- Public localized routes only. Do not modify `/admin`, database schema, repositories, Server Actions, authentication, Cloudflare setup, URLs, or content records.
- Preserve the current warm-paper light palette and its WCAG AA-safe contrast behavior.
- Replace the night theme with a charcoal/slate reading palette and muted warm accent, never a yellow-dominant dark palette.
- Use Source Sans 3 for reading/display and JetBrains Mono only for metadata/compact controls.
- Retain only purposeful motion: entry reveal, ordered list stagger, hover feedback, theme state, and mobile drawer state. Respect `prefers-reduced-motion`.
- Do not add dependencies, invented content, visual assets, metrics, testimonials, or claims.
- Every existing public interaction, real destination, empty/error/loading state, localization behavior, and keyboard behavior must survive the redesign.
- UI copy introduced by this work must not use em dashes.
- Verify at mobile and desktop breakpoints, in both themes, and with keyboard interaction.

## Review Focus

- Dark theme tokens: long body copy, muted copy, accent links, form fields, and success/error states must retain sufficient contrast against every charcoal/slate surface.
- Reduced motion: reveal/stagger components must render content visible and static before mount and when reduced motion is enabled.
- Mobile drawer: Escape, backdrop click, route navigation, and focus return must close the drawer without leaving focus behind the overlay.
- Data/filter states: a filtered-empty work or achievement list must retain its honest empty state after visual component changes.
- Public forms: guestbook and contact draft form labels, validation, success/error feedback, and submit behavior must survive changed classes and transitions.

---

## File Structure

- `src/app/globals.css`: public design tokens, dark theme retint, global focus/selection/scroll behavior, reduced-motion and interactive transition rules.
- `src/app/[locale]/layout.tsx`: public content shell width/spacing only.
- `src/components/sidebar.tsx`, `nav.tsx`, `nav-item.tsx`, `theme-toggle.tsx`, `locale-switcher.tsx`: public navigation and preference controls.
- `src/components/page-heading.tsx`, `section-head.tsx`, `site-footer.tsx`: shared editorial hierarchy primitives.
- `src/components/motion/reveal.tsx`, `src/lib/motion.ts`: calibrated public motion values and accessible reveal/stagger contract.
- Public record components: `work-card.tsx`, `work-filters.tsx`, `career-card.tsx`, `achievement-card.tsx`, `achievement-filters.tsx`, `publication-list-card.tsx`, `social-card.tsx`, `dashboard-stat.tsx`, `data-empty.tsx`, `skill-list.tsx`.
- Public interaction components: `guestbook-form.tsx`, `guestbook-entry-list.tsx`, `contact-draft-form.tsx`.
- Public route files under `src/app/[locale]/`: composition changes only where shared primitives cannot establish the intended reading order.
- Tests under `tests/` and `e2e/`: behavioral regression coverage for theme, motion, drawer, public filters, and forms.

---

### Task 1: Lock down public token and motion contracts

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/lib/motion.ts`
- Modify: `src/components/motion/reveal.tsx`
- Modify: `tests/motion/reveal.test.tsx`
- Create: `tests/public-theme-tokens.test.ts`

**Interfaces:**
- Consumes: existing `Theme` values `light | night`, `usePrefersReducedMotion()`, `DUR`, `EASE`, `REVEAL_TRAVEL`, and `STAGGER_STEP`.
- Produces: contrast-safe public CSS token contract for both themes and visible static rendering contract for `Reveal`/`Stagger` in non-animated contexts.

- [ ] **Step 1: Write failing token contract tests**

Create `tests/public-theme-tokens.test.ts` with assertions that `src/app/globals.css` contains the existing light variables `--bg: #f7f3ec`, `--accent: #8f5f18`, and night values for charcoal/slate surfaces plus a non-yellow-dominant accent. Assert global `:focus-visible` remains present and the reduced-motion media query disables animation/transition duration.

- [ ] **Step 2: Run the token contract test to verify it fails**

Run: `cd /home/hatch/projects/portofolio && npx vitest run tests/public-theme-tokens.test.ts`

Expected: FAIL because the current night palette still contains `--accent: #efd45d`.

- [ ] **Step 3: Retint public global tokens and calibrate motion constants**

In `src/app/globals.css`, retain the complete light token values. Replace only the night token values with charcoal/slate surfaces, off-white foreground, readable muted text, and muted warm neutral accent. Add only global rules needed for editorial reading, interaction transitions, visible focus, and reduced motion. Do not change admin-scoped selectors.

In `src/lib/motion.ts`, keep existing exported names and set reveal/stagger values to the spec's 200-350ms short entry range, 8-16px travel range, and measured list stagger.

- [ ] **Step 4: Write a failing reduced-motion regression test**

Extend `tests/motion/reveal.test.tsx` with a test that mocks reduced motion and renders a `Stagger` containing multiple `Reveal` children. Assert all child text remains visible and no initial hidden opacity is applied.

- [ ] **Step 5: Run the reveal regression test to verify it fails if the contract is absent**

Run: `cd /home/hatch/projects/portofolio && npx vitest run tests/motion/reveal.test.tsx`

Expected: The new assertion identifies any hidden pre-animation state. If it passes because the current component already satisfies the behavior, record that it protects an existing contract before visual refactoring.

- [ ] **Step 6: Update `Reveal` and `Stagger` only as required to preserve the visible-static contract**

Keep the exported component props unchanged. Ensure server render, pre-mount render, and reduced-motion render use visible final-state markup; animated entry can only start after mount and viewport entry.

- [ ] **Step 7: Verify token and motion tests**

Run: `cd /home/hatch/projects/portofolio && npx vitest run tests/public-theme-tokens.test.ts tests/motion/reveal.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/app/globals.css src/lib/motion.ts src/components/motion/reveal.tsx tests/public-theme-tokens.test.ts tests/motion/reveal.test.tsx
git commit -m "feat(ui): tetapkan token editorial dan motion publik"
```

### Task 2: Redesign the public shell, navigation, and theme controls

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/components/sidebar.tsx`
- Modify: `src/components/nav.tsx`
- Modify: `src/components/nav-item.tsx`
- Modify: `src/components/theme-toggle.tsx`
- Modify: `src/components/locale-switcher.tsx`
- Modify: `tests/sidebar.test.tsx`
- Modify: `tests/theme-toggle.test.tsx`
- Test: `e2e/personal-pages.spec.ts`

**Interfaces:**
- Consumes: `NAV_ITEMS`, `ThemeToggle`, `LocaleSwitcher`, `NavIndicatorGroup`, active path behavior, `Theme`, and sidebar focus trap behavior.
- Produces: editorial public shell that preserves the existing navigation map, theme persistence, locale switching, and accessible mobile drawer behavior.

- [ ] **Step 1: Write failing mobile-drawer behavior tests**

Extend `tests/sidebar.test.tsx` with tests that open the drawer, close it by clicking the labeled backdrop, and verify focus returns to the menu trigger. Add a test verifying the open drawer carries an accessible menu label and the trigger's `aria-expanded` changes correctly.

- [ ] **Step 2: Run sidebar tests to verify the new behavior test fails**

Run: `cd /home/hatch/projects/portofolio && npx vitest run tests/sidebar.test.tsx`

Expected: FAIL if the backdrop or focus-return behavior is not covered by current markup.

- [ ] **Step 3: Implement the mobile drawer editorial transition without changing its behavior contract**

Update `Sidebar` class composition and any minimal state needed so the drawer/backdrop uses short opacity and translation transition classes, has no persistent blur/glass treatment, and preserves focus trap, Escape, backdrop close, and route-close behavior. Keep all existing links and their destinations.

- [ ] **Step 4: Write a failing theme-control style/behavior test**

Extend `tests/theme-toggle.test.tsx` so clicking each option asserts `data-theme`, local storage, and `aria-pressed` state. Add an assertion that both controls preserve the theme group accessible name after class restructuring.

- [ ] **Step 5: Run theme tests to verify the new contract**

Run: `cd /home/hatch/projects/portofolio && npx vitest run tests/theme-toggle.test.tsx`

Expected: PASS for existing state behavior or FAIL only for newly added expectation before the implementation change.

- [ ] **Step 6: Implement flat editorial sidebar/nav/control styling**

Refine `layout.tsx`, `sidebar.tsx`, `nav.tsx`, `nav-item.tsx`, `theme-toggle.tsx`, and `locale-switcher.tsx` to use the shared token system: reduced visual weight, thin structural borders, restrained active state, and 44px-capable controls. Preserve `NAV_ITEMS` sequence, active-path resolution, work count, theme storage, locale route changes, and all accessible labels.

- [ ] **Step 7: Verify navigation unit behavior and public browser flow**

Run:
```bash
cd /home/hatch/projects/portofolio
npx vitest run tests/sidebar.test.tsx tests/theme-toggle.test.tsx
npm run test:e2e -- e2e/personal-pages.spec.ts
```

Expected: PASS. If Playwright browser is unavailable, record the runtime blocker and verify the links/drawer controls with Testing Library plus code inspection.

- [ ] **Step 8: Commit**

```bash
git add src/app/[locale]/layout.tsx src/components/sidebar.tsx src/components/nav.tsx src/components/nav-item.tsx src/components/theme-toggle.tsx src/components/locale-switcher.tsx tests/sidebar.test.tsx tests/theme-toggle.test.tsx e2e/personal-pages.spec.ts
git commit -m "feat(ui): sederhanakan shell dan navigasi publik"
```

### Task 3: Establish editorial page primitives and route rhythm

**Files:**
- Modify: `src/components/page-heading.tsx`
- Modify: `src/components/section-head.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/components/data-empty.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/tentang/page.tsx`
- Modify: `src/app/[locale]/riset/page.tsx`
- Modify: `src/app/[locale]/pencapaian/page.tsx`
- Modify: `src/app/[locale]/dasbor/page.tsx`
- Modify: `src/app/[locale]/kontak/page.tsx`
- Modify: `src/app/[locale]/links/page.tsx`
- Modify: `src/app/[locale]/buku-tamu/page.tsx`
- Test: `tests/page-heading.test.tsx`
- Test: `tests/data-empty.test.tsx`
- Test: `e2e/personal-pages.spec.ts`

**Interfaces:**
- Consumes: current `PageHeading({title, description})`, `SectionHead({icon?, title, description?, aside?})`, `SiteFooter()`, and `DataEmpty` props.
- Produces: stable public editorial heading, section, footer, and empty-state composition that every public route can reuse without altering content or data fetches.

- [ ] **Step 1: Write failing primitive semantic tests**

Extend `tests/page-heading.test.tsx` to assert a single H1, lead description, and a present structural divider class/data attribute. Extend `tests/data-empty.test.tsx` to assert semantic heading level, supplied description, and optional action remain in the document after the layout refactor.

- [ ] **Step 2: Run primitive tests to verify the changed contract**

Run: `cd /home/hatch/projects/portofolio && npx vitest run tests/page-heading.test.tsx tests/data-empty.test.tsx`

Expected: FAIL for newly requested editorial structural marker if not already present.

- [ ] **Step 3: Implement shared editorial primitives**

Update `PageHeading`, `SectionHead`, `SiteFooter`, and `DataEmpty` to use flat structural borders, consistent spacing, clear readable hierarchy, and no decorative repeated arrows. Keep public translations and semantic element levels unchanged.

- [ ] **Step 4: Apply primitives to public route composition**

Update only layout classes and composition in the listed public route files. Keep the specified reading order: introduction, supporting skills, featured work, and research on home; narrative then timelines on about; publication record on research; honest empty connections on dashboard; contact options then draft form; guestbook form then approved entries. Do not edit data calls, metadata behavior, route paths, or localized copy keys.

- [ ] **Step 5: Extend the public E2E smoke path**

In `e2e/personal-pages.spec.ts`, add or retain assertions that the homepage, work, research, contact, and guestbook pages each have one visible H1 and that the guestbook form remains reachable by its labels.

- [ ] **Step 6: Verify primitives and public route behavior**

Run:
```bash
cd /home/hatch/projects/portofolio
npx vitest run tests/page-heading.test.tsx tests/data-empty.test.tsx
npm run test:e2e -- e2e/personal-pages.spec.ts
```

Expected: PASS, or record the Playwright runtime blocker exactly while unit tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/page-heading.tsx src/components/section-head.tsx src/components/site-footer.tsx src/components/data-empty.tsx src/app/[locale] tests/page-heading.test.tsx tests/data-empty.test.tsx e2e/personal-pages.spec.ts
git commit -m "feat(ui): terapkan ritme editorial pada halaman publik"
```

### Task 4: Rework public records, lists, filters, and detail surfaces

**Files:**
- Modify: `src/components/work-card.tsx`
- Modify: `src/components/work-filters.tsx`
- Modify: `src/components/career-card.tsx`
- Modify: `src/components/achievement-card.tsx`
- Modify: `src/components/achievement-filters.tsx`
- Modify: `src/components/publication-list-card.tsx`
- Modify: `src/components/publication-cover.tsx`
- Modify: `src/components/record-tags.tsx`
- Modify: `src/components/tech-badge-row.tsx`
- Modify: `src/components/skill-list.tsx`
- Modify: `src/components/dashboard-stat.tsx`
- Modify: `src/components/social-card.tsx`
- Modify: `src/components/case-study-body.tsx`
- Modify: `src/app/[locale]/karya/[slug]/page.tsx`
- Test: `tests/work-card.test.tsx`
- Test: `tests/achievement-filters.test.tsx`
- Test: `tests/work-filters.test.tsx`

**Interfaces:**
- Consumes: `CaseStudy`, `Achievement`, `CareerEntry`, existing `getPathname()` output, localized labels, and all current filters.
- Produces: flat, scan-friendly public record surfaces with unaltered links, filter logic, detail disclosures, and real-data behavior.

- [ ] **Step 1: Write failing actionability/metadata tests for work cards**

Extend `tests/work-card.test.tsx` to assert the title and media destination remain localized and equal, featured labeling remains conditional, and the card does not rely on a duplicate CTA link for its sole route. Retain the test proving cover and technical asset paths are preserved.

- [ ] **Step 2: Run work-card tests to verify expectations**

Run: `cd /home/hatch/projects/portofolio && npx vitest run tests/work-card.test.tsx`

Expected: FAIL if the old repeated CTA markup does not meet the revised link hierarchy expectation.

- [ ] **Step 3: Implement editorial work/career/achievement/publication surfaces**

Recompose listed record components into readable rows or flat bordered blocks. Preserve image alt behavior, actual record data, details disclosure behavior, external link security attributes, localized topic/type labels, and filter inputs. Make hover/focus feedback small and purposeful; avoid broad shadow, glow, or identical decorative icon cards.

- [ ] **Step 4: Write failing filter-state regression tests if needed**

For each existing filter test file, add one assertion that a no-match condition shows the existing localized empty-state copy, and clearing/changing the filter makes a real existing item available again.

- [ ] **Step 5: Run filter and record tests**

Run:
```bash
cd /home/hatch/projects/portofolio
npx vitest run tests/work-card.test.tsx tests/work-filters.test.tsx tests/achievement-filters.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Verify public detail and list navigation**

Run: `cd /home/hatch/projects/portofolio && npm run test:e2e -- e2e/personal-pages.spec.ts`

Expected: Public work listing and its existing detail path pass. If browser execution is unavailable, document it and verify the localized `href` values through unit tests.

- [ ] **Step 7: Commit**

```bash
git add src/components/work-card.tsx src/components/work-filters.tsx src/components/career-card.tsx src/components/achievement-card.tsx src/components/achievement-filters.tsx src/components/publication-list-card.tsx src/components/publication-cover.tsx src/components/record-tags.tsx src/components/tech-badge-row.tsx src/components/skill-list.tsx src/components/dashboard-stat.tsx src/components/social-card.tsx src/components/case-study-body.tsx src/app/[locale]/karya/[slug]/page.tsx tests/work-card.test.tsx tests/work-filters.test.tsx tests/achievement-filters.test.tsx
git commit -m "feat(ui): ubah rekam karya publik menjadi daftar editorial"
```

### Task 5: Preserve form and guestbook interaction while applying the public system

**Files:**
- Modify: `src/components/contact-draft-form.tsx`
- Modify: `src/components/guestbook-form.tsx`
- Modify: `src/components/guestbook-entry-list.tsx`
- Modify: `tests/actions/guestbook.test.ts`
- Test: `tests/guestbook-form.test.tsx` (create if absent)
- Test: existing contact form component test, or create `tests/contact-draft-form.test.tsx` if absent

**Interfaces:**
- Consumes: `submitGuestbookEntryAction`, `GuestbookActionState`, public guestbook entry data, contact draft clipboard behavior, and existing translations.
- Produces: editorial form and public entry presentation while retaining validation, honeypot, submit pending state, success/error feedback, character count, and safe external website links.

- [ ] **Step 1: Write failing guestbook UI behavior tests**

Create `tests/guestbook-form.test.tsx` to render `GuestbookForm` with a mocked server action. Assert visible labels for name, optional website, and message; assert message count changes after typing; assert the submit control is disabled while pending; assert a successful result resets the form and announces status.

- [ ] **Step 2: Run the guestbook form test to verify it fails before test-specific implementation support**

Run: `cd /home/hatch/projects/portofolio && npx vitest run tests/guestbook-form.test.tsx`

Expected: FAIL until the action mock/pending-success behavior is wired correctly in the test harness or implementation.

- [ ] **Step 3: Implement editorial guestbook and contact form classes without changing behavior**

Update classes in the contact form, guestbook form, and guestbook list to match shared borders, spacing, controls, and flat entry treatment. Preserve all form names, action invocation, client state transitions, validation text, honeypot semantics, input constraints, safe rel attributes, date formatting, and public-only entry visibility.

- [ ] **Step 4: Add guestbook entry presentation regression test**

Extend the guestbook UI test or create `tests/guestbook-entry-list.test.tsx` asserting public entries render name, localized date, message, and an optional external website with `noopener noreferrer nofollow`; empty entries render the existing `DataEmpty` content.

- [ ] **Step 5: Run form/action tests**

Run:
```bash
cd /home/hatch/projects/portofolio
npx vitest run tests/guestbook-form.test.tsx tests/guestbook-entry-list.test.tsx tests/actions/guestbook.test.ts
```

Expected: PASS.

- [ ] **Step 6: Check public guestbook E2E path**

Run: `cd /home/hatch/projects/portofolio && npm run test:e2e -- e2e/personal-pages.spec.ts`

Expected: The form labels and page heading are visible. Do not submit a live production record during verification.

- [ ] **Step 7: Commit**

```bash
git add src/components/contact-draft-form.tsx src/components/guestbook-form.tsx src/components/guestbook-entry-list.tsx tests/guestbook-form.test.tsx tests/guestbook-entry-list.test.tsx tests/contact-draft-form.test.tsx tests/actions/guestbook.test.ts
git commit -m "feat(ui): rapikan interaksi kontak dan buku tamu publik"
```

### Task 6: Complete responsive visual QA and release verification

**Files:**
- Modify: `e2e/personal-pages.spec.ts`
- Modify: relevant component tests only where QA identifies a real regression
- Do not modify: `/admin/**`

**Interfaces:**
- Consumes: the completed public shell, routes, controls, components, and test suite from Tasks 1-5.
- Produces: verified public experience in light/dark and mobile/desktop, without an unverified admin change.

- [ ] **Step 1: Add desktop/mobile public shell checks**

Extend `e2e/personal-pages.spec.ts` with desktop and mobile viewport tests that confirm public navigation routes work, menu opens/closes at mobile width, theme controls are operable, and no element uses an unavailable destination.

- [ ] **Step 2: Run the E2E checks to observe actual browser status**

Run: `cd /home/hatch/projects/portofolio && npm run test:e2e -- e2e/personal-pages.spec.ts`

Expected: PASS. If the installed environment cannot launch Chromium, capture the exact command error and continue with code/unit checks rather than claiming a browser pass.

- [ ] **Step 3: Perform code-level theme and public scope audit**

Run:
```bash
cd /home/hatch/projects/portofolio
git diff --name-only HEAD~6..HEAD
rg "#efd45d|#f7f3ec|data-theme=\"night\"|data-theme=\"light\"" src/app/globals.css
rg "src/app/admin|src/components/admin" <(git diff --name-only HEAD~6..HEAD)
```

Expected: no admin files in the redesign diff; light palette values remain; night tokens no longer use the original dominant yellow accent.

- [ ] **Step 4: Run the full required verification sequence**

Run:
```bash
cd /home/hatch/projects/portofolio
npm run typecheck
npm test
npm run build
npm run check:size
npm run cf:build
```

Expected: all commands pass.

- [ ] **Step 5: Review interaction checklist manually or through browser automation**

Record results for: public navigation links, locale switcher, both theme selections, menu trigger, Escape close, backdrop close, work and achievement filters, work detail link, contact draft copy action, guestbook valid/invalid field feedback, and all empty states. Verify at mobile and desktop dimensions and in both themes.

- [ ] **Step 6: Commit**

```bash
git add e2e/personal-pages.spec.ts tests src app
git commit -m "test(ui): verifikasi responsif dan interaksi portofolio publik"
```

---

## Plan Self-Review

- **Spec coverage:** Tasks 1-2 cover visual tokens, night retint, shell, navigation, theme, locale, and motion. Task 3 covers shared hierarchy and all public route compositions. Task 4 covers public data records, filters, detail surfaces, and honest dashboard state. Task 5 covers the public contact and guestbook interaction surfaces. Task 6 covers responsive, theme, build, Cloudflare, and scope verification.
- **Step scan:** Each task starts from a test or behavior assertion, then runs a targeted command, makes a bounded implementation change, verifies, and commits.
- **Type consistency:** All existing component export names and props are retained. No newly invented production interfaces are required.
- **Review focus coverage:** Theme contrast is pinned in Task 1 and inspected in Task 6. Reduced motion is pinned in Task 1. Drawer close/focus behavior is pinned in Task 2. Filter empty state is pinned in Task 4. Form validation/feedback is pinned in Task 5.
- **Proportion:** The plan maps independent UI layers in six testable tasks without prescribing component bodies or copying the implementation.
