# SDD ledger — plan: docs/superpowers/plans/2026-08-19-portofolio-fondasi.md

Spec: `docs/spec/FASE-3-Spec-Arsitektur.md` (dibaca ✓)

## Pre-flight rulings

**Ruling: Implementasi dikerjakan di container cloud, bukan langsung di `D:\Project\Portofolio`.**
— Kenapa: `device_bash` di mesin user TIDAK punya akses jaringan (diverifikasi: `git ls-remote` → BLOCKED). `npm install` dan `create-next-app` mustahil di sana, sehingga siklus RED-GREEN tidak bisa benar-benar dijalankan. Container punya jaringan + Node 22.22.2 + npm 10.9.7.
— Biaya kalau salah: sumber harus disalin ke device di akhir dan user menjalankan `npm install` sendiri. Murah, reversibel, tidak ada kehilangan data.

**Ruling: Bekerja langsung di branch `main`.**
— Kenapa: repo baru, nol commit, tidak ada riwayat yang perlu dilindungi. Worktree isolation menyelesaikan masalah yang belum ada di sini.
— Biaya kalau salah: nihil — riwayat linear dari kosong.

**Ruling: `create-next-app` (Task 1 Step 1) dikecualikan dari Iron Law TDD.**
— Kenapa: `sp-test-driven-development` mencantumkan "Generated code" sebagai pengecualian yang butuh persetujuan human partner. User sudah menyetujui rencana yang memuat urutan ini. Modul tulisan tangan pertama (`src/lib/site.ts`) tetap mengikuti TDD penuh.
— Biaya kalau salah: nihil — scaffold tidak memuat logika bisnis.

**Ruling: Task 4 diubah — tulis versi `flattenEntries` yang benar langsung.**
— Kenapa: teks rencana menyuruh menulis test yang selalu hijau di Step 1 lalu memperbaikinya di Step 3. Rubrik reviewer memperlakukan "test yang tidak meng-assert apa pun" sebagai defect, dan mempertahankan langkah itu berarti sengaja membuat temuan. Disiplin "buktikan test bisa gagal" tetap dipertahankan lewat Step 4 (sisipkan nilai kosong sementara, lihat FAIL, hapus).
— Biaya kalau salah: nihil — hasil akhirnya identik, satu langkah perantara dihapus.

**Ruling: Implementer memakai model termurah, reviewer satu tingkat di atas.**
— Kenapa: `sp-subagent-driven-development` Model Selection — "When the task's plan text contains the complete code to write, the implementation is transcription plus testing: use the cheapest tier." Rencana ini memuat kode lengkap di setiap langkah.
— Biaya kalau salah: fix-loop lebih banyak; ronde 4-5 otomatis naik tingkat.

## Pre-flight conflict scan

| # | Pasangan / Task | Menghasilkan → Mengonsumsi | Temuan |
|---|---|---|---|
| 1 | T1 → T6 | `siteName`, `siteUrl` dari `@/lib/site` | ✅ cocok |
| 2 | T2 → T8 | `--font-inter`, `--font-inter-tight`, `--font-jetbrains-mono` | ✅ nama variabel cocok dengan `fonts.ts` |
| 3 | T2 → T7 | token warna → kelas `bg-surface`, `border-border`, `text-fg`, `text-fg-muted`, `hover:border-accent` | ✅ Tailwind v4 `@theme` memetakan `--color-X` ke utilitas `X` |
| 4 | T3 → T8 | `routing.locales`, `routing.defaultLocale` | ✅ cocok |
| 5 | T5 → T7 | tipe `CaseStudy` (slug, title, tagline, year, stack, featured) | ✅ semua medan yang dipakai kartu ada |
| 6 | T5 → T8 | `getAllCaseStudies(locale)` | ✅ cocok |
| 7 | T3 → T9 | `messages/en.json` `home.tagline` → e2e cari teks "I build software" | ✅ substring cocok |
| 8 | T7 → T9 | kartu merender `<a>` → e2e `getByRole('link')).toHaveCount(3)` | ⚠️ **RAPUH.** Lulus sekarang karena T8 belum punya navigasi. Akan pecah begitu header/pengalih bahasa ditambahkan. **Ruling:** biarkan di rencana ini (benar untuk keadaan sekarang), tapi rencana berikutnya WAJIB mengubahnya jadi query berlingkup, mis. `getByRole('link', {name: /JurnalGuru/})`. Biaya kalau salah: satu test e2e merah di rencana berikutnya, ketahuan langsung. |
| 9 | T1 (internal) | test impor `@/lib/site`, alias didefinisikan di `vitest.config.ts` | ✅ konsisten |
| 10 | T2 (internal) | test membaca `globals.css` sebagai teks, mencocokkan string persis | ✅ Step 3 menulis format yang sama persis |
| 11 | T4 (internal) | test kelengkapan terjemahan vs isi `messages/*.json` dari T3 | ✅ setelah ruling di atas |
| 12 | T6 (internal) | `alumniOf` = "Universitas 17 Agustus 1945 Surabaya" | ✅ **DIKONFIRMASI user 19 Agu 2026** — bukan lagi tebakan |
| 13 | T8 (internal) | path impor `../globals.css` dan `../fonts` dari `[locale]/layout.tsx` | ✅ benar relatif ke `src/app/` |
| 14 | T9 (internal) | `webServer.reuseExistingServer` + dev server | ✅ |
| 15 | T10 (internal) | CI menjalankan `npx tsc --noEmit` — belum ada task yang menjamin nol galat tipe | ⚠️ **Ruling:** implementer T10 wajib menjalankan `npx tsc --noEmit` lokal dan memperbaiki galat tipe yang muncul sebelum commit. Biaya kalau salah: CI merah di push pertama, ketahuan segera. |

Dua temuan (#8, #15) sudah diputuskan. Sisanya bersih.

## Progress

Task 1: fix round 1/5 (2 important + 2 minor addressed, 0 open; commits 9b4cc8b..09bb45b)
Task 1: Ruling: implementer menjelaskan ketidakcocokan transkrip RED sebagai "Vite menormalkan format untuk tampilan". Klaim itu meragukan — code frame Vite adalah ekstraksi byte-per-byte, bukan hasil format ulang. TETAPI aku memverifikasi sendiri keadaan akhirnya: `npm test` 1/1 lulus dengan output nol warning, dan `npx next build` sukses. Kode benar terlepas dari kualitas transkripnya. Diparkir, bukan diperpanjang. — Biaya kalau salah: nihil; bukti nyata adalah verifikasi mandiriku, bukan transkrip subagent.
Task 1: complete (commits 9b4cc8b..09bb45b, review clean setelah 1 ronde)

## Ruling: cacat rencana ditemukan sebelum eksekusi — middleware.ts → proxy.ts

Rencana Task 3 menyuruh membuat `src/middleware.ts`. Dokumentasi bawaan Next.js 16.3.2
(`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md`)
menyatakan verbatim:

> "The `middleware.js` file convention has been **deprecated** in Next.js 16 and renamed to `proxy.js`.
>  All functionality remains the same — only the file and export names have changed."

**Ruling:** pakai `src/proxy.ts`, bukan `src/middleware.ts`. Menulis kode baru di atas konvensi
yang sudah deprecated adalah utang teknis yang lahir di hari pertama.
Verifikasi nyata tersedia: test e2e Task 9 "akar dialihkan ke bahasa Indonesia" akan langsung
membuktikan pengalihan locale bekerja atau tidak.
Fallback: kalau plugin next-intl ternyata mensyaratkan nama `middleware.ts`, implementer
kembali ke nama lama DAN mencatat alasannya di laporan.
— Biaya kalau salah: satu berkas di-rename, ketahuan langsung lewat e2e.

Catatan proses: cacat ini TIDAK terlihat di pre-flight scan karena scan hanya membandingkan
task satu sama lain, bukan terhadap versi framework. Yang menangkapnya adalah `AGENTS.md`
yang ditulis Next.js sendiri saat `next dev` pertama kali jalan.

## Ruling: temuan "transkrip TDD dipalsukan" DIBATALKAN — false positive, dua kali

Reviewer Task 1 dan reviewer Task 2-4 sama-sama melaporkan temuan Important yang sama:
transkrip RED yang di-paste implementer memakai kutip ganda + kurung berspasi, sementara
berkas yang di-commit memakai kutip tunggal + kurung rapat. Keduanya menyimpulkan
"code frame Vite adalah ekstraksi byte-per-byte, jadi transkrip ini tidak mungkin asli."

**Aku mengujinya sendiri alih-alih mengadili klaim.** Kutulis `tests/_probe.test.ts` dengan
kutip tunggal dan kurung rapat, lalu menjalankan vitest:

Berkas yang ditulis:
```
import {describe, expect, it} from 'vitest';
import {tidakAda} from '@/lib/tidak-ada';
```

Yang dicetak Vite:
```
1  |  import { describe, expect, it } from "vitest";
2  |  import { tidakAda } from "@/lib/tidak-ada";
3  |  describe("probe", () => {
4  |  	it("cek format code frame", () => {
```

Kutip ganda, kurung berspasi, dan tab sebelum `it` — persis pola yang dituduhkan.
**Code frame Vite menampilkan sumber SETELAH transform, bukan berkas mentah.**

**Ruling:** kedua temuan dibatalkan. Implementer Task 1 dan Task 2-4 tidak memalsukan apa pun,
dan penjelasan implementer Task 1 ("Vite menormalkan format untuk tampilan") ternyata BENAR —
aku sendiri sempat menyebutnya "meragukan" di ledger di atas. Catatan itu keliru; ini koreksinya.
— Biaya kalau salah: nihil. Bukti empiris ada di atas dan bisa direproduksi siapa pun.

**Pelajaran proses:** aku nyaris memaksa rework dua kali atas dasar temuan yang terdengar
sangat teknis dan meyakinkan. Yang menyelamatkannya adalah menguji klaim, bukan menimbangnya.
Reviewer berikutnya TIDAK akan lagi di-prime untuk mencurigai format transkrip.

Task 2: complete (commit 637b800, review clean)
Task 3: complete (commit 6534b00, review clean — proxy.ts terverifikasi live: / -> 307 -> /id)
Task 4: complete (commit b99170c, review clean)
Task 2-4: minor (deferred): flattenKeys & flattenEntries duplikasi tree-walk di tests/messages.test.ts
Task 2-4: minor (deferred): tidak ada test untuk ketidakcocokan bentuk nested antar-locale
Task 2-4: OPEN ⚠️ (controller-tracked): globals.css memakai var(--font-inter) dkk, tapi belum ada
  yang mendefinisikannya. Deklarasi font-family body saat ini invalid. DITUTUP oleh Task 8
  (src/app/fonts.ts). Wajib kuverifikasi saat Task 8 selesai — kalau tidak, constraint font gagal diam-diam.

## Ruling: localeDetection dimatikan BERTENTANGAN dengan spek — dibalik

Implementer Task 7-10 jujur melaporkan: test e2e `/` → `/id` gagal karena next-intl
mengikuti header Accept-Language dan mengalihkan ke `/en`. Solusinya: `localeDetection: false`.

**Masalahnya, spek mengatakan sebaliknya.** `docs/spec/FASE-3-Spec-Arsitektur.md:130`, verbatim:

> "`locale` = `id` | `en`. Akar `/` mengalihkan **sesuai bahasa peramban**, dengan `id` sebagai cadangan."

Jadi ini bukan bug di kode — ini **bug di test**, dan implementer memperbaiki kode agar cocok
dengan test yang salah. Persis pola yang instruksiku larang ("fix the code, not the tests")
tapi diterapkan ke arah yang keliru karena mereka tidak memegang spek.

`sp-subagent-driven-development`: *"the spec is the binding authority, the plan is its argument."*

**Ruling:** kembalikan deteksi locale (hapus `localeDetection: false`). Perbaiki test e2e supaya
menyatakan perilaku yang sebenarnya diinginkan:
- peramban berbahasa Indonesia → `/` mengalihkan ke `/id`
- peramban berbahasa Inggris → `/` mengalihkan ke `/en`
- bahasa lain (mis. `ja`) → `/` jatuh ke `/id`

Playwright bisa menyetel `locale` per context, jadi ketiganya bisa diuji sungguhan.

Kenapa ini penting di luar urusan kepatuhan: deteksi bahasa adalah UX yang lebih baik untuk
situs dwibahasa — pengunjung Indonesia dapat Indonesia, pengunjung internasional dapat Inggris,
tanpa harus mengklik apa pun. Mematikannya membuat setengah dari kerja i18n jadi sia-sia.
— Biaya kalau salah: satu baris konfigurasi + tiga test e2e. Ketahuan langsung.

Catatan: implementer melakukan hal yang BENAR dengan melaporkannya sebagai concern
alih-alih menyembunyikannya. Itulah yang membuat temuan ini muncul.
Task 5: complete (commit 53bca66, review clean)
Task 6: complete (commit 9f9e4dc, review clean)
Task 7: complete (commit 3565f3d, review clean)
Task 8: complete (commit f6a601a, review clean — Ruling C ditutup: fonts.ts mendefinisikan tepat 3 variabel yang dirujuk globals.css, terverifikasi sampai stylesheet ter-render)
Task 9: fix round 1/5 (1 important addressed, 0 open; commit 74bbdd8)
Task 9: complete (commit 0d24633..74bbdd8, review clean — 3 test locale dengan context terisolasi)
Task 10: complete (commit 3ab7570, review clean — guard executablePath terverifikasi inert di CI)
Task 7-10: minor (deferred): .gitignore disentuh di luar daftar berkas brief Task 9 (wajar: artefak Playwright)
Task 7-10: minor (deferred): reuseExistingServer: true tidak digerbangi !process.env.CI (plan-mandated)
Task 7-10: minor (deferred): key={tech} akan bentrok kalau ada entri stack duplikat

## Review menyeluruh akhir

Dijalankan pada model paling mampu. Menemukan 3 temuan CRITICAL yang lolos dari sepuluh
review per-task — persis alasan review menyeluruh ada:
- C1: tidak ada `<title>` di halaman mana pun (audit Lighthouse `document-title` masuk kategori Accessibility)
- C2: urutan heading melompat h1 → h3, tidak ada h2 (audit `heading-order`)
- C3: rute 404 merender `<html>` tanpa `lang` (audit `html-has-lang`)
Ketiganya membuat target spek "Lighthouse Accessibility 100" MUSTAHIL, dan tidak ada satu pun
test atau langkah CI yang mengatakannya.

Satu gelombang perbaikan (4 commit, 8e5f0e9..533e895) menutup 12 temuan: C1, C2, C3, I5, I7,
I9, M12, M13, M15, M16, M19, M20. Re-review berlingkup: semua ADDRESSED, nol breakage baru.

Verifikasi mandiri controller terhadap keluaran build sungguhan (bukan klaim subagent):
- `.next/server/app/{id,en}.html` → `<title>Ferry Andhika Pratama</title>` ✓
- `.next/server/app/_not-found.html` → `<html lang="id" class="...inter...">` ✓
- urutan heading id.html → h1, h2#selected-work-heading, h3, h3, h3 ✓
- unit 43/43, e2e 26/26, tsc bersih, next build sukses ✓

RENCANA SELESAI — 16 commit, semua task hijau, review akhir bersih.

---

# SDD ledger — plan: docs/superpowers/plans/2026-08-30-ruang-kerja-code.md

Spec: `docs/superpowers/specs/2026-08-30-ruang-kerja-design.md` · Figma: `0bLl0krxjy0mofkU4vCSe5`

Dieksekusi di worktree Orca `Pratametheus/ruang-kerja-code` oleh codex (gpt-5.6-sol),
di-review per fase oleh controller. 25 commit, TDD penuh.

## Rulings selama eksekusi

**Ruling: `Inter Tight` tidak tersedia — tipografi display tetap `Inter`.**
— Sudah diputuskan di Plan A; `globals.css` meng-alias `--font-display` ke `var(--font-inter)`.

**Ruling: cacat plan — `<head>` manual di `layout.tsx` mengosongkan `document.title` di dev.**
— Task 8 plan menaruh `<script>` tema di `<head>` manual. Build produksi tetap benar; `next dev` +
Playwright melihat `document.title === ''`. Amendment `a543089`: `<script>` jadi anak pertama
`<body>`, tanpa `<head>`. Ketahuan langsung lewat e2e.

**Ruling: cacat plan — Task 10 "rewrite" `content-parity.test.ts` menghapus ~13 assertion nilai.**
— Assertion year/stack/featured/title identik, tagline benar-benar diterjemahkan, stack tanpa
duplikat hilang. `d0aae5c` (controller) mengembalikannya di samping tes parity struktural baru.

**Ruling: cacat plan — Task 15 tidak menyebut ilustrasi hero operator di Beranda (spec §3 wajib).**
— Ditambahkan bersama Task 18 (`0def842`): dua `<Image>` night/light, di-swap lewat CSS `[data-theme]`.

**Ruling: anggaran JS awal 150 KB → 160 KB (disetujui user 2026-08-30).**
— Baseline FASE-3 (143,5 KB) diukur saat situs satu halaman statis tanpa JS klien. Rebuild menambah
`ThemeToggle`, `LocaleSwitcher`, `Nav`, `Sidebar` (drawer), `next/image` — semua load-bearing.
Total terukur **155,4 KB**. Gate `npm run check:size` memakai 160. Kandidat penghematan bila perlu
diperketat: ganti wrapper navigasi klien next-intl dengan `next/navigation` mentah di `Nav`/`Sidebar`.

**Ruling: Lighthouse di CI (job `lighthouse`, `treosh/lighthouse-ci-action`).**
— Tidak ada CLI lokal. `lighthouserc.json`: Accessibility `error` (wajib 100); Performance/SEO/LCP
`warn` sampai ambang disetel dari run CI nyata.

## Verifikasi akhir controller (bukan klaim codex)

- unit **81/81** (19 berkas), e2e **68/68** (chromium + mobile), `tsc --noEmit` bersih
- `next build` → **27 halaman statis**, kedua locale, semua rute ter-prerender
- `npm run check:size` → 155,4 KB / 160,0 KB ✓
- `.next/server/app/{id,en}.html` → `<title>Ferry Andhika Pratama</title>` ✓
- 5 e2e old-Beranda yang di-skip di Fase 2 sudah di-un-skip & hijau setelah Task 15

RENCANA SELESAI — siap merge ke `main`.

---

# SDD ledger — plan: docs/superpowers/plans/2026-08-31-ruang-kerja-motion.md

Spec: kesepakatan chat 2026-08-31 (rencana ini adalah rekamannya). Konteks: `docs/superpowers/specs/2026-08-30-ruang-kerja-design.md`.

Dieksekusi di worktree Orca `Pratametheus/ruang-kerja-motion` oleh claude (codex di batas kuota).

## Rulings selama eksekusi

**Ruling: 2026-08-31 — cacat plan, `shadcn init` CLI sudah berganti antarmuka.**
— Task 1 Step 1 memanggil `npx shadcn@latest init --base-color neutral --css-variables --yes`.
shadcn CLI kini `4.19.0`: `--base-color` dihapus, init berbasis preset (Nova/Vega/...), dan `-y`
tetap membuka prompt preset interaktif. Menjalankan `init -d` (preset `base-nova`) menulis
`components.json` + `src/lib/utils.ts` (bagus) tapi juga menyuntik seluruh sistem token oklch
shadcn + varian `.dark` + `@layer base` ke `globals.css`, dan menambah `@base-ui/react`,
`lucide-react`, `class-variance-authority`, `tw-animate-css`, `shadcn` (sebagai runtime dep),
plus `src/components/ui/button.tsx`.
— Tindakan: `git checkout` `globals.css`/`package.json`/`package-lock.json`, hapus `src/components/ui/`,
pertahankan `components.json` + `src/lib/utils.ts`, `npm i clsx tailwind-merge` (dua-duanya nol-dep)
supaya `cn()` hidup. `components.json` `registries` di-set manual ke `@react-bits` + `@componentry`.
Ini persis jalur yang plan Step 1 sanksikan ("revert any colour/token changes shadcn makes").
— Verifikasi: `git diff src/app/globals.css` kosong; `npx shadcn view @react-bits/CountUp-TS-CSS`
dan `@componentry/border-beam` sama-sama mengembalikan JSON registry-item (wiring dua registry OK).
Perintah literal plan `shadcn view @react-bits @componentry` (namespace telanjang) tidak lagi
didukung CLI 4.19 — persyaratan sebenarnya (registry terdaftar & resolvable) tetap terbukti.
— Catatan Fase 2: nama item tebakan plan (`count-up`, `glare-hover`, `magnet`, `noise`) mengembalikan
HTML fallback SPA; nama nyata react-bits berpola `CountUp-TS-CSS` (PascalCase + `-TS-CSS`). Plan
Self-Review sudah mengantisipasi ("if a name 404s, hand-roll from the interface").
— Biaya kalau salah: nihil — hasil akhir identik dengan maksud plan, satu berkas cruft dihapus.

**Ruling: 2026-08-31 — `npm i motion` me-resolve v13, bukan v12.**
— Global Constraints menyebut "`motion` (framer-motion v12)"; Task 2 Step 3 memerintah `npm i motion`
telanjang dan "record the resolved version". Yang ter-resolve: **`motion@13.1.1`** (pin `^13.1.1`).
Plan menunda ke versi yang ter-resolve, jadi ini yang dipakai. API yang dipakai primitif plan
(`whileInView`, `useReducedMotion`, `useScroll`, `useTransform`, `useMotionValue`, `animate`,
`useInView`, `layoutId`) stabil v11→v13, dan Fase 1 belum meng-import `motion` di mana pun —
risiko API ditunda ke Fase 2.
— Biaya kalau salah: satu pin diturunkan ke `^12`, ketahuan saat primitif pertama dikompilasi.

**Ruling: anggaran JS 160 KB → 210 KB (disetujui user 2026-08-31).**
— Gate `npm run check:size` naik dari `160` ke `210` (Task 2 Step 5). Alasan: motion pass menambah
satu pustaka animasi (`motion` v13) yang di-import oleh primitif bersama di `src/components/motion/*`
plus efek turunannya (Reveal/Stagger/Counter/GlareCard/MagneticButton/Noise/ScrollSpin). Preseden
FASE-3 mengizinkan ≤200 KB untuk efek; user menyetujui 210 KB pada 2026-08-31 sebagai plafon keras
("Do not exceed 210 without sign-off"). Total nyata diukur ulang setelah Fase 3 dan di akhir.

**Ruling: 2026-08-31 — dua penyimpangan test-infra di Fase 2 (Task 3).**
— (a) `vitest.setup.ts` menambah stub `IntersectionObserver`. jsdom tidak menyediakannya, dan
`motion` v13 `whileInView` / `useInView` **melempar** tanpa itu (tidak ada fallback). Stub melapor
target langsung in-view. Hanya infrastruktur tes — nol kode produksi; suite penuh tetap hijau.
— (b) Berkas baru `src/components/motion/use-reduced-motion.ts` (berkas ke-7 di direktori itu, tidak
ada di tabel File Structure plan). `motion` v13 `useReducedMotion()` men-sample setelan sekali per
proses lewat singleton modul dan tak pernah membaca ulang — basi setelah mount pertama dan tak
kompatibel dengan swap `matchMedia` per-tes yang dipakai tes verbatim plan. Hook menjaga
`useReducedMotion()` **dan** menambah langganan `matchMedia('(prefers-reduced-motion: reduce)')`
langsung; sinyal mana pun true ⇒ tanpa gerak. Dikonsumsi Reveal, Stagger, Counter, MagneticButton,
ScrollSpin. GlareCard + Noise pakai CSS `motion-safe:` / `motion-reduce:` murni.
— Biaya kalau salah: (a) satu berkas setup dikembalikan bila jsdom kelak punya IO; (b) hook di-inline
 per-primitif — identik secara perilaku, hanya lebih banyak duplikasi.

## Progress

Task 1: complete (commit 284c95c) — `components.json` (2 registry), `src/lib/utils.ts` (`cn`),
  `clsx`+`tailwind-merge`. `globals.css` tak tersentuh, unit 81/81, tsc bersih.
Task 2: complete (commit c69f087) — `motion@^13.1.1`, `src/lib/motion.ts` (EASE/DUR/REVEAL_TRAVEL/
  STAGGER_STEP), gate `check:size` 160→210. Build 155.4 KB (motion belum ke-import). unit 85/85.
Tasks 3–8: complete (commits 200d460, 49a4469, 36e83bb, 1f56c10, 3bb4647, 60c9f83) — enam primitif
  TDD, tiap RED = `Failed to resolve import "@/components/motion/*"`. unit 101/101, tsc bersih,
  import-boundary bersih (`motion` hanya di `src/components/motion/*`), build tetap 155.4 KB.
Fase 2 close-out: commit cf73dfa (docs: catatan dua penyimpangan test-infra).
Task 9: complete (commit af60cca) — grain overlay di `layout.tsx` + indikator nav geser
  (`layoutId`). Ruling: `motion.span` TIDAK di `nav-item.tsx` (langgar batas import); dibungkus
  primitif baru `src/components/motion/nav-indicator.tsx`. unit 102, e2e shell 8/8.
Task 10: complete (commit 9c41253) — Beranda: hero Stagger/Reveal, ScrollSpin, section reveals,
  Counter, GlareCard, MagneticButton CTA. Ruling: dua locator verbatim `motion.spec.ts` ambigu
  (`getByText('Saya membangun…')` → `.first()`; `/riset/i` → `/^riset/i`). `ResearchCard` belum
  punya angka "10" → ditambah baris statistik + kunci `research.paper.scenarios` (dua locale).
  Bundle 155.4 → **209.9 KB** (motion masuk graf `/[locale]`).
Task 11: complete (commit d45c661) — `CaseStudyBody` section Reveal + quote `scaleIn`; primitif
  `ParallaxY` (cermin `ScrollSpin`, tes sendiri, `.lazy.tsx`) untuk thumbnail detail. `Reveal`
  dapat prop `scaleIn` (disanksikan plan T11).
Task 12: complete (commit 1460dbb) — reveal/stagger di tentang/riset/pencapaian/links/karya-list +
  `[locale]/not-found.tsx`. `<h1>` tetap di LUAR wrapper (satu h1 terlihat, urutan heading utuh).
  Ruling: `global-not-found.tsx` DIBIARKAN statis — dokumen bare non-lokal yang "bypasses the app's
  normal rendering entirely"; menaruh island `motion` di sana melawan desainnya, dan ada e2e-nya.
  `links` di-stagger lewat `<Reveal as="li" index={n}>` (bukan `Stagger as="ul"` — hindari
  melebarkan union `Tag`).

## Penyempurnaan pasca-review (fix/perf/revert, commit terpisah)

perf lazy-hydrate island (commit ab9a5cb) — `ScrollSpin`/`Counter`/`MagneticButton` lewat
  `next/dynamic({ssr:false})` dari wrapper `'use client'` (`ssr:false` dilarang di Server Component
  di Next 16, dikonfirmasi `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`).
  Percobaan `LazyMotion` + `m` DIBUANG lebih dulu — mengukur 211–213 KB (LEBIH besar + gate merah):
  `motion` v13 sudah tree-shake baik, `LazyMotion` cuma menambah orkestrasi lazy di atasnya.
  Bundle **209.9 → 203.6 KB**.
fix stable DOM (commit 04c2854) — Reveal/Stagger/ScrollSpin/ParallaxY tak lagi menukar tipe elemen
  / nesting saat flag `mounted` membalik. Dulu: elemen polos → `motion.tag` / anak → dibungkus
  `motion.div` pada hidrasi = node di-REPLACE/REPARENT, melepas ref yang dipegang Playwright (dan
  scroll/fokus pengguna nyata). Sekarang tipe & nesting konstan; gate cuma memutuskan apakah prop
  animasi menempel. `motion.tag` + `initial={false}` merender node polos bersih di server & pre-mount.
fix ScrollSpin rest angle (commit aa7ad5a) — offset `useScroll` `['start end','end start']` →
  `['start start','end start']`: progres ~0 selama hero di posisi baca (atas viewport).
fix ScrollSpin drift (commit 5b44e4c) — binding rotate ternyata UTUH; masalahnya `max=18`
  menuntaskan seluruh sapuan 0→18° dalam ~600px scroll pertama (di desktop langsung mentok, terbaca
  statis). `max` **18 → 12**. Dibuktikan di `e2e/motion.spec.ts`: rotasi inner figure `<2°` di
  scrollY=0 dan `4–14°` setelah `scrollTo(0,900)` (12,0° desktop / 6,8° mobile), tetap `0°` di
  kedua posisi saat `prefers-reduced-motion`.

## Close-out — RENCANA SELESAI (Task 13, commit test: verify motion pass)

Yang dikapalkan: satu pustaka animasi (`motion` v13), di-import hanya oleh 8 primitif +
`use-reduced-motion` hook di `src/components/motion/*` (percobaan `provider`/`LazyMotion` dibuang).
Efek: hero stagger + reveal, ScrollSpin scroll-tied (`max=12`),
section reveals di semua rute, Counter count-up (nilai akhir tanpa JS), GlareCard hover (CSS
murni), MagneticButton CTA, indikator nav geser (`layoutId`), grain overlay `feTurbulence`
(opacity 0,035, `mix-blend-soft-light`, statis saat reduced-motion), quote `scaleIn`, thumbnail
`ParallaxY`. Semua SSR-aman & no-op saat `prefers-reduced-motion`. `motion` hanya di
`src/components/motion/*` (grep bersih). Island bawah-fold (`ScrollSpin`/`Counter`/
`MagneticButton`/`ParallaxY`) di-`next/dynamic({ssr:false})`.

Angka akhir (verifikasi controller, bukan klaim):
- unit **107/107** (27 berkas), e2e **80/80** (chromium + mobile), `tsc --noEmit` bersih
- `next build` sukses; `npm run check:size` → **204,3 KB / 210,0 KB**
- before → after bundle `/[locale]`: **155,4 KB → 204,3 KB** (+48,9 KB untuk seluruh motion pass;
  puncak sementara 209,9 KB sebelum lazy-hydrate menariknya kembali)
- sapuan reduced-motion (`/id`, `/id/karya/city-courier`): konten penuh terlihat, tanpa transform
  beranimasi, Counter menampilkan 10, grain statis (`animation-name: none`)

Deferral: tuas "hero Reveal jadi CSS-only" (`@starting-style`/keyframe) TIDAK dipakai — 5,7 KB
headroom cukup dan Fase berikutnya menyentuh chunk rute lain, bukan `/[locale]`. `global-not-found.tsx`
sengaja tanpa reveal. `LazyMotion`/`m` ditinggalkan (mengukur regresi bundle 211–213 KB).


---

## Deploy + SEO pass (2026-08-31, di luar Plan A/B/C) — commit 5f7d77c, 6418677

**Cloudflare (5f7d77c).** Scaffold OpenNext yang sudah ada di working tree (dikerjakan
agen lain, tervalidasi lokal: 107 unit, 2 dry-run wrangler, 13 cek HTTP di Workers
preview) — di-*commit* apa adanya. `.agents/` (dump skill mp-*) di-gitignore, bukan
di-commit. `.mcp.json` (server `shadcn` saja) di-commit. CI ganti `build` →
`cf:typegen` + `cf:check`, Node 20 → 24. **Belum ada deploy live**: `wrangler login`
dan `cf:deploy` diserahkan ke manusia. Zone `ferryandhikapratama.com` ada di akun
`06d5d4ba…` tapi 0 DNS record; belum ada Worker/subdomain workers.dev. Detail di
`docs/cloudflare.md`.

**SEO (6418677).**
- `app/sitemap.ts` / `robots.ts` / `manifest.ts` — file-convention route handler,
  semua `○ (Static)` di build. Sitemap: 8 rute + 3 studi kasus, `alternates.languages`
  id/en dengan path Inggris terlokalisasi (`/karya` → `/work`).
- `[locale]/opengraph-image.tsx` + `twitter-image.tsx` — kartu 1200×630 via `next/og`,
  **tanpa font kustom** (Satori built-in cukup; PNG ~48 KB ter-generate saat `next build`
  di Node, OpenNext tinggal menyajikan sebagai aset). Ditaruh di bawah `[locale]` —
  bukan root `app/` — supaya tag `og:image` resolve terhadap `metadataBase` milik
  layout locale; di root memicu warning `metadataBase … using "http://localhost:3000"`.
  `generateStaticParams` mengembalikan kedua locale.
- `lib/page-metadata.ts` — helper canonical + hreflang (id/en/x-default) + blok
  OG/Twitter yang cocok. **Wajib mendeklarasikan ulang `images`**: `openGraph`/`twitter`
  dari segmen anak MENGGANTI milik induk secara wholesale (shallow merge), jadi gambar
  sosial auto-inject dari layout hilang di sub-halaman kalau tidak diulang. Halaman
  studi kasus memakai thumbnail-nya sendiri, sisanya fallback ke kartu per-locale.
- `[locale]/layout.tsx` — `title` jadi `{default, template: '%s · Ferry Andhika Pratama'}`
  (home tetap "Ferry Andhika Pratama" lewat `default`; e2e `toHaveTitle` home aman).
  Tiap `page.tsx` rute dapat `generateMetadata`.
- `messages/*` — `meta.description` per section (id + en); `tests/messages.test.ts`
  `requiredKeys` ditambah 7 kunci itu.
- `tests/seo.test.ts` baru (12 test: sitemap coverage/host/dedupe/hreflang, robots,
  manifest, pageMetadata canonical/hreflang/OG-fallback).

Angka akhir (verifikasi controller): unit **119/119** (28 berkas), e2e **80/80**,
`tsc --noEmit` bersih, `next build` **34 halaman statis** tanpa warning,
`check:size` **204,6 KB / 210,0 KB**. Dua commit ada di `main` lokal — **belum di-push**.

---

## Redesign "Personal" — Phase 1: Foundation (2026-09-09)

Spec: `docs/superpowers/specs/2026-09-09-ruang-kerja-personal-redesign.md`.
Plan: `docs/superpowers/plans/2026-09-09-ruang-kerja-redesign-p1-foundation.md`.
Executed inline on branch `Pratametheus/ruang-kerja-code`, on top of codex's
uncommitted redesign WIP (`page.tsx` + `pillar-card.tsx` left uncommitted for P3/P5).

- **Type family:** Inter + Inter Tight → **Source Sans 3** (`--font-body`); `--font-sans`
  and `--font-display` both resolve to it. JetBrains Mono kept for `--font-mono`.
- **Tokens retuned** (`globals.css`). Night: `--bg #101112`, `--surface #1b1d1e`,
  `--fg #eeefed`, `--fg-muted #a1a7a9`, `--border #33383b`, `--accent #efd45d`,
  `--on-accent #101112`. Light (warm paper + ochre): `--bg #f7f3ec`, `--surface #efe9dd`,
  `--fg #2b2620`, `--fg-muted #6b6357`, `--border #ddd4c3`, `--accent #8f5f18`.
  Contrast (fg/bg · muted/bg · muted/surface · on-accent/accent): night
  **16.4 · 7.8 · 6.9 · 12.8**, light **13.6 · 5.4 · 4.9 · 5.0** — all ≥ 4.5:1.
  `tests/tokens.test.ts` updated to assert the new values + `--color-*` mirroring.
- **Shell:** `[locale]/layout.tsx` → centred `max-w-[1190px] px-6`, desktop grid
  `lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12`.
- **Rail** (`sidebar.tsx`): `<header>`, sticky on desktop. Contents: `fa.` mark (68px,
  radius 20, accent dot), name (`sidebar.name`), role, availability link → `/kontak`,
  `<Nav>` in a `border-y` band, GitHub link (`code` icon + "Pratametheus ↗"), rail note
  (`sidebar.railNote`), then `ThemeToggle` + `LocaleSwitcher`. Mobile form unchanged
  (floating panel, focus trap, `Esc` restores focus). Old `<footer>© 2026` dropped from
  the rail.
- **Nav:** icon per route (`icon={key}`), `Karya` count badge, active `aria-current` +
  trailing `→`. Count is computed in the **server layout** and threaded
  `layout → Sidebar → Nav` as `workCount` — importing `getAllCaseStudies` into the
  `'use client'` Nav pulled the 53 KB case-studies data into the client bundle.
- **Icons** (`icon.tsx`): added `dashboard` (2×2) + `code` (`</>`); stroke 1.75 → 1.6.
- `messages/{id,en}.json`: `sidebar.name`, `sidebar.railNote` added; `tests/messages.test.ts`
  `requiredKeys` updated.
- `public/design-preview/` gitignored (kept locally as the build reference; deleted in the
  final cleanup after P6).

Final numbers: `tsc --noEmit` clean · unit **127/127** (28 files) · e2e **80/80** ·
`next build` **34 static pages**, no warnings · `check:size` **206.0 / 210.0 KB**
(clean build; +1.4 KB vs the 204.6 baseline — 4 KB headroom, watch during P2's client
components; lazy-load filters per spec §10 if it tightens).

Commits: `a2e2f67` (foundation WIP subset) · `3c74ab0` (gitignore sandbox) ·
`9d4dca9` (token retune) · `ad46cbb` (icons) · `af87dc2` (rail) · `d025cf8` (count + marker) ·
`71fea6a` (e2e) · `89faffa` (count via server prop).

---

## Redesign "Personal" — Phase 2: Shared Components (2026-09-09/11)

Spec: `docs/superpowers/specs/2026-09-09-ruang-kerja-personal-redesign.md`.
Plan: `docs/superpowers/plans/2026-09-09-ruang-kerja-redesign-p2-components.md`.
Executed via subagent-driven-development on branch `Pratametheus/ruang-kerja-code`
(SDD ledger: `.superpowers/sdd/2026-09-09-ruang-kerja-redesign-p2-components/progress.md`),
paused mid-run for a checkpoint (2026-09-09→11) and resumed cleanly — nothing drifted.

**Data (T1-T3):** `src/lib/skills.ts` (12 skills, 6 groups incl. "Semua", brand SVGs copied
from the design-preview sandbox into `public/tech/` — devicon, MIT); `CaseStudy` gains
`type: 'Web'|'Mobile'` + `topic: 'Pendidikan'|'Keamanan'|'Penulisan'` (siakad→Web/Pendidikan,
city-courier→Mobile/Keamanan, mochitoon→Web/Penulisan); `src/content/career.ts` (`CAREER` 1
entry both locales, `EDUCATION` intentionally `{id:[],en:[]}`); `src/content/achievements.ts`
(`ACHIEVEMENTS`, the existing JUTIF publication, added in T8).

**Components (T4-T11), none wired into pages yet:** `SectionHead`/`PageHeading`/`DataEmpty`
(primitives) · `TechBadgeRow`/`SkillList` (filterable, client) · `WorkCard`/`WorkFilters`
(2-axis filter, client) · `CareerCard`/`Timeline` (native `<details>` expand) ·
`PublicationCover`/`AchievementCard`/`AchievementFilters` (search+2-select, client) ·
`PublicationListCard`/`PaperStory` · `SocialCard`/`ContactDraftForm` (clipboard-only, never
sends data — verified by a `fetch` spy) · `DashboardStat`/`ConnectionState`/`RepoGrid` (every
stat value a literal em dash, no fabricated numbers).

**Process notes:**
- T5 (`SkillList`) had 1 fix round: filter buttons initially showed raw English group names
  instead of the `skills.groups.*` translations already added in T1 — fixed via an explicit
  `GROUP_LABEL_KEY` map (template-literal i18n keys don't type-check in next-intl); re-review
  confirmed addressed.
- T6 (`WorkCard`/`WorkFilters`) and T10 (`ContactDraftForm`) each surfaced one implementer
  environment finding: `@testing-library/user-event@14.6.6`'s `setup()` installs its own
  `navigator.clipboard` getter, so a test-only clipboard mock must be assigned via
  `Object.defineProperty(..., {configurable: true})` **after** `setup()`, not `Object.assign`
  before it. Verified directly against the installed package source; all original assertions
  preserved.
- Nav.tsx originally imported `getAllCaseStudies` client-side for the Karya count badge
  (Phase 1) — pulled the 53 KB case-studies dataset into the client bundle. Fixed in Phase 1
  by threading the count from the server layout as a prop; carried forward correctly here.
- T7 dispatched concurrently with T6's read-only review (zero file overlap, T6's implementer
  already done) — a deliberate coordinator optimisation, no conflicts.

**Deferred minors (none load-bearing, none blocking; noted for the eventual whole-branch
review or a future pass):**
- `work-card.tsx` cover hover scrim uses `bg-black/60 text-white` — the only non-theme colour
  in the diff; a faithful, deliberate port of the sandbox `.cover-action` (legibility-first
  overlay, correctly theme-independent).
- `work-filters.tsx`'s two filter rows are near-duplicate JSX; a generic `FilterRow` would
  DRY it. Optional.
- `achievement-filters.tsx` search predicate adds `.trim()` beyond the literal spec formula —
  harmless improvement.
- `achievement-card.tsx` renders the JUTIF `PublicationCover` + "SINTA 2" tag unconditionally;
  correct while only one publication exists, but a future `Sertifikat` entry would render the
  wrong cover — revisit when real certificate data is added (Phase 5+).
- `contact-draft-form.tsx`'s `<textarea>` lacks the `min-h-11` convention used on the other
  fields (unlikely a real touch-target issue at `rows={5}`).
- `social-card.tsx` hardcodes the "GitHub"/"Email" eyebrow labels instead of the pre-existing
  `contact.githubLabel`/`contact.emailLabel` i18n keys already used on `kontak`/`links` pages.

Final numbers: `tsc --noEmit` clean · unit **162/162** (45 files) · e2e **80/80** (unchanged —
nothing wired) · `next build` **34 static pages**, no warnings · `check:size` **206.0 / 210.0
KB** (clean rebuild; unchanged from Phase 1's 206.0 — every new component is currently dead
code from the bundler's point of view until Phase 3 imports it).

Not merged to `main` yet (Phase 1 is; `main` = `5a04d66`). Branch `Pratametheus/ruang-kerja-code`
head after Phase 2: see the plan's task list — 11 feature/data commits + this ledger entry.
Phase 3 (wiring Beranda + Tentang) is next.

**Final whole-branch review (2026-09-11):** dispatched on the most capable model, scoped to
main→Phase 2 head (14 commits). Found 1 Important + 5 Minor. Fixed in one fix wave
(commit `b40f2ec`, re-reviewed clean):
- Important: `WorkCard`/`AchievementCard`/`PublicationListCard` rendered raw Indonesian
  `type`/`topic`/`category` literals untranslated on the `en` locale, right next to filter
  pills showing the same values already translated (same class of bug as the Task 5 fix).
  Fixed via a new shared `src/lib/taxonomy-labels.ts` (4 label-key maps) consumed by all 5
  affected components.
- Minor: `AchievementCard` + `PublicationListCard` had duplicated tag-pill JSX — extracted
  to `src/components/record-tags.tsx`.
- Minor: `PaperStory`'s `locale` prop defaulted to `'id'`, risking a silent EN-locale bug
  once wired — made required.
- Minor: `min-h-11` touch target added to the contact form `<textarea>` and two
  `<summary>` elements (`career-card.tsx`, `achievement-card.tsx`).

**Still deferred (no functional impact, revisit opportunistically):**
- `work-card.tsx` cover-hover scrim `bg-black/60 text-white` — intentional, theme-independent.
- `work-filters.tsx` two filter-row JSX blocks remain structurally duplicated (only the
  label-key *data* was deduped) — a generic `FilterRow` would finish the job.
- `achievement-filters.tsx` search predicate's `.trim()` — harmless improvement over spec.
- `AchievementCard`/`PublicationListCard` render the JUTIF cover + "SINTA 2" tag
  unconditionally — correct while only one publication exists; revisit once a certificate
  entry is added (Phase 5+).
- `SocialCard` hardcodes "GitHub"/"Email" eyebrow text instead of the existing
  `contact.githubLabel`/`emailLabel` keys — zero visible difference (same value both locales).
- `SkillList` has no `◈` broken-icon-fallback (spec §5 literal); `AchievementCard`'s year
  renders bare instead of "Terbit {year}" (spec §5 literal). Cosmetic.

Final numbers after the fix wave: tsc clean · unit **163/163** (46 files) · check:size
**206.0/210.0 KB**. Phase 2 complete: 12 plan tasks + 1 fix wave, commits `0020be7..b40f2ec`.
Not yet merged to `main` (`main` = `5a04d66`, Phase 1).

---

## Redesign "Personal" — Phase 3: Beranda + Tentang wired (2026-09-11)

Spec: `docs/superpowers/specs/2026-09-09-ruang-kerja-personal-redesign.md`.
Plan: `docs/superpowers/plans/2026-09-11-ruang-kerja-redesign-p3-home-about.md`.
Executed via subagent-driven-development on branch `Pratametheus/ruang-kerja-code`.
First phase where Phase 2's components are actually wired into a live page.

**Beranda (`/` `/en`):** hello (eyebrow + `<h1>` "Halo, saya Ferry." + 2 intro paragraphs +
"Sedikit tentang saya →" to `/tentang`) → filterable `SkillList` → "Karya pilihan"
(`SectionHead` + "Semua karya →" to `/karya`, `WorkCard` grid of the **2 featured** case
studies — siakad-informatika + city-courier, not mochitoon) → Riset callout (icon +
eyebrow/headline/summary + "Jelajahi riset →" to `/riset`) → new shared `SiteFooter`.
Drops the illustrated hero (`ScrollSpin`, `hero/*.webp`), `PillarCard`, `ImageCard`,
`ContactRow`, `MagneticButton` from the route — **files kept, orphaned**, a Phase 5
decision per spec §9. `pillar-card.tsx`'s stale pre-Phase-1 WIP edit was discarded (clean
revert to its last committed state, not built on).

**Tentang (`/tentang` `/en/about`):** `PageHeading` (`<h1>` = `about.title`) → 4 biography
paragraphs + signoff → Karier (`SectionHead` + `Timeline` fed the real `CAREER` entry) →
Pendidikan (`SectionHead` + `Timeline` falling to its `DataEmpty` children branch, since
`EDUCATION` is intentionally empty) → `SkillList` → `SiteFooter`. `generateMetadata`
untouched.

**New component:** `SiteFooter` (no props, `footer.*` namespace) — the shared page-bottom
block the spec called for but Phase 2's component list hadn't named; every page from here
on reuses it.

**Cross-cutting bug found and fixed (pre-review, same task as Beranda):**
`[locale]/layout.tsx` forwarded only `nav`+`sidebar` to `NextIntlClientProvider` — a
leftover from before any other client component read its own message namespace.
`SkillList` (the first client component wired into a real page reading `skills.*`) hit
`MISSING_MESSAGE` for all of it. Fixed by forwarding the **full** `messages` object
instead of a curated subset — this also pre-empts the identical bug for Phase 4/5's
`WorkFilters`, `AchievementFilters`, and `ContactDraftForm`, which are still to be wired.
Cost: ~10 KB uncompressed JSON added to the RSC/HTML payload per locale — not counted by
`check-bundle-size.mjs` (JS chunks only), and not a real budget concern.

Also fixed in the same pass: two Playwright locator bugs in `e2e/home.spec.ts` and
`e2e/motion.spec.ts` (`getByRole('link', {name: 'SIAKAD Informatika'})` without
`exact: true` substring-matched `WorkCard`'s cover-image alt text as well as its title
link — Playwright strict-mode violation), and a Tab-count cap bumped from 20 to 30 in the
keyboard-nav test (`SkillList`'s 6 filter buttons pushed the target link further down the
tab order).

**i18n:** `home` namespace — 10 keys added (`hello*`, `intro1/2`, `aboutLink`,
`selectedWorkAll`, `research*`), 12 retired (`eyebrow`, `tagline`, `statement`,
`pillarsTitle`, `pillars.{build,teach,secure}.{title,body}`, `researchTitle`,
`contactTitle`, `contactCta`) — grep-gated, confirmed no other consumer before deletion.
`about` namespace — `body1/2/3` renamed to `biography1/2/3` (values unchanged), plus new
`biography4` + `signoff`. New `footer` namespace (4 keys). All changes mirrored in both
`messages/id.json` and `messages/en.json` and in `tests/messages.test.ts` `requiredKeys`.

Final numbers: `tsc --noEmit` clean · unit **165/165** (47 files) · e2e **74/74** ·
`next build` **34 static pages**, no warnings, no `MISSING_MESSAGE` · `check:size`
**200.1 / 210.0 KB** (down from Phase 2's unwired 206.0 — the illustrated hero + motion
primitives it drove from home cost more JS than `SkillList` added). Manually smoke-tested
`/id`, `/en`, `/id/tentang`, `/en/about` via `next start` — no raw i18n keys leak into the
rendered HTML.

Not merged to `main` yet (`main` = `5a04d66`, Phase 1 only). Phase 4 (Karya + Karya/[slug])
is next.
