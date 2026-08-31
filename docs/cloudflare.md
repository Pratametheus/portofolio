# Cloudflare deployment

## Product choice

Use **Cloudflare Workers + Static Assets**, with the **OpenNext adapter**.
The portfolio prerenders its content, but `src/proxy.ts` still negotiates locales
and rewrites English URLs. A Pages static export would require changing that
behavior. OpenNext retains the existing `next dev` and `next build` workflow.
Cloudflare now recommends vinext for new integrations, but it is beta; evaluate
its compatibility separately before changing this application's build system.

The configuration uses a read-only Static Assets cache for prerendered pages.
No R2, KV, D1, Durable Objects, or queue is needed for the current content.
Rebuild and redeploy to publish content changes. Before introducing ISR,
`revalidatePath`, `revalidateTag`, or cached server fetches, replace that cache
with a writable backend. A writable guestbook would also need its own database
and abuse protection; neither is provisioned here.

`IMAGES` supplies the OpenNext integration for the existing `next/image`
components. Check Cloudflare Images availability and usage limits before
production deployment. No subscription or billing settings are changed by
this repository's setup.

## Local commands

Use Node.js 22 or later (CI uses Node.js 24), and install dev dependencies:

```sh
npm ci
npm run dev              # existing Next.js development server
npm run cf:typegen       # regenerate ignored Cloudflare binding/runtime types
npm run cf:check         # build + production/staging dry runs; does not deploy
npm run cf:preview       # rebuild and preview in the local Workers runtime
```

OpenNext warns that Windows support is incomplete. Prefer WSL or Linux CI for
release builds if native Windows bundling or preview fails. The ordinary
Next.js development workflow remains available on Windows. OpenNext 1.20.4 also
labels Node.js middleware (`proxy.ts`) support experimental and not officially
maintained. Treat passing local routing checks as smoke coverage, not a guarantee
of full Next.js compatibility; test staging before production.

Wrangler has no `check` command in the installed version; `cf:check` uses its
supported `deploy --dry-run` command. The explicit esbuild dev dependency is
needed because OpenNext imports it from its CLI but does not list it as a
runtime dependency in version 1.20.4.

## Account and deployment

`wrangler.jsonc` targets Cloudflare account
`06d5d4ba7c6c2dcbbd02ceb7133e0163`. The top-level Worker is production
(`portofolio`); the named staging environment uses `portofolio-staging`.
Each environment has its own Worker self-reference. No custom-domain route is
configured, so deploying does not change the portfolio domain's DNS.

Cloudflare MCP authentication does **not** authenticate local Wrangler.
Complete the browser login yourself; never paste tokens into chat or commit
them into the repository:

```sh
npx wrangler login
npx wrangler whoami
npm run cf:deploy:staging
# After checking the staging site:
npm run cf:deploy
```

First open [Workers & Pages](https://dash.cloudflare.com/06d5d4ba7c6c2dcbbd02ceb7133e0163/workers-and-pages)
to initialize the account's workers.dev subdomain if it is still missing.
Check the actual URL printed by the successful deployment; no subdomain is
assumed here. Verify `/id`, `/en`, `/en/about`, `/en/work`, a case study, a
missing route, a static asset, and `/_next/image` before attaching the domain.

For CI deployment, use a scoped Cloudflare API token stored as the CI secret
`CLOUDFLARE_API_TOKEN`. The account ID is already in Wrangler configuration.
Use `npm run cf:deploy` as the single build-and-deploy command; do not run a
second separate Next.js build. Keep secrets out of `wrangler.jsonc`, and use
ignored `.dev.vars` files for local binding secrets.

## MCP inspection snapshot — 2026-08-31

Read-only Cloudflare MCP checks found:

- No Workers or Pages projects in the connected account.
- No workers.dev subdomain (Cloudflare API error 10007).
- An active zone for `ferryandhikapratama.com`.
- No DNS records at the zone apex or `www.ferryandhikapratama.com`.

Local `wrangler whoami` reported that Wrangler is not authenticated. No cloud
resources, DNS records, secrets, subscriptions, or live deployments were changed.
The app's canonical URL remains `https://ferryandhikapratama.com`.

MCP inspection uses the Cloudflare OpenAPI search tool to find endpoints, then
its execute tool to issue scoped GET requests. Use that same sequence for
follow-up inspections. Prefer the local OpenNext deploy command for this app's
multi-file Worker and static asset upload after authentication; MCP can inspect
the resulting Worker and deployment without handling local CLI credentials.

## References

- [Cloudflare Next.js guidance](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Cloudflare OpenNext configuration](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)
- [OpenNext SSG caching](https://opennext.js.org/cloudflare/caching)
- [OpenNext image optimization](https://opennext.js.org/cloudflare/howtos/image)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)

## Validation performed — 2026-08-31

- Existing unit suite: 27 files, 107 tests passed on Next.js 16.3.3.
- Final OpenNext build and both Wrangler deployment dry runs passed.
- Generated bundle: 2433.36 KiB gzip; 61 static asset files detected.
- TypeScript check passed; browser JS budget: 204.3 KB / 210 KB.
- npm dependency audit: zero reported vulnerabilities after pinning esbuild 0.28.2.
- Native Windows local Workers preview passed 13 HTTP checks: root redirect,
  both locale home pages, localized about/work pages, both case-study URLs,
  guestbook, 404, icon, optimized image, and immutable JavaScript asset caching.

These are local checks, not a deployed production verification. The browser
end-to-end suite and Linux CI were not run in this session. Live image service
availability, production resource limits, and public domain routing still need
validation after staging deployment.
