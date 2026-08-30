// Next.js's global 404 (app/global-not-found.tsx, gated behind the
// `experimental.globalNotFound` flag in next.config.ts) handles URLs that
// don't match any route at all — including an invalid `/[locale]` segment,
// since that failure happens inside `[locale]/layout.tsx` itself, before it
// has rendered its own `<html>` shell for `[locale]/not-found.tsx` to sit
// inside. This file bypasses the app's normal rendering entirely, so it
// must define its own complete document (styles, fonts, `<html lang>`) and
// cannot rely on next-intl's request-scoped locale — it is deliberately the
// un-localized fallback, in the site's default language (id).
import type {Metadata} from 'next';
import {siteUrl} from '@/lib/site';
import {inter, interTight, jetbrainsMono} from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Halaman tidak ditemukan',
  description: 'Halaman yang kamu cari tidak ada atau sudah dipindahkan.'
};

export default function GlobalNotFound() {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-sm text-fg-muted">404</p>
          <h1 className="mt-4 font-display text-3xl text-fg">Halaman tidak ditemukan</h1>
          <p className="mt-4 text-fg-muted">
            Halaman yang kamu cari tidak ada atau sudah dipindahkan.
          </p>
          <a
            href="/"
            className="mt-8 font-mono text-sm text-accent underline underline-offset-4 hover:no-underline"
          >
            Kembali ke beranda
          </a>
        </main>
      </body>
    </html>
  );
}
