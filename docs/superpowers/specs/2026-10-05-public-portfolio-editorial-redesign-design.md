# Public Portfolio Editorial Redesign

**Date:** 2026-10-05

## Intent

Refresh the public portfolio UI/UX with the calm, content-first rhythm observed in `satriabahari.my.id/id`, without copying that site's code, assets, navigation, or visual identity. The result remains recognizably Ferry Andhika Pratama's portfolio: a professional record of software, teaching, and research.

## Scope

### Included

- Public localized routes under `src/app/[locale]/`.
- Public shared navigation, typography, visual tokens, page headings, sections, cards/lists, forms, empty states, footer, and motion primitives.
- Light and dark themes.
- Responsive behavior from mobile through desktop.
- Existing public interaction behavior, accessibility behavior, and localization.

### Excluded

- All `/admin` pages and admin components.
- D1 schema, repositories, Server Actions, authentication, Cloudflare configuration, content records, URLs, and translation copy except when an existing UI label must remain exactly where it is.
- New images, avatars, logos, testimonials, metrics, or claims.
- Auto-playing animation, parallax, scroll-scrubbing, and continuous decorative motion.

## Design Direction

**Design read:** Public personal portfolio for professional readers reviewing real work, teaching, and research, in a calm editorial language. Dial: **ENERGY 2 / RHYTHM 2 / MOTION 2**.

The reference supplies principles, not a component template: readable single-column content, restrained dividers, measured whitespace, and feedback-led movement.

### Identity decisions

| Decision | Direction | Reason |
|---|---|---|
| Light palette | Retain existing warm paper, ochre accent, and contrast-safe token set. | The current light theme is already a recognized project identity and user-approved. |
| Dark palette | Charcoal and slate surfaces with off-white text and a muted warm neutral accent. | Dark mode should privilege prolonged reading and no longer compete with content through dominant yellow. |
| Typography | Retain Source Sans 3 as the reading and display family; restrict JetBrains Mono to metadata and compact controls. | The existing main face is readable for long Indonesian and English copy; monospace communicates metadata without becoming an aesthetic. |
| Content structure | Use a stable readable main column, small metadata, thin solid dividers, and editorial lists. | The visitor's primary task is reading evidence of work, not scanning a dashboard. |
| Surface treatment | Flat surfaces, fine borders, small-to-medium radii, no broad shadow language. | Borders establish hierarchy without making every block compete for elevation. |
| Accent | Use the accent for active location, key links, primary form action, focus, and select metadata only. | Accent remains a navigational cue rather than becoming a page-wide decoration. |
| Motion | Short reveal, stagger, hover, drawer, and theme transitions with reduced-motion fallback. | Movement orients visitors to changes and hierarchy without interrupting reading. |

## Global Shell

### Desktop

- Keep the existing left sidebar and public navigation destinations exactly as they are.
- Reduce visual weight of the identity block and give the navigation clearer line rhythm.
- Preserve the main content's readable one-column measure. Do not add dashboard rows, fake counters, logo strips, or decorative background grids.
- Keep the language and theme controls in the sidebar, with visible keyboard focus and text labels.

### Mobile

- Keep the existing compact header and functional menu control.
- Animate the navigation drawer using a short opacity/translation transition. Open state moves focus into the drawer; Escape and the backdrop close it; close returns focus to the trigger.
- All touch targets remain at least 44px in either dimension. No public route may have horizontal overflow.

### Theme behavior

- Maintain the existing functional theme toggle and persist behavior.
- Smoothly transition color changes only. Respect `prefers-reduced-motion` by suppressing nonessential transition/reveal behavior.
- Verify both themes across public components. The public light palette remains unchanged except for spacing/surface treatment changes required by this design.

## Shared Component Rules

### Headings and sections

- `PageHeading` becomes the consistent page entry point: a prominent readable title, a short introduction, and a thin solid divider.
- `SectionHead` differentiates content sections using title, optional description, and a compact real icon only where it identifies a domain such as research, work, teaching, or contact.
- Avoid redundant visual badges, wide-tracked pseudo-labels, and decorative arrows on every link.

### Lists and cards

- Prefer editorial rows and simple bordered blocks for work, career, achievement, publication, social, and guestbook items.
- Create hierarchy through text scale, alignment, whitespace, and border position, not large shadows, glow, or identical icon cards.
- Hover feedback is limited to color, border, media treatment, and small translation where it helps identify an actionable item.

### States and forms

- Preserve every current data state: loading where data is client-loaded, empty, error, valid submission, and invalid field feedback.
- Inputs retain visible labels, nearby validation feedback, and sufficient contrast in both themes.
- Do not imply real-time updates where data is refreshed through navigation or revalidation.

### Accessibility

- Preserve semantic heading order and real destinations for all navigation.
- Keep visible focus indicators and ensure overlays never obscure focused controls.
- Preserve keyboard operability for filters, theme and locale controls, mobile drawer, and form submission.
- Maintain WCAG AA contrast: 4.5:1 normal text, 3:1 large text.

## Route Composition

### Home

1. Editorial introduction: role/context and existing biographical copy.
2. Compact skills block as supporting evidence, not a decorative feature grid.
3. Featured case studies as the primary evidence section.
4. Research note as a concise publication block.
5. Quiet site footer.

The entry content receives a small reveal. Case study rows receive a short stagger. No fake evidence or numerical summaries are added.

### About

- Keep the biography as a readable narrative before career and education timelines.
- Retain timelines and their existing public database data.
- Treat skill content as a supplementary closing section.
- Preserve data-empty education messaging exactly as supplied by localization.

### Work and work detail

- Retain filter behavior and existing case-study routes.
- Reframe work previews as clear editorial records: title, context, technologies, and direct destination.
- On detail pages, sequence existing material as a reading narrative: context, problem, contribution, technical decisions, limitations/outcome, and related work where available.
- Keep media meaningful; do not add decorative imagery.

### Research and achievements

- Research reads as an accessible publication record: heading, verified metadata, summary, publication entry, and longer paper story.
- Achievements stay searchable/filterable and become an easier-to-scan record list.
- Do not introduce unverified citation, performance, publication, or career claims.

### Dashboard

- Preserve its honest connection/empty states and existing real case-study repository data.
- Simplify visual density so absent integrations do not look like broken metric cards.
- Do not invent values, trends, charts, or activity.

### Contact and links

- Contact options become clear flat blocks with their existing destinations and behavior.
- The draft form retains its clipboard feedback and accessible validation.
- Links remain a list of existing verified destinations.

### Guestbook

- Retain the interactive submission workflow, validation, honeypot, public approved listing, D1 persistence, and separate admin moderation.
- Give the form and entries the shared editorial treatment without changing fields, server actions, or publishing behavior.
- Use subtle visual feedback for successful interaction; do not present form submission as a live feed.

## Motion System

Motion is implemented from the existing `Reveal` and supporting motion components instead of introducing a new animation dependency.

| Interaction | Motion | Purpose | Reduced motion |
|---|---|---|---|
| Page/section entry | opacity plus small vertical translation, 200-350ms | Establish reading sequence | Render final static state |
| Repeating list entry | short ordered stagger | Reveal related records without simultaneous visual noise | Render all records static |
| Work/card hover | small border/color/media response, 150-220ms | Clarify that a record is actionable | Keep static but retain focus cue |
| Theme toggle | indicator and color transition, about 200ms | Confirm a state change | Instant state change |
| Mobile drawer | opacity and short translation, 180-240ms | Make navigation context change legible | Instant open/close |

No infinite animation, auto-play, parallax, scrolling progress effects, or content hidden from no-JavaScript readers is permitted.

## Files Expected to Change

- `src/app/globals.css`: public visual tokens, theme tokens, global focus and reduced-motion rules.
- `src/app/[locale]/layout.tsx`: public shell spacing only, not page behavior or routing.
- `src/components/sidebar.tsx`, `nav.tsx`, `nav-item.tsx`, `theme-toggle.tsx`, `locale-switcher.tsx`: public navigation treatment and motion.
- `src/components/page-heading.tsx`, `section-head.tsx`, `site-footer.tsx`: shared editorial composition.
- `src/components/work-card.tsx`, `work-filters.tsx`, `career-card.tsx`, `achievement-card.tsx`, `achievement-filters.tsx`, `publication-list-card.tsx`, `social-card.tsx`, `dashboard-stat.tsx`, `data-empty.tsx`, `guestbook-form.tsx`, `guestbook-entry-list.tsx`, `contact-draft-form.tsx`, `skill-list.tsx`: public content and interaction treatment.
- `src/components/motion/*`: calibrated reveal/drawer-related behavior and reduced-motion coverage.
- Public route files under `src/app/[locale]/`: only class composition and section ordering where required by the shared system.
- Existing unit/component tests and E2E tests: regression coverage for public navigation, theme, mobile drawer, forms, and routes.

## Verification Requirements

- `npm run typecheck`, `npm test`, `npm run build`, `npm run check:size`, and `npm run cf:build` must pass.
- Extend or add tests before visual implementation for changed interactive behavior.
- Execute available browser tests at desktop and mobile viewport widths. If the browser runtime remains unavailable, record the precise blocker and perform DOM/code-level verification instead.
- Verify every public navigation link, theme toggle, locale switcher, mobile drawer close methods, filters, contact draft form, and guestbook form behavior.
- Check the public site in light and dark themes, including empty/error/loading states where each applies.

## Acceptance Criteria

- Public pages present a coherent editorial, content-first experience inspired by the reference's principles but clearly retain the portfolio's own light palette, content, navigation, and identity.
- `/admin` visual and functional code is untouched.
- Every current public URL and interaction remains functional.
- Light mode retains the existing warm-paper palette; dark mode is visibly charcoal/slate and not yellow-dominant.
- Motion is purposeful, subtle, accessible, and disabled/reduced when requested.
- No unverified content, metrics, visual assets, claims, or new dependency is introduced.
