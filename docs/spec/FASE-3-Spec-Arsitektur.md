# FASE 3 — SPESIFIKASI & ARSITEKTUR
**Untuk disetujui sebelum satu baris kode ditulis** · 19 Agustus 2026

---

## 🎯 Tujuan situs ini

> Situs milik Ferry, dibangun untuk dirinya sendiri lebih dulu. Kalau orang lain membukanya, mereka harus terkesan.

Itu tujuannya. Bukan lolos saringan apa pun. Konsekuensinya untuk keputusan teknis:

- **Rasa saat dibuka itu fitur**, bukan pemborosan. Animasi dan 3D boleh masuk anggaran.
- **Tetap harus cepat** — karena kamu sendiri yang akan membukanya paling sering, dari HP, di jaringan sekolah.
- **SEO tetap dipasang** karena kamu memintanya di brief dan biayanya murah — tapi ia tidak lagi jadi alasan untuk memveto hal yang kamu suka.

---

## 🎨 Arah visual: Presisi Teknis

Gelap, tenang, terukur. Terasa seperti perkakas engineer, bukan brosur.

### Token warna

```
Latar         #0A0A0B   nyaris hitam, sedikit hangat
Permukaan     #131316   kartu & panel
Garis         #26262B   pembatas tipis
Teks utama    #EDEDEF
Teks kedua    #9B9BA3
Aksen         #4ADE80   hijau terminal — satu-satunya warna kuat
Aksen redup   #4ADE8022 latar aksen
Peringatan    #F59E0B   dipakai sangat jarang
```

**Satu aksen saja.** Disiplin ini yang membedakan tampilan mahal dari tampilan template. Hijau terminal dipilih karena nyambung dengan dunia kode dan kontras baik di latar gelap.

### Tipografi

| Peran | Font | Alasan |
|---|---|---|
| Judul | **Satoshi** atau Inter Tight | Geometris, tegas, tidak generik |
| Isi | **Inter** | Terbaca di ukuran kecil, dukungan bahasa Indonesia baik |
| Data & kode | **JetBrains Mono** | Angka, metadata, DOI, label teknis |

Monospace dipakai **sebagai penanda makna**, bukan hiasan: setiap angka, tanggal, ukuran berkas, dan istilah teknis memakai monospace. Efeknya, situs terasa terukur.

### Gerak

- Durasi 150–300 ms. Lebih dari itu terasa lambat.
- Easing `cubic-bezier(0.16, 1, 0.3, 1)` — cepat di awal, mendarat halus.
- **`prefers-reduced-motion` dihormati di semua animasi.** Tanpa pengecualian.
- Tidak ada animasi yang menahan pembacaan konten.

---

## 🎮 Three.js: satu adegan, dan ia punya makna

Bukan bola berputar generik. Usulanku:

### Hero: "Key Rotation"

Sebuah kisi titik-titik (point cloud) tiga dimensi yang berputar sangat lambat. Titik-titik itu tersusun membentuk pola kunci kriptografis yang **berotasi** — merujuk langsung pada riset JWKS-mu, di mana kunci berganti secara berkala agar kebocoran satu kunci tidak berarti kebocoran selamanya.

Saat kursor mendekat, titik-titik di sekitarnya sedikit menjauh, lalu kembali. Halus, tidak ramai.

**Kenapa ini lebih baik dari efek generik:** siapa pun yang bertanya *"itu bentuk apa?"* akan mendapat jawaban yang langsung menjelaskan siapa kamu. Dekorasi berubah jadi pernyataan.

### Aturan teknis yang mengikat

| Aturan | Alasan |
|---|---|
| `next/dynamic` dengan `ssr: false` | Three.js tidak ikut bundle awal |
| Dimuat setelah konten utama tampil | Teks dan judul muncul lebih dulu, selalu |
| Gambar statis sebagai fallback | Kalau WebGL tidak tersedia atau gagal |
| Mati total saat `prefers-reduced-motion` | Aksesibilitas, dan sebagian orang memang mual melihat gerak |
| `frameloop="demand"` saat idle | Tidak membakar baterai saat tidak dilihat |
| Batas: 1 adegan di seluruh situs | Kalau semua halaman punya 3D, tidak ada yang istimewa |
| Anggaran: ≤ 200 KB tambahan terkompresi | Diukur, bukan dikira |

Teks hero tetap HTML biasa di atas canvas — jadi tetap terbaca mesin pencari dan pembaca layar. **3D-nya latar, bukan isi.**

---

## 🏗️ Arsitektur

### Tumpukan teknologi

| Lapis | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 16** (App Router) + TypeScript | Kamu sudah memakainya di SIAKAD Informatika. Tidak ada gunanya belajar framework baru dengan tenggat sebulan |
| Gaya | **Tailwind CSS v4** | Sama seperti proyekmu yang lain |
| Komponen dasar | **shadcn/ui** | Kode masuk ke repomu, bisa diubah bebas, bukan dependensi kaku |
| Efek pilihan | **Aceternity UI** / **Magic UI** | Disalin per komponen sesuai kebutuhan, bukan dipasang seluruhnya |
| Animasi | **Framer Motion** | Sudah kamu kuasai |
| 3D | **react-three-fiber** + **drei** | Satu adegan, dimuat malas |
| Dwibahasa | **next-intl** | Rute `/id` dan `/en`, terjemahan berbasis berkas |
| Uji unit | **Vitest** + Testing Library | Cepat, cocok dengan Vite/Next |
| Uji E2E | **Playwright** | Menguji alur nyata di browser sungguhan |
| Basis data | **Cloudflare D1** (Fase 4) | Sesuai permintaanmu |
| Hosting | **Cloudflare Workers** via `@opennextjs/cloudflare` | Lihat catatan di bawah |

### ⚠️ Koreksi rencana: Workers, bukan Pages

Di brief awal kamu menulis Cloudflare **Pages**. Aku periksa dokumentasi Cloudflare hari ini, dan untuk kasus kita **Workers yang benar** — dengan satu alasan yang menentukan:

> **Binding Rate Limiting hanya tersedia di Workers, tidak di Pages.**

Padahal Fase 4 kamu mensyaratkan rate limiting untuk guestbook. Kalau kita bangun di Pages, kita akan menabrak dinding di Fase 4 dan harus pindah — buang waktu di saat paling genting.

Panduan resmi Cloudflare untuk Next.js juga mengarahkan ke Workers memakai adapter `@opennextjs/cloudflare`, yang mendukung SSR, ISR, Server Components, Server Actions, middleware, dan streaming.

**Catatan jujur:** Pages **tidak** deprecated — dokumentasi Cloudflare memperlakukan keduanya sebagai produk aktif. Aku sempat menulis sebaliknya di catatan sebelumnya; itu terlalu jauh dan kukoreksi. Alasan kita memilih Workers murni karena rate limiting dan D1, bukan karena Pages ditinggalkan.

---

## 🗺️ Struktur halaman

Multi-halaman, bukan satu halaman panjang — supaya tiap studi kasus punya alamat sendiri yang bisa dibagikan.

```
/[locale]                     Beranda — hero 3D, ringkasan, karya pilihan
/[locale]/work                Daftar studi kasus
/[locale]/work/siakad-informatika  Studi kasus 1
/[locale]/work/city-courier   Studi kasus 2
/[locale]/work/mochitoon      Studi kasus 3
/[locale]/about               Perjalanan: riset, mengajar, sertifikasi
/[locale]/guestbook           Fase 4
```

`locale` = `id` | `en`. Akar `/` mengalihkan sesuai bahasa peramban, dengan `id` sebagai cadangan.

### Beranda — urutan bagian

1. **Hero** — nama, satu kalimat inti, latar 3D key-rotation
2. **Benang merah** — *"Saya membangun perangkat lunak untuk pekerjaan yang saya jalani sendiri"* dengan tiga kartu: guru · penulis · peneliti
3. **Karya pilihan** — tiga kartu studi kasus
4. **Riset** — kartu jurnal SINTA 2 dengan DOI yang bisa diklik
5. **Perkakas** — tumpukan teknologi, tampilan tenang tanpa ikon berwarna-warni
6. **Kontak**

---

## 🔍 SEO — dipasang karena murah, bukan karena wajib

| Yang dipasang | Bentuknya |
|---|---|
| Metadata dinamis | `generateMetadata()` per halaman, judul & deskripsi per bahasa |
| **JSON-LD `Person`** | Nama, jabatan, almamater, profil sosial |
| **JSON-LD `ScholarlyArticle`** | Untuk jurnal JUTIF, lengkap dengan DOI — jenis skema yang nyaris tidak pernah dipakai portofolio developer |
| **JSON-LD `Article`** | Per studi kasus |
| `hreflang` | Menautkan versi ID dan EN |
| `sitemap.ts` + `robots.ts` | Dihasilkan otomatis |
| Gambar OG | Dibuat lewat `next/og` per halaman — bukan foto stok |
| Semantic HTML | `<article>`, `<time>`, `<figure>`, satu `<h1>` per halaman |

---

## 🧪 Rencana TDD

Sesuai protokolmu: **test ditulis lebih dulu, sebelum logika dan animasi.**

### Yang diuji dengan Vitest

- Komponen `CaseStudyCard` — merender judul, ringkasan, dan label teknologi dari props
- `getCaseStudy(slug, locale)` — mengembalikan konten yang benar, melempar galat untuk slug tak dikenal
- Pembangun JSON-LD — menghasilkan skema `Person` / `Article` / `ScholarlyArticle` yang valid
- Pemilih locale — memilih `id`/`en` dengan benar, jatuh ke `id` saat tak dikenali
- Kelengkapan berkas terjemahan — **setiap kunci di `id.json` wajib ada di `en.json`**. Test ini yang mencegah teks kosong diam-diam muncul di versi Inggris

### Yang diuji dengan Playwright

- Beranda memuat dan `<h1>` terlihat **sebelum** canvas 3D siap
- Berpindah bahasa mempertahankan halaman yang sedang dibuka
- Ketiga studi kasus bisa dibuka dari daftar
- Navigasi keyboard: `Tab` menjangkau semua tautan, fokus terlihat jelas
- `prefers-reduced-motion` benar-benar mematikan animasi dan 3D
- Tidak ada geseran tata letak (CLS) saat 3D dimuat

### Ambang yang mengikat

| Ukuran | Ambang |
|---|---|
| Lighthouse Performance (mobile) | ≥ 90 |
| Lighthouse Accessibility | **100** |
| LCP | < 2,5 detik |
| CLS | < 0,1 |
| JS awal (tanpa 3D) | < 150 KB terkompresi |
| Tambahan 3D | < 200 KB terkompresi |

Kalau 3D membuat Performance jatuh di bawah 90 pada perangkat kelas menengah, **3D-nya yang mengalah**, bukan ambangnya.

---

## 📅 Rencana kerja Fase 3 (26 Agu – 8 Sep)

| Tahap | Isi |
|---|---|
| **A** | Kerangka proyek, Tailwind, token desain, next-intl, Vitest + Playwright, GitHub Actions |
| **B** | Test dulu → komponen dasar (kartu, tata letak, navigasi, pengalih bahasa) |
| **C** | Halaman studi kasus + konten Fase 2 + JSON-LD |
| **D** | Beranda + hero 3D key-rotation (dengan anggaran performa) |
| **E** | Versi Inggris — **ditulis ulang, bukan diterjemahkan** |
| **F** | Audit aksesibilitas + performa, perbaiki sampai ambang tercapai |

Riwayat commit dibuat bermakna sejak commit pertama — bukan untuk dipamerkan, tapi karena kamu sendiri yang akan menelusurinya saat lupa kenapa suatu keputusan diambil.

---

## ✅ Yang kubutuhkan sebelum mulai

| # | Hal | Catatan |
|---|---|---|
| 1 | **Setuju spek ini?** | Kalau ada yang mau diubah, sekarang waktunya |
| 2 | **Ide hero "key rotation"** — jalan atau ganti? | Kalau kurang sreg, aku siapkan alternatif |
| 3 | **Repo baru namanya apa?** | Usul: `portfolio` atau `ferryandhikapratama.org` |
| 4 | **Domain sudah di Cloudflare?** | Kalau belum, nameserver-nya perlu dipindah — butuh waktu propagasi, lebih baik dimulai sekarang daripada 18 September |
| 5 | Font Satoshi berbayar untuk komersial — pakai, atau ganti Inter Tight (gratis)? | Untuk situs pribadi, versi gratisnya cukup |

Begitu kamu setuju, aku mulai dari **Tahap A** — dan sesuai protokolmu, **test ditulis lebih dulu**.
