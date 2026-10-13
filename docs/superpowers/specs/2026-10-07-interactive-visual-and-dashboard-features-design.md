# Interactive Visual Effects, Guestbook Replies, Real Telemetry & CV Design

**Date:** 2026-10-07  
**Status:** Draft / Planned  
**Author:** Ferry Andhika Pratama & AI Assistant  

---

## 1. Intent & Overview

Following the UI/UX analysis of `satriabahari.my.id`, the portfolio will incorporate high-engagement interactive visual effects, owner replies and instant alerts in the guestbook, live telemetry data on the dashboard, and an official resume/CV download action—while maintaining the portfolio's signature light-mode warm-paper and ochre palette.

---

## 2. Core Requirements & Scope

### A. Relaxation of Bundle Size Gate
* **Goal:** Allow rich canvas particle effects, spotlight calculations, and chart visualizations without failing the hard 210 KB size limit.
* **Target:** Update `scripts/check-bundle-size.mjs` threshold to 500 KB (or remove blocking gate during local checks).

### B. Rich Interactive Visual Effects (Ferry-Themed)
1. **`ClickSpark` (Canvas Particle Sparks):**
   * Spawns radiant particle sparks on user click/tap anywhere on interactive surfaces.
   * Palette: Ochre (`#8f5f18`) in light mode, warm slate/gold (`#b98558`) in dark mode.
2. **`TrueFocus` (Dynamic Word Tracker):**
   * Animated framing box that cycles or focuses words dynamically in the hero heading.
   * Accessible fallback when `prefers-reduced-motion` is active.
3. **`SpotlightCard` / `GlareHover`:**
   * Radial gradient spotlight tracking mouse movement across case study cards and achievement cards.
4. **`DecryptedText` (Cybersecurity Scramble Effect):**
   * Matrix/decoder character reveal on hover for the research section and security project titles.
5. **`GlassIcon` / Interactive Stack:**
   * Interactive badges with subtle glass backdrop and hover elevation for skills.

### C. Guestbook Admin Replies (Point C)
1. **Database Schema:**
   * Migration `migrations/0004_add_guestbook_admin_reply.sql`:
     ```sql
     ALTER TABLE guestbook_entries ADD COLUMN admin_reply TEXT;
     ALTER TABLE guestbook_entries ADD COLUMN replied_at TEXT;
     ```
2. **Repository & Server Action:**
   * `replyGuestbookEntry(db, id, replyText)`
   * `replyGuestbookEntryAction(id, formData)` with `assertAdminAuth()`.
3. **Admin UI (`/admin/guestbook`):**
   * Inline reply input/drawer per message allowing the owner to write, update, or clear a reply.
4. **Public UI (`/[locale]/buku-tamu`):**
   * Approved messages with an `admin_reply` render a dedicated sub-card:
     * Label: *"Balasan dari Ferry"* / *"Reply from Ferry"*.
     * Special accent border, badge, and formatted `replied_at` date.

### D. Instant Telegram Alerts (Point B)
1. **Mechanism:**
   * Inside `submitGuestbookEntryAction`, once an entry is successfully validated and inserted into D1 (and not flagged by honeypot), trigger an asynchronous HTTP POST to Telegram Bot API:
     `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`.
2. **Notification Format:**
   * Notification includes: Name, Message, Website (if any), timestamp, and a link to moderate at `/admin/guestbook`.
3. **Resilience:**
   * Fail-open: If the Telegram API call fails or environment variables are not set, the message submission itself does not fail for the end user.

### E. Live Telemetry on `/dasbor` (Point A)
1. **GitHub Contribution Graph:**
   * Query GitHub GraphQL API for `contributionsCollection` using `GITHUB_TOKEN`.
   * Display interactive contribution calendar with daily commits and month markers.
   * Cached at Cloudflare edge (1 hour TTL).
2. **WakaTime Coding Activity:**
   * Fetch 7-day and all-time coding stats from WakaTime API using `WAKATIME_API_KEY`.
   * Display total coding hours, daily average, top languages, and editor stats.
   * Cached at Cloudflare edge (1 hour TTL).

### F. CV / Resume Access on `/tentang` (Pelengkap)
* Add a dedicated, accessible button/link in the biography section:
  * *"Unduh CV / Resume"* / *"Download CV / Resume"*.
  * Direct access to `/cv.pdf` or link to verified resume document.

---

## 3. Architecture & Data Flow

```
Visitor Submits Message
       │
       ▼
[Server Action: submitGuestbookEntryAction]
       │
       ├─► Insert into Cloudflare D1 (guestbook_entries)
       │
       └─► Async Telegram Bot Alert (POST to Telegram API)
              │
              ▼
       Ferry's Telegram Phone Notification
              │
              ▼
       Ferry opens /admin/guestbook & submits Reply
              │
              ▼
[Server Action: replyGuestbookEntryAction]
       │
       ▼
Updates D1 (admin_reply, replied_at)
       │
       ▼
Public Guestbook Page Displays Message + Ferry's Official Reply
```

---

## 4. Verification & Testing Strategy

1. **Unit & Component Tests:**
   * Test `ClickSpark` and `TrueFocus` render properly without crashes and honor reduced motion.
   * Test `replyGuestbookEntry` repository functions (CRUD for admin reply).
   * Test `replyGuestbookEntryAction` authorization and persistence.
   * Test Telegram alert trigger logic and failure isolation.
   * Test GitHub and WakaTime fetchers with mock responses.
2. **Build & Typecheck:**
   * `npm run typecheck` (`wrangler types` + `tsc --noEmit`).
   * `npm test` covering all repository, action, and component test suites.
   * `npm run build && npm run check:size` with updated threshold.
