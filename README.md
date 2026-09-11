# portofolio

Personal portfolio of Ferry Andhika Pratama — software built for the work he
actually does himself: teaching computing at a primary school, writing a comic,
and publishing security research.

## Stack

- **Next.js 16.3.3** (App Router) + **React 19**
- **next-intl** — bilingual routing with localised pathnames (`id` default →
  `/karya`, `en` → `/work`)
- **Tailwind CSS v4** — two-theme token system: `@theme inline` maps every
  `--color-*` utility to a `var()` that a `data-theme` swap retints. Night is
  the server-rendered default; light is opt-in via `ThemeToggle`, applied
  before first paint by a tiny inline script (`src/lib/theme.ts`).
- **Motion** (`motion`, framer-motion v13) — the only animation library. Imported
  *only* by the shared primitives in `src/components/motion/` (`Reveal`, `Stagger`,
  `Counter`, `GlareCard`, `MagneticButton`, `Noise`, `ParallaxY`);
  pages compose those, never `motion` directly. Every effect is SSR-safe (content
  renders and is visible with no JS) and no-ops under `prefers-reduced-motion`.
  Below-the-fold islands (`Counter`, `MagneticButton`, `ParallaxY`)
  are `next/dynamic({ssr:false})` to keep `motion` out of the initial bundle.
- **Vitest** + **Testing Library** — unit tests
- **Playwright** — end-to-end tests
- `npm run check:size` — gates initial JS at a fixed gzip budget (210 KB, run in CI)

> This project runs Next.js 16.3.3, which carries breaking changes from earlier
> versions. Bundled docs live in `node_modules/next/dist/docs/`. Example: the
> `middleware.ts` convention is deprecated here in favour of `proxy.ts`.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unit
npm run test:e2e     # end-to-end
npm run build && npm run check:size   # production build + bundle-size gate
```

## Cloudflare deployment

Cloudflare Workers + Static Assets is configured through OpenNext. Run
`npm run cf:check` for a build and deployment dry run, or `npm run cf:preview`
to test in the Workers runtime. See [the deployment guide](docs/cloudflare.md)
for account setup, staging, production, and the MCP inspection results.

## Routes

Every route carries a locale prefix. English paths are localised, not just
prefixed.

| `id` | `en` | Page |
|---|---|---|
| `/id` | `/en` | Beranda / Home — introduction, filterable skills, selected work, research, contact |
| `/id/tentang` | `/en/about` | Biography, career, education empty state and skills |
| `/id/karya` | `/en/work` | Work cards with type and category filters |
| `/id/karya/[slug]` | `/en/work/[slug]` | Case study (8-part, `Article` JSON-LD) |
| `/id/riset` | `/en/research` | Publication card and same-page research story (`ScholarlyArticle` JSON-LD) |
| `/id/pencapaian` | `/en/achievements` | Searchable publication record with type/category filters |
| `/id/buku-tamu` | `/en/guestbook` | Guestbook (read-only shell; write path is a later phase) |
| `/id/kontak` | `/en/contact` | GitHub link and clipboard-only message draft; no message delivery |
| `/id/links` | `/en/links` | Link hub |
| `/id/dasbor` | `/en/dashboard` | GitHub, WakaTime and Monkeytype placeholders; three real case-study links |

Case-study slugs (`siakad-informatika`, `city-courier`, `mochitoon`) are
locale-independent so links survive a language switch.

The approved Personal design uses a profile rail, Source Sans 3, dark surfaces
with a yellow accent, and a warm light theme. The dashboard has no live integrations:
all nine statistics show an em dash and a not-connected label. Education history,
certificates, contact email and guestbook submission remain intentionally unavailable.

## Layout

| Path | Purpose |
|---|---|
| `src/app/[locale]/` | Localised route segments; `layout.tsx` is the themed shell (sidebar grid + no-flash script) |
| `src/app/globals.css` | Two-theme token sets + `@theme inline` map |
| `src/lib/theme.ts` | Theme constants + the pre-paint init script |
| `src/components/` | Profile rail and navigation, theme/locale controls, page and section headings, skills, work cards and filters, case-study body, publication and contact components |
| `src/components/motion/` | The only place `motion` is imported. SSR-safe, reduced-motion-aware primitives + their `.lazy.tsx` (`next/dynamic`) wrappers; `src/lib/motion.ts` holds the shared easing / duration / travel vocabulary |
| `src/content/case-studies/` | Case-study content as typed data, one file per project, both locales (not Markdown) |
| `src/lib/` | Content access, JSON-LD builders, site constants |
| `src/i18n/` | next-intl routing (`pathnames` map), navigation, message loading |
| `messages/{id,en}.json` | UI copy; `tests/messages.test.ts` enforces key parity |
| `scripts/check-bundle-size.mjs` | Initial-JS gzip budget check |
| `public/karya/`, `public/tech/` | Optimised case-study WebP thumbnails and brand SVG badges |
| `docs/spec/` | Phase specs (copy, architecture) |
| `docs/superpowers/` | Design spec, implementation plans, decision ledger, QA notes |

## License

MIT — see [`LICENSE`](./LICENSE).
