# portofolio

Personal portfolio of Ferry Andhika Pratama — software built for the work he
actually does himself: teaching computing at a primary school, writing a comic,
and publishing security research.

## Stack

- **Next.js 16.3.2** (App Router) + **React 19**
- **next-intl** — bilingual routing (`id` default, `en`)
- **Tailwind CSS v4** — design tokens in `src/app/globals.css`
- **Vitest** + **Testing Library** — unit tests
- **Playwright** — end-to-end tests

> This project runs Next.js 16.3.2, which carries breaking changes from earlier
> versions. Bundled docs live in `node_modules/next/dist/docs/`. Example: the
> `middleware.ts` convention is deprecated here in favour of `proxy.ts`.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unit
npm run test:e2e     # end-to-end
```

## Layout

| Path | Purpose |
|---|---|
| `src/app/[locale]/` | Localised routes |
| `src/content/case-studies/` | Case-study content as typed data (not Markdown) |
| `src/components/` | UI components |
| `src/lib/` | Content access, JSON-LD, site constants |
| `src/i18n/` | next-intl routing & message loading |
| `docs/spec/` | Phase specs (copy, architecture) |
| `docs/superpowers/` | Implementation plans & decision ledger |

## License

MIT — see [`LICENSE`](./LICENSE).
