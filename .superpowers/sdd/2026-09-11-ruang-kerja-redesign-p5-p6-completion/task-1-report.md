# Task 1 report — P5 page integration

## Outcome

Integrated the Personal design into the research, achievements, contact, links,
and guestbook pages in both locales. Research keeps its ScholarlyArticle JSON-LD,
real publication data, ten-scenario account, same-page story anchor, and localized
City Courier link. Contact remains clipboard-only.

## TDD evidence

- RED: `npx playwright test e2e/personal-pages.spec.ts --project=chromium`
  failed 4/4 because the old pages had no achievement filters, contact form, or
  research count/story anchor.
- RED (review regression): the five-route heading-order test failed on
  `/id/pencapaian` and `/id/buku-tamu` because both skipped from h1 to h3.
- GREEN: `npx playwright test e2e/personal-pages.spec.ts e2e/routes.spec.ts e2e/motion.spec.ts --project=chromium`
  passed 26/26.
- GREEN: focused Vitest run passed 11/11 across messages, DataEmpty,
  publication, achievement filtering, and contact draft behavior.
- GREEN: `npx tsc --noEmit` passed.

The Playwright dev server emitted only the existing `NO_COLOR`/`FORCE_COLOR`
environment warning; no test or typecheck blocker remained.
