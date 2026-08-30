# portofolio

Personal portfolio of Ferry Andhika Pratama — software built for the work he
actually does himself: teaching computing at a primary school, writing a comic,
and publishing security research.

## Stack

- **Next.js 16.3.2** (App Router) + **React 19**
- **next-intl** — bilingual routing with localised pathnames (`id` default →
  `/karya`, `en` → `/work`)
- **Tailwind CSS v4** — two-theme token system: `@theme inline` maps every
  `--color-*` utility to a `var()` that a `data-theme` swap retints. Night is
  the server-rendered default; light is opt-in via `ThemeToggle`, applied
  before first paint by a tiny inline script (`src/lib/theme.ts`).
- **Vitest** + **Testing Library** — unit tests
- **Playwright** — end-to-end tests
- `npm run check:size` — gates initial JS at a fixed gzip budget (run in CI)

> This project runs Next.js 16.3.2, which carries breaking changes from earlier
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

## Routes

Every route carries a locale prefix. English paths are localised, not just
prefixed.

| `id` | `en` | Page |
|---|---|---|
| `/id` | `/en` | Beranda / Home — hero, three pillars, selected work, research, contact |
| `/id/tentang` | `/en/about` | About |
| `/id/karya` | `/en/work` | Work list |
| `/id/karya/[slug]` | `/en/work/[slug]` | Case study (8-part, `Article` JSON-LD) |
| `/id/riset` | `/en/research` | Research (`ScholarlyArticle` JSON-LD) |
| `/id/pencapaian` | `/en/achievements` | Achievements |
| `/id/buku-tamu` | `/en/guestbook` | Guestbook (read-only shell; write path is a later phase) |
| `/id/kontak` | `/en/contact` | Contact |
| `/id/links` | `/en/links` | Link hub |

Case-study slugs (`siakad-informatika`, `city-courier`, `mochitoon`) are
locale-independent so links survive a language switch.

## Layout

| Path | Purpose |
|---|---|
| `src/app/[locale]/` | Localised route segments; `layout.tsx` is the themed shell (sidebar grid + no-flash script) |
| `src/app/globals.css` | Two-theme token sets + `@theme inline` map |
| `src/lib/theme.ts` | Theme constants + the pre-paint init script |
| `src/components/` | `Sidebar` (rail + mobile drawer), `Nav`/`NavItem`, `ThemeToggle`, `LocaleSwitcher`, `ImageCard`, `CaseStudyBody`, `PillarCard`, `ResearchCard`, `ContactRow`, `Icon` |
| `src/content/case-studies/` | Case-study content as typed data, one file per project, both locales (not Markdown) |
| `src/lib/` | Content access, JSON-LD builders, site constants |
| `src/i18n/` | next-intl routing (`pathnames` map), navigation, message loading |
| `messages/{id,en}.json` | UI copy; `tests/messages.test.ts` enforces key parity |
| `scripts/check-bundle-size.mjs` | Initial-JS gzip budget check |
| `public/hero/`, `public/karya/` | Optimised WebP art (hero illustration, case-study thumbnails) |
| `docs/spec/` | Phase specs (copy, architecture) |
| `docs/superpowers/` | Design spec, implementation plans, decision ledger, QA notes |

## License

MIT — see [`LICENSE`](./LICENSE).
