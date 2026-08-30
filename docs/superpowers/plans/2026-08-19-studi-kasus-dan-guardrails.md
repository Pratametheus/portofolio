# Halaman Studi Kasus & Pagar Pengaman: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `sp-subagent-driven-development` (recommended) or `sp-executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat tiga studi kasus jadi halaman nyata yang bisa dibuka dan dibagikan, dengan JSON-LD hidup — sambil memasang pagar pengaman yang harus ada **sebelum** hero Three.js masuk.

**Architecture:** Konten studi kasus disimpan sebagai data terstruktur bertipe (paragraf, daftar, tabel sebagai array) — **bukan Markdown**. Alasannya di bawah. Rute `/[locale]/work` dan `/[locale]/work/[slug]` merender data itu. JSON-LD disuntikkan sebagai `<script type="application/ld+json">` di layout dan halaman detail.

**Tech Stack:** Next.js 16.3.2, React 19, TypeScript, Tailwind v4, next-intl, Vitest, Playwright

**Spec:** `docs/spec/FASE-3-Spec-Arsitektur.md`
**Copy sumber:** `docs/spec/FASE-2-Copy-Studi-Kasus.md`
**Rencana sebelumnya (fondasi):** `docs/superpowers/plans/2026-08-19-portofolio-fondasi.md`
**Utang teknis yang ditutup rencana ini:** `docs/superpowers/SDD-ledger.md` butir 1, 2, 3, 4, 9, 10

## Global Constraints

Semua constraint rencana fondasi tetap berlaku, ditambah:

- Node.js ≥ 20.11. Package manager: `npm`.
- Bahasa: `id` (default) dan `en`. Prefiks locale selalu tampil di URL.
- Warna HANYA dari token di `globals.css`. Dilarang menulis heksadesimal di komponen.
- Satu warna aksen: `--color-accent` (`#4ADE80`).
- Setiap angka, tanggal, dan istilah teknis dirender dengan kelas `font-mono`.
- Semua animasi menghormati `prefers-reduced-motion`.
- Tidak ada kode produksi tanpa test yang gagal lebih dulu.
- Commit setelah setiap task hijau, Conventional Commits.
- **Anggaran JS awal: < 150 KB gzip.** Baseline saat ini 143,5 KB — hanya tersisa ~6,5 KB. **Dilarang menambah dependensi runtime baru** tanpa mengukur dampaknya dan melaporkannya.
- **Dilarang menambah pustaka Markdown/MDX.** Konten adalah data terstruktur.
- Lighthouse Accessibility harus tetap **100**. Urutan heading tidak boleh melompat.

---

## Keputusan arsitektural yang dikunci di sini

**Konten sebagai data terstruktur, bukan Markdown.**
Tiga alasan: (1) anggaran JS sudah 96% terpakai — `react-markdown` + `remark` sendirian menghabiskan sisa anggaran; (2) data terstruktur bisa diuji parity antar-locale per-blok, Markdown hanya bisa diuji sebagai string; (3) delapan unsur studi kasus adalah struktur tetap, bukan prosa bebas — memaksanya jadi Markdown justru membuang strukturnya.
Biaya kalau salah: menulis konten jadi lebih kaku. Kalau nanti terbukti terlalu kaku, satu berkas konten diubah bentuk — bukan seluruh arsitektur.

---

## File Structure

| Berkas | Tanggung jawab |
|---|---|
| `src/content/types.ts` | Tipe `CaseStudy` diperluas: 8 unsur + blok konten |
| `src/content/case-studies/jurnalguru.ts` | Konten JurnalGuru, dua locale |
| `src/content/case-studies/city-courier.ts` | Konten City Courier, dua locale |
| `src/content/case-studies/mochitoon.ts` | Konten MochiToon, dua locale |
| `src/content/case-studies/index.ts` | Merakit ketiganya |
| `src/lib/content.ts` | `getAllCaseStudies`, `findCaseStudy` (aman untuk rute) |
| `src/lib/jsonld.ts` | + `buildCaseStudySchema()` |
| `src/components/json-ld.tsx` | Menyuntikkan `<script type="application/ld+json">` |
| `src/components/site-header.tsx` | Navigasi + pengalih bahasa |
| `src/components/locale-switcher.tsx` | Pengalih bahasa |
| `src/components/case-study-body.tsx` | Merender blok konten 8 unsur |
| `src/app/[locale]/work/page.tsx` | Daftar studi kasus |
| `src/app/[locale]/work/[slug]/page.tsx` | Halaman detail |
| `scripts/check-bundle-size.mjs` | Gate ukuran bundle untuk CI |
| `tests/`, `e2e/` | Test masing-masing |

Berkas konten dipecah per studi kasus (bukan satu berkas besar) karena tiap studi kasus akan tumbuh sampai ratusan baris, dan berkas yang berubah bersama harus tinggal bersama.

---

### Task 1: Pagar pengaman CI — build, e2e produksi, dan gate ukuran bundle

Ini task pertama dengan sengaja. Tiga cacat aksesibilitas Critical di rencana sebelumnya hanya terlihat di keluaran produksi, dan CI tidak pernah menjalankan `next build`. Hero Three.js akan datang dengan anggaran JS tersisa ~6,5 KB. Kedua lubang itu ditutup **sekarang**, selagi baseline masih murah.

**Files:**
- Create: `scripts/check-bundle-size.mjs`, `tests/bundle-size.test.ts`
- Modify: `.github/workflows/ci.yml`, `playwright.config.ts`, `package.json`

**Interfaces:**
- Consumes: keluaran `next build` di `.next/`
- Produces: perintah `npm run check:size` yang keluar dengan kode ≠ 0 kalau anggaran terlampaui

- [ ] **Step 1: Tulis test yang gagal untuk skrip pengukur**

Buat `tests/bundle-size.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {formatKb, parseBudget} from '../scripts/check-bundle-size.mjs';

describe('parseBudget', () => {
  it('membaca anggaran dalam kilobyte', () => {
    expect(parseBudget('150')).toBe(150 * 1024);
  });

  it('menolak nilai bukan angka', () => {
    expect(() => parseBudget('banyak')).toThrow('Anggaran harus angka kilobyte');
  });
});

describe('formatKb', () => {
  it('membulatkan ke satu desimal', () => {
    expect(formatKb(147968)).toBe('144.5 KB');
  });
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL**

Run: `npm test tests/bundle-size.test.ts`
Expected: FAIL — `Failed to resolve import "../scripts/check-bundle-size.mjs"`

- [ ] **Step 3: Tulis skrip**

Buat `scripts/check-bundle-size.mjs`. Ia harus:
- membaca `.next/build-manifest.json`, mengambil `rootMainFiles` ditambah berkas yang dirujuk halaman `/[locale]`
- meng-gzip tiap berkas (`zlib.gzipSync`) dan menjumlahkan ukurannya
- membandingkan dengan anggaran dari argumen CLI (default `150`)
- mencetak rincian per berkas dan total, lalu `process.exit(1)` kalau lewat
- mengekspor `parseBudget(value)` dan `formatKb(bytes)` supaya bisa diuji

```js
import {gzipSync} from 'node:zlib';
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';

export function parseBudget(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('Anggaran harus angka kilobyte');
  }
  return n * 1024;
}

export function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
```

Sisanya (pembacaan manifest, penjumlahan, pelaporan) ditulis implementer — struktur `build-manifest.json` **harus dibaca dari keluaran build nyata**, jangan diasumsikan. Kalau bentuknya berbeda dari dugaan, laporkan apa yang sebenarnya ada dan sesuaikan.

Tambahkan skrip: `"check:size": "node scripts/check-bundle-size.mjs 150"`

- [ ] **Step 4: Jalankan test unit, pastikan LULUS**

Run: `npm test tests/bundle-size.test.ts`
Expected: PASS, 3 test

- [ ] **Step 5: Jalankan gate terhadap build nyata dan catat baselinenya**

Run: `npx next build && npm run check:size`
Expected: LULUS, dan mencetak total mendekati 143,5 KB.
**Catat angka pastinya di laporan** — itu baseline yang akan dibandingkan di rencana berikutnya.

- [ ] **Step 6: Buktikan gate bisa gagal**

Jalankan `node scripts/check-bundle-size.mjs 100`.
Expected: keluar dengan kode 1 dan pesan yang menyebut kelebihannya. Catat outputnya.

- [ ] **Step 7: CI menjalankan build dan e2e terhadap server produksi**

Ubah `.github/workflows/ci.yml`: setelah `npm test`, tambahkan `npx next build`, lalu `npm run check:size`, baru e2e.
Ubah `playwright.config.ts`: `webServer.command` jadi `npm run start` (server produksi), dan gerbangi `reuseExistingServer: !process.env.CI`.
Pastikan `package.json` punya skrip `start`.

- [ ] **Step 8: Verifikasi e2e masih hijau terhadap server produksi**

Run: `npx next build && npx playwright test`
Expected: 26/26 lulus. Kalau ada yang gagal, **itu temuan nyata** — dev dan produksi berbeda perilaku. Laporkan, jangan tambal test-nya.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "ci: build in CI, run e2e against production server, gate bundle size"
```

---

### Task 2: `findCaseStudy` yang aman untuk rute

`getCaseStudy` melempar `Error`. Di App Router itu jadi HTTP 500, bukan 404 — setiap slug salah ketik jadi galat server di log dan bagi crawler.

**Files:**
- Modify: `src/lib/content.ts`, `tests/content.test.ts`

**Interfaces:**
- Produces: `findCaseStudy(slug, locale): CaseStudy | undefined`
- `getCaseStudy` **tetap ada apa adanya** — kontraknya benar untuk pemakaian di luar rute, dan sudah diuji

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan ke `tests/content.test.ts`:

```ts
describe('findCaseStudy', () => {
  it('mengembalikan studi kasus untuk slug yang dikenal', () => {
    expect(findCaseStudy('city-courier', 'id')?.slug).toBe('city-courier');
  });

  it('mengembalikan undefined untuk slug tak dikenal, bukan melempar', () => {
    expect(findCaseStudy('tidak-ada', 'id')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL** — `findCaseStudy is not a function`

- [ ] **Step 3: Implementasi**

```ts
export function findCaseStudy(slug: string, locale: Locale): CaseStudy | undefined {
  return caseStudies[locale].find((c) => c.slug === slug);
}
```

- [ ] **Step 4: Jalankan, pastikan LULUS**
- [ ] **Step 5: Commit** — `feat: add route-safe findCaseStudy`

---

### Task 3: Perluas tipe konten ke 8 unsur

**Files:**
- Modify: `src/content/types.ts`
- Create: `tests/content-shape.test.ts`
- Modify: `tests/content-parity.test.ts`

**Interfaces:**
- Produces:

```ts
export type ContentBlock =
  | {kind: 'paragraph'; text: string}
  | {kind: 'list'; items: string[]}
  | {kind: 'table'; head: string[]; rows: string[][]}
  | {kind: 'quote'; text: string}
  | {kind: 'note'; text: string};

export type CaseStudySection = {
  heading: string;
  blocks: ContentBlock[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  tagline: string;
  year: number;
  stack: string[];
  featured: boolean;
  /** Delapan unsur, berurutan: problem, user, solution, features, challenge, impact, techChoices, screenshots */
  sections: CaseStudySection[];
};
```

- [ ] **Step 1: Tulis test bentuk yang gagal**

Buat `tests/content-shape.test.ts` yang menegaskan, untuk **setiap** studi kasus di **kedua** locale:
- `sections` punya tepat 8 entri
- tiap `heading` tidak kosong
- tiap section punya ≥ 1 blok
- setiap `kind` blok adalah salah satu dari lima yang sah
- blok `table` punya jumlah kolom konsisten di semua baris (`row.length === head.length`)
- tidak ada `text` atau `items` yang kosong/hanya spasi

- [ ] **Step 2: Jalankan, pastikan GAGAL** — `sections` belum ada

- [ ] **Step 3: Perluas tipe dan tambahkan `sections` kosong sementara ke tiga studi kasus** supaya `tsc` hijau

- [ ] **Step 4: Test bentuk masih GAGAL** (0 ≠ 8 section) — ini benar, konten datang di Task 4

- [ ] **Step 5: Perluas test parity**

Tambahkan ke `tests/content-parity.test.ts`: `id` dan `en` harus punya jumlah section sama, urutan `kind` blok sama per section, dan bentuk tabel (jumlah kolom & baris) sama. Heading dan teks **harus berbeda** antar-locale (itu yang diterjemahkan).

- [ ] **Step 6: Commit** — `feat: expand CaseStudy type to eight structured sections`

---

### Task 4: Isi konten tiga studi kasus

Sumbernya `docs/spec/FASE-2-Copy-Studi-Kasus.md`. Ini task transkripsi, bukan penulisan.

**Files:**
- Create: `src/content/case-studies/jurnalguru.ts`, `city-courier.ts`, `mochitoon.ts`
- Modify: `src/content/case-studies/index.ts`

- [ ] **Step 1: Baca dokumen copy sepenuhnya sebelum menulis apa pun.**

- [ ] **Step 2: Pindahkan copy Indonesia ke struktur `sections`**, delapan unsur berurutan: Problem, User, Solution, Key Features, Challenge, Impact, Tech Choices, Screenshot.

**Aturan yang mengikat:**
- **Jangan menulis ulang, memperhalus, atau memperpendek copy-nya.** Ia sudah lewat proses penulisan tersendiri. Pindahkan apa adanya.
- Tabel "Sebelum/Sesudah" jadi blok `table`.
- Kutipan blok jadi `quote`.
- **Jangan mengarang angka.** Kalau copy tidak menyebut angka, jangan menambahkannya.
- Bagian Screenshot: heading + blok `note` yang mendeskripsikan gambar yang akan datang. **Belum ada gambar** — jangan merujuk berkas yang tidak ada.
- City Courier: **tanpa tautan repo, tanpa screenshot aplikasi, tanpa cuplikan kode.** Batas Rekam Publik masih berlaku.
- MochiToon: sinopsis publik boleh; naskah lengkap tidak boleh.

- [ ] **Step 3: Tulis versi Inggris**

**Terjemahan bukan tujuannya — tulis ulang.** Versi Inggris yang terbaca seperti hasil translate merusak kredibilitas seluruh dokumen. Pertahankan makna, struktur, dan urutan blok; ubah kalimatnya jadi bahasa Inggris yang wajar ditulis manusia.

- [ ] **Step 4: Jalankan test bentuk dan parity**

Run: `npm test tests/content-shape.test.ts tests/content-parity.test.ts`
Expected: PASS. Kalau parity gagal, biasanya jumlah blok berbeda antar-locale — samakan strukturnya, jangan longgarkan test-nya.

- [ ] **Step 5: Commit** — `content: add eight-section bodies for all three case studies`

---

### Task 5: Komponen `CaseStudyBody`

**Files:**
- Create: `src/components/case-study-body.tsx`, `tests/case-study-body.test.tsx`

**Interfaces:**
- Consumes: `CaseStudySection[]`
- Produces: `<CaseStudyBody sections={...} />`

- [ ] **Step 1: Tulis test yang gagal** — merender tiap heading sebagai `<h2>`; paragraf sebagai `<p>`; daftar sebagai `<ul>`/`<li>`; tabel sebagai `<table>` dengan `<th>` dari `head`; quote sebagai `<blockquote>`; dan **tabel harus punya `<caption>` atau `aria-label`** (syarat aksesibilitas).

Heading section adalah `<h2>` karena judul studi kasus adalah `<h1>`. Jangan melompat.

- [ ] **Step 2: Jalankan, pastikan GAGAL**
- [ ] **Step 3: Implementasi** — komponen server murni, nol state, nol `'use client'`
- [ ] **Step 4: Jalankan, pastikan LULUS**
- [ ] **Step 5: Commit** — `feat: add CaseStudyBody renderer`

---

### Task 6: Rute `/work` dan `/work/[slug]`

**Files:**
- Create: `src/app/[locale]/work/page.tsx`, `src/app/[locale]/work/[slug]/page.tsx`
- Create: `e2e/work.spec.ts`

- [ ] **Step 1: Tulis e2e yang gagal** — `/id/work` menampilkan tiga tautan studi kasus; mengklik yang pertama membuka halamannya; `/id/work/jurnalguru` punya `<h1>` berisi judul dan delapan `<h2>`; `/id/work/tidak-ada` mengembalikan **HTTP 404** (bukan 500 — periksa status responsnya, bukan sekadar teks di halaman); `/en/work/jurnalguru` menampilkan konten Inggris.

- [ ] **Step 2: Jalankan, pastikan GAGAL** (rute belum ada)

- [ ] **Step 3: Implementasi**

Keduanya memakai `generateStaticParams` (locale × slug), `setRequestLocale`, dan `generateMetadata` per studi kasus (judul, deskripsi dari tagline, `alternates.languages`). Halaman detail memakai `findCaseStudy` dan memanggil `notFound()` kalau `undefined`.

Baca `node_modules/next/dist/docs/` untuk konvensi `generateStaticParams` bersarang di Next 16 — **jangan berasumsi**.

- [ ] **Step 4: Jalankan e2e, pastikan LULUS**
- [ ] **Step 5: Verifikasi anggaran** — `npx next build && npm run check:size`. Catat pergerakan angkanya.
- [ ] **Step 6: Commit** — `feat: add work index and case study detail routes`

---

### Task 7: JSON-LD hidup

Lima test hijau, nol call site. Fitur SEO pembeda ini masih 0% aktif.

**Files:**
- Create: `src/components/json-ld.tsx`, `tests/json-ld-component.test.tsx`
- Modify: `src/lib/jsonld.ts` (+ `buildCaseStudySchema`), `src/app/[locale]/layout.tsx`, `src/app/[locale]/work/[slug]/page.tsx`

- [ ] **Step 1: Tulis test yang gagal** — `<JsonLd data={...} />` merender `<script type="application/ld+json">` yang isinya JSON valid dan sama dengan input setelah `JSON.parse`. Tambahkan test untuk `buildCaseStudySchema(caseStudy, locale)` → `@type: 'Article'` dengan `headline`, `inLanguage`, dan `author`.

- [ ] **Step 2: Jalankan, pastikan GAGAL**

- [ ] **Step 3: Implementasi.** Suntikkan `buildPersonSchema()` di layout locale; `buildScholarlyArticleSchema()` **hanya di beranda** (bukan tiap halaman); `buildCaseStudySchema()` di halaman detail.

Gunakan `JSON.stringify` dan `dangerouslySetInnerHTML`. **Escape `<` jadi `\\u003c`** untuk mencegah pemutusan tag dini — ini bukan paranoia, ini praktik standar untuk JSON-LD.

- [ ] **Step 4: Verifikasi di HTML hasil build** — `npx next build`, lalu grep `application/ld+json` di `.next/server/app/id.html` dan halaman detail. **Tempelkan potongan HTML nyatanya di laporan.**

- [ ] **Step 5: Commit** — `feat: render Person, ScholarlyArticle, and Article JSON-LD`

---

### Task 8: Navigasi situs + pengalih bahasa

Ini juga yang memecahkan test rapuh `toHaveCount(3)` — dengan sengaja, sekarang saatnya.

**Files:**
- Create: `src/components/site-header.tsx`, `src/components/locale-switcher.tsx`
- Modify: `src/app/[locale]/layout.tsx`, `e2e/home.spec.ts`
- Create: `tests/locale-switcher.test.tsx`

- [ ] **Step 1: Perbaiki test rapuh lebih dulu**

Di `e2e/home.spec.ts`, ganti `getByRole('link')).toHaveCount(3)` jadi query berlingkup ke wilayah karya, mis. `page.getByRole('region', {name: /karya|work/i}).getByRole('link')`. Jalankan — **harus masih hijau sebelum navigasi ditambahkan.**

- [ ] **Step 2: Tulis e2e yang gagal untuk navigasi** — header punya landmark `<nav>`; tautan Beranda dan Karya bekerja; pengalih bahasa memindahkan `/id/work/jurnalguru` → `/en/work/jurnalguru` (**mempertahankan halaman, bukan kembali ke beranda**); fokus keyboard terlihat di semua tautan header.

- [ ] **Step 3: Jalankan, pastikan GAGAL**

- [ ] **Step 4: Implementasi.** Pengalih bahasa perlu `'use client'` dan `usePathname` dari `@/i18n/navigation`.

> ⚠️ **Ini akan jadi client component pertama situs ini.** Ia menarik runtime klien next-intl ke dalam bundle. **Ukur sebelum dan sesudah** dan laporkan selisihnya. Kalau anggaran 150 KB terlampaui, **berhenti dan laporkan** — jangan menaikkan anggaran sendiri. Alternatif yang lebih murah kalau perlu: pengalih bahasa sebagai dua `<a>` biasa tanpa JavaScript, dihitung di server dari pathname.

- [ ] **Step 5: Jalankan seluruh test + gate ukuran**
- [ ] **Step 6: Commit** — `feat: add site header with navigation and locale switcher`

---

## Self-Review

**1. Cakupan spek.** Struktur halaman spek (`/work`, `/work/<slug>`) → Task 6 ✓. JSON-LD `Person`/`Article`/`ScholarlyArticle` → Task 7 ✓. `hreflang` → `alternates.languages` di Task 6 ✓. Bagian beranda (benang merah, riset, perkakas, kontak) → **belum, sengaja ditunda** ke rencana hero bersama Tahap D, karena beranda akan dibongkar ulang saat hero masuk. Versi Inggris penuh → Task 4 mencakup studi kasus; string antarmuka menyusul di rencana Tahap E.

**2. Pemindaian placeholder.** Task 1 Step 3, Task 4, dan Task 6 Step 3 sengaja menyerahkan sebagian detail ke implementer — masing-masing disertai instruksi eksplisit untuk **membaca sumber nyata** (`build-manifest.json`, dokumen copy, dokumen Next 16) alih-alih berasumsi, dan melaporkan kalau kenyataannya berbeda. Itu bukan placeholder; itu batas antara yang bisa kutentukan dari sini dan yang harus dibaca dari sistem.

**3. Konsistensi tipe.** `ContentBlock` dan `CaseStudySection` didefinisikan di Task 3 dan dipakai konsisten di Task 4, 5, 6. `findCaseStudy` (Task 2) dipakai Task 6. `buildCaseStudySchema` (Task 7) menerima `CaseStudy` dari Task 3.

**4. Urutan.** Task 1 lebih dulu karena semua task setelahnya menambah berat bundle, dan tanpa gate tidak ada yang tahu kapan anggaran jebol.

---

## Execution Handoff

Rencana ini tersimpan di `docs/superpowers/plans/2026-08-19-studi-kasus-dan-guardrails.md`. Dua pilihan eksekusi:

**1. Subagent-Driven (rekomendasi)** — satu subagent segar per task, ditinjau di antara task.

**2. Inline Execution** — berurutan di sesi ini dengan checkpoint.

---

## Rencana berikutnya (belum ditulis)

| Rencana | Isi | Utang yang ditutup |
|---|---|---|
| **3 — Hero 3D** | Beranda lengkap + hero Key Rotation + gate reduced-motion di sisi JS | butir 5, 6 |
| **4 — Versi Inggris** | String antarmuka EN + trim payload `NextIntlClientProvider` | butir 7 |
| **5 — Audit** | Lighthouse nyata, perbaiki sampai Accessibility 100 & Performance ≥ 90 | — |
| **Fase 4** | Guestbook D1 + Turnstile + rate limiting | — |
| **Fase 5** | Deploy Workers — **konfirmasi `@opennextjs/cloudflare` mendukung `proxy.ts` sebelum mulai** | butir 8 |
