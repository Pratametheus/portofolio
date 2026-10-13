# Interactive Visual Effects, Guestbook Replies, Real Telemetry & CV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the portfolio with engaging visual effects (particle sparks, spotlight, true-focus text), instant Telegram alerts and owner replies on the guestbook, live telemetry data on the dashboard, and a CV link, while preserving the custom light/dark color palettes.

**Architecture:** Extend Cloudflare D1 schema for guestbook replies with Server Actions; integrate Telegram Bot API for real-time submission pings; implement lightweight React/Canvas visual effects adapted for the warm-paper and charcoal themes; fetch live GitHub GraphQL and WakaTime metrics for the dashboard.

**Tech Stack:** Next.js 16.3, React 19, Cloudflare D1 & Workers, HTML5 Canvas, Framer Motion / Motion, Tailwind CSS v4, Vitest, TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-07-interactive-visual-and-dashboard-features-design.md`

## Global Constraints

- Preserve the portfolio's custom color palette: Warm Paper (`#f7f3ec`) and Ochre (`#8f5f18`) on Light, Charcoal (`#25282a`) and Warm Neutral (`#b98558`) on Dark.
- Visual effects must honor `prefers-reduced-motion` and degrade gracefully without canvas errors or hydration mismatches.
- Telegram Bot notifications must fail-open (never fail user submission if Telegram API is unreachable or tokens are missing).
- Guestbook admin reply mutation must be strictly protected with `assertAdminAuth()`.
- Public routes, existing SEO metadata, OpenGraph, JSON-LD, and translations must remain intact and updated bilingually (`id` and `en`).
- All code changes must pass `npm run typecheck` and `npm test`.

## Review Focus

1. **Size Gate:** Ensure `scripts/check-bundle-size.mjs` is adjusted to 500 KB so canvas/effects do not trip the threshold.
2. **Hydration & Canvas Safety:** `ClickSpark` and `TrueFocus` must execute canvas and dimension measurements strictly after client mount.
3. **Database Migration:** D1 migration `0004` must run cleanly on both SQLite test harness (`tests/helpers/d1.ts`) and remote D1.
4. **Fail-Open Alerts:** Absence of `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` must not throw or block `submitGuestbookEntryAction`.
5. **Admin Auth Security:** Ensure only verified admin sessions can call `replyGuestbookEntryAction`.

---

### Task 1: Relax Size Gate & Setup Telemetry Data Fetchers

**Files:**
- Modify: `scripts/check-bundle-size.mjs`
- Create: `src/lib/services/telemetry.ts`
- Create: `tests/services/telemetry.test.ts`

- [ ] **Step 1: Write failing telemetry test**
  Test `fetchGitHubContributions` and `fetchWakaTimeStats` handling both valid API responses and fallback empty states when tokens are absent.
- [ ] **Step 2: Update bundle size budget**
  Change threshold in `package.json` (`scripts/check-bundle-size.mjs`) from 210 to 500.
- [ ] **Step 3: Implement telemetry fetchers**
  Implement GitHub GraphQL query and WakaTime stats fetcher with timeout and error handling.
- [ ] **Step 4: Run tests and commit**
  Verify `npx vitest run tests/services/telemetry.test.ts` passes.

---

### Task 2: D1 Migration & Guestbook Admin Reply Logic

**Files:**
- Create: `migrations/0004_add_guestbook_admin_reply.sql`
- Modify: `tests/helpers/d1.ts`
- Modify: `src/lib/repositories/guestbook.ts`
- Modify: `src/lib/actions/guestbook.ts`
- Modify: `tests/repositories/guestbook.test.ts`
- Modify: `tests/actions/guestbook.test.ts`

- [ ] **Step 1: Write migration SQL**
  Add `admin_reply TEXT` and `replied_at TEXT` to `guestbook_entries`.
- [ ] **Step 2: Update test D1 helper**
  Execute `0004_add_guestbook_admin_reply.sql` in `tests/helpers/d1.ts`.
- [ ] **Step 3: Write failing repository and action tests**
  Add tests for `replyGuestbookEntry` and `replyGuestbookEntryAction` asserting text update, timestamp recording, and admin auth requirement.
- [ ] **Step 4: Implement repository and action methods**
  Add `replyGuestbookEntry(db, id, replyText)` and `replyGuestbookEntryAction(id, formData)`.
- [ ] **Step 5: Run tests and commit**
  Verify `npx vitest run tests/repositories/guestbook.test.ts tests/actions/guestbook.test.ts` passes.

---

### Task 3: Telegram Bot Instant Alert Integration

**Files:**
- Create: `src/lib/telegram.ts`
- Create: `tests/lib/telegram.test.ts`
- Modify: `src/lib/actions/guestbook.ts`
- Modify: `tests/actions/guestbook.test.ts`

- [ ] **Step 1: Write failing test for Telegram alert helper**
  Assert `sendGuestbookTelegramAlert` formats message cleanly and handles missing environment variables or network failure gracefully without throwing.
- [ ] **Step 2: Implement Telegram notification helper**
  Send formatted Markdown/HTML message via `https://api.telegram.org/bot${token}/sendMessage`.
- [ ] **Step 3: Wire into `submitGuestbookEntryAction`**
  Trigger notification asynchronously after successful D1 entry creation.
- [ ] **Step 4: Run tests and commit**
  Verify `npx vitest run tests/lib/telegram.test.ts tests/actions/guestbook.test.ts` passes.

---

### Task 4: Guestbook Admin UI & Public Reply Rendering

**Files:**
- Modify: `src/components/admin/guestbook-list.tsx`
- Modify: `src/components/guestbook-entry-list.tsx`
- Modify: `messages/id.json`
- Modify: `messages/en.json`
- Modify: `tests/guestbook-entry-list.test.tsx`

- [ ] **Step 1: Write test for reply display**
  Add test in `tests/guestbook-entry-list.test.tsx` verifying that entries with `adminReply` render the official Ferry reply bubble with localized badge.
- [ ] **Step 2: Update translations**
  Add `adminReplyLabel`, `replyPlaceholder`, `replySubmit` keys in `messages/id.json` and `messages/en.json`.
- [ ] **Step 3: Implement admin reply UI**
  Add inline reply form in `GuestbookAdminList` to write and submit replies directly.
- [ ] **Step 4: Implement public reply UI**
  Render nested reply card with accent border, official badge, and localized date in `GuestbookEntryList`.
- [ ] **Step 5: Run tests and commit**
  Verify `npx vitest run tests/guestbook-entry-list.test.tsx` passes.

---

### Task 5: Live Dashboard Telemetry Integration

**Files:**
- Create: `src/components/dashboard/contribution-calendar.tsx`
- Create: `src/components/dashboard/wakatime-stats.tsx`
- Modify: `src/app/[locale]/dasbor/page.tsx`
- Modify: `messages/id.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Implement Contribution Calendar component**
  Render interactive GitHub commit squares with tooltip/count and month headers.
- [ ] **Step 2: Implement WakaTime Stats component**
  Display weekly hours, daily average, and percentage progress bars for top languages.
- [ ] **Step 3: Wire into `/dasbor` page**
  Fetch data from telemetry service; render live components if credentials exist, fallback cleanly if not.
- [ ] **Step 4: Run tests, typecheck, and commit.**

---

### Task 6: Visual Effects (ClickSpark, TrueFocus, SpotlightCard, DecryptedText)

**Files:**
- Create: `src/components/effects/click-spark.tsx`
- Create: `src/components/effects/true-focus.tsx`
- Create: `src/components/effects/spotlight-card.tsx`
- Create: `src/components/effects/decrypted-text.tsx`
- Modify: `src/app/[locale]/layout.tsx` (wrap with ClickSpark)
- Modify: `src/app/[locale]/page.tsx` (use TrueFocus on Hero headline)
- Modify: `src/components/work-card.tsx` (wrap with SpotlightCard)
- Modify: `src/components/publication-list-card.tsx` (use DecryptedText on research title)
- Create: `tests/effects/effects.test.tsx`

- [ ] **Step 1: Write unit tests for effects**
  Assert components render without crashing, mount safely on client, and respect reduced motion.
- [ ] **Step 2: Implement `ClickSpark`**
  HTML5 Canvas particle sparks on click/tap, configured with Ferry's Ochre (`#8f5f18`) and Warm Slate (`#b98558`).
- [ ] **Step 3: Implement `TrueFocus`**
  Dynamic animated focus box tracking keywords with smooth spring translation.
- [ ] **Step 4: Implement `SpotlightCard`**
  Radial gradient overlay tracking mouse position.
- [ ] **Step 5: Implement `DecryptedText`**
  Scramble/decrypt character effect on hover for cybersecurity/research themes.
- [ ] **Step 6: Integrate across public pages and test**
  Mount in layout, hero, and cards. Verify `npm test` and `npm run typecheck`.

---

### Task 7: Resume/CV Download Link & End-to-End Release Verification

**Files:**
- Modify: `src/app/[locale]/tentang/page.tsx`
- Modify: `messages/id.json`
- Modify: `messages/en.json`
- Test: Full verification suite

- [ ] **Step 1: Add CV action button on `/tentang`**
  Add localized *"Unduh CV / Resume"* button with icon and link to `/cv.pdf` or external document.
- [ ] **Step 2: Run full verification suite**
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
  - `npm run check:size`
- [ ] **Step 3: Commit and summarize implementation ready for deployment**
