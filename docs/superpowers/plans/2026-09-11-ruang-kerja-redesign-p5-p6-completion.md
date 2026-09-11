# Personal redesign — P5 and P6 completion

Status: Completed and verified, 2026-09-11. See `docs/superpowers/SDD-ledger.md` for
results and the reversible preview-archive decision made during cleanup.

Spec: `docs/superpowers/specs/2026-09-09-ruang-kerja-personal-redesign.md`.
Baseline: `0bf8606`; P1–P4 accepted as complete by the user.

## Constraints

Keep the approved Personal design and existing theme support; add no effects.
Use existing shared components, real content, ID/EN translations, locale-prefixed
paths, one h1 and sequential headings. Contact only copies a draft. Dashboard
statistics remain unavailable. Preserve metadata and research JSON-LD. Read
installed Next docs before Next-specific changes. Initial JS stays <=210 KB gzip.

## Task 1: P5 page integration

Wire research to a publication count/list and same-page PaperStory (anchor link,
no new research route), preserving JSON-LD. Wire achievements to AchievementFilters
with real ACHIEVEMENTS and pending-certificate note. Wire contact to SocialCard and
ContactDraftForm. Restyle the existing links without adding data; guestbook uses
DataEmpty. Every page uses PageHeading and SiteFooter. Add only required ID/EN keys.
Write and observe failing browser integration tests for achievement filtering/reset,
contact clipboard success/failure and no submission requests, research story and
localized related project. Implement, run targeted tests, commit, review.

## Task 2: P5 cleanup

Audit imports of retired hero/cards and motion wrappers. Remove confirmed orphan
components and their exclusive tests/assets; keep motion primitives per spec unless
explicitly retired (ScrollSpin). Keep design-preview until P6 is verified. Existing
tests must preserve coverage of live pages. Run units, typecheck, build, size, e2e.

## Task 3: P6 dashboard

Register /dasbor and /en/dashboard in routing, navigation and sitemap. Use the locked
nav order: home, about, achievements, work, research, dashboard, contact, links,
guestbook. Add dashboard page with GitHub, WakaTime and Monkeytype sections, 3
DashboardStat each, calendar ConnectionState and RepoGrid of 3 real case studies.
Use existing translated labels and add missing ones in both locales/requiredKeys.
Write failing tests for routing/SEO/nav and browser placeholder/locale navigation;
implement and run targeted tests. Commit and review.

## Task 4: Final verification and record

Run tsc, all unit tests, production build, size gate and full desktop/mobile e2e.
Inspect rendered pages in both themes and locales. Review whole branch; fix material
findings. Remove design-preview after confirming its resolved path and P6 completion.
Record actual verification results, decisions and deferred issues in SDD-ledger.
Commit on current branch; merging/pushing/deployment are separate actions.

## Preflight interface checks

| Tasks | Shared interface | Finding |
|---|---|---|
| 1 / 2 | ResearchCard and ContactRow callers | Cleanup follows wiring and import audit. |
| 1 / 3 | messages/id.json and en.json | Sequential implementation prevents edit conflicts. |
| 1 / 4 | Browser tests / Next server | Controller owns browser runs and build; no competing servers. |
| 2 / 3 | dashboard primitives | Keep DashboardStat, ConnectionState, RepoGrid. |
| 3 / 4 | routing, sitemap, nav | Verify both localized routes and indexability. |
| 1 | Research h3 list card | Provide preceding h2; same-page anchor targets story. |
| 2 | Motion retention | Keep live primitives; retire ScrollSpin and exclusive hero assets. |
| 3 | Placeholder truthfulness | Nine em dashes, no invented activity or fetched stats. |
| 4 | P4 ledger missing | Record user-provided completion separately from new verification. |
