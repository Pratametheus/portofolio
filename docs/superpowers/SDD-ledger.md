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
