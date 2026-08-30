# FASE 2 — COPY FINAL
**Status:** Siap masuk Fase 3 · Bahasa Indonesia · versi EN ditulis ulang setelah ini disetujui

---

# 💡 TEMUAN BARU DARI PDF-MU

Kamu mengirim `Program Kerja Komputer — Kelas Tinggi` hanya untuk menjawab pertanyaan *"6 jam itu untuk apa"*. Tapi dokumen itu memuat sesuatu yang jauh lebih besar dari sekadar angka.

## Kamu mengajarkan *code review* kepada anak sebelas tahun

Halaman 4 dokumenmu, **Kelas 5 Semester Genap, pertemuan 14–16**:

> *"Uji Coba Game, **Peer Review**, dan Unjuk Karya"*

Dan rubrik penilaianmu memakai kriteria yang identik dengan standar mutu perangkat lunak profesional:

| Kriteriamu untuk anak SD | Padanannya di industri |
|---|---|
| **Fungsionalitas** — "Nol bug, interaksi mulus" | Definition of Done |
| **Validitas Kode** — "Semua link dan gambar tampil sempurna" | Build & integration check |
| **Algoritma Game** — "Logika kompleks, tanpa redundansi" | Code quality review |
| **Struktur HTML** — "Elemen bersarang sempurna, valid" | Linting & static analysis |
| **Penyelesaian** — "Selesai 100% tepat waktu" | Sprint commitment |

Sekarang tahan napas sebentar dan baca ini:

> **Kamu merancang sistem peninjauan kode untuk murid kelas 5.**
> **Proyek 113.000 barismu sendiri berjalan tanpa satu pun peninjauan kode.**

Itu bukan aib. **Itu kalimat pembuka terbaik yang bisa dimiliki portofolio ini** — karena tidak ada satu pun kandidat lain yang bisa menuliskannya.

Ini juga menutup lingkaran cerita Andrew dengan sempurna dan tanpa perlu menyalahkan siapa pun:

> Saya mengajarkan peninjauan sejawat kepada murid kelas 5 sebelum saya menerapkannya pada proyek saya sendiri. Butuh ratusan peringatan dan satu berkas empat ribu baris untuk membuat saya memahami pelajaran yang setiap minggu saya sampaikan di depan kelas.

## Tiga hal lain yang kamu remehkan dari dokumen itu

**1. Kamu merancang kurikulum tiga tahun, bukan sekadar daftar materi.**
Kelas 4 (perkakas & logika visual) → Kelas 5 (pemrograman blok, variabel, game) → Kelas 6 (kode teks, HTML/CSS). Itu jenjang yang disusun sengaja: dari antarmuka grafis, ke blok, ke teks. Itu **desain instruksional**, dan itu keterampilan tersendiri.

**2. Seluruh kurikulummu dirancang untuk berjalan tanpa internet.**
"Scratch Desktop — Offline", ".html di Notepad", "Showcase Website offline", "Cetak dokumen". Kamu menghadapi keterbatasan infrastruktur sekolah dan menyelesaikannya lewat desain, bukan mengeluh. **Itu persis cara berpikir seorang engineer** — merancang di dalam batasan, bukan berpura-pura batasan itu tidak ada.

**3. Dokumen itu sendiri adalah aset portofolio.**
Sampul berilustrasi, tipografi konsisten, kop sekolah, penomoran halaman, rubrik terstruktur. Tidak ada satu pun data siswa di dalamnya — jadi **aman sepenuhnya untuk dipajang**. Ini bukti fisik yang bisa diunduh siapa pun bahwa klaim mengajarmu nyata.

---
---

# 📘 STUDI KASUS 1 — SIAKAD Informatika

**Sistem Akademik Ekstrakurikuler Informatika · SDN Ujung XIII**  
**Aplikasi:** https://jurnal-mengajar-blond.vercel.app/

### Tagline
**Saya mengajar informatika di sekolah dasar. Sistem akademik yang saya gunakan, saya bangun sendiri.**

---

### 1️⃣ Problem

Sejak April 2026 saya mengajar komputer untuk kelas 4, 5, dan 6 di SDN Ujung XIII/38.

Sebelum tahun ajaran dimulai, saya menyusun Program Kerja: kurikulum lengkap tiga tingkat kelas, dua semester, beserta rubrik penilaiannya. Enam jam kerja, sekali setahun. Hasilnya satu dokumen yang harus tetap hidup dan mudah dijangkau **selama satu tahun ajaran penuh**.

Lalu setiap pertemuan menambah lapisan baru: apa yang diajarkan, sampai mana, siapa yang tertinggal, berapa nilainya.

Awalnya saya kira masalah saya adalah waktu. Ternyata bukan. Menyusun kurikulum memang lama, tapi itu pekerjaan berpikir — dan pekerjaan berpikir memang butuh waktu. Merekap nilai malah cepat, tidak sampai lima menit.

Masalahnya baru terasa **setelah dokumen itu jadi:**

- Dokumen tercetak harus dibawa ke mana-mana
- Melacak *"materi Scratch kelas 5 sudah sampai blok apa?"* berarti membuka berkas satu per satu
- Setiap revisi melahirkan salinan baru, dan setiap salinan baru melahirkan keraguan mana yang paling mutakhir
- Rencana setahun yang tersimpan sebagai berkas statis akan segera tertinggal dari kenyataan di kelas

**Yang saya butuhkan bukan penghemat waktu, melainkan satu tempat yang bisa saya buka dari mana saja — dan yang selalu benar.**

---

### 2️⃣ User

**Pengguna utama: saya sendiri.** Guru yang mengampu tiga tingkat kelas dengan kurikulum berbeda di tiap tingkat.

**Pengguna kedua yang tidak saya rencanakan: murid-murid saya.** Saya mulai membuka halaman materi di depan kelas sebagai cuplikan — *"minggu depan kita belajar ini"*. Fungsinya berubah: dari alat administrasi pribadi menjadi alat mengajar. Versi sekarang memberi murid jalur tersendiri melalui **Portal Murid**, tempat mereka memilih kelas dan rombel tanpa memperoleh akses editor.

Perubahan itu memaksa saya memperbaiki hal yang tadinya tidak saya pedulikan. Kalau sebuah halaman ditampilkan ke anak berusia sepuluh tahun, halaman itu harus **terbaca** — bukan sekadar berfungsi. Ukuran huruf, kontras, dan kerapian mendadak jadi penting, bukan karena teori desain, tapi karena ada tiga puluh anak yang menyipitkan mata ke layar.

Belum ada guru lain yang memakainya sebagai editor. Saya menuliskannya apa adanya: ini belum menjadi sistem institusional; satu guru yang benar-benar memakainya tiap minggu, ditambah murid yang mengakses portal kelasnya, lebih bernilai daripada adopsi luas yang diklaim tanpa bukti.

---

### 3️⃣ Solution

Tiga pilihan: bertahan manual, memakai aplikasi manajemen sekolah yang ada, atau membangun sendiri.

Aplikasi sekolah yang tersedia dirancang untuk administrasi institusi — absensi, SPP, rapor. Untuk kebutuhan saya itu berlebihan, dan justru menambah pekerjaan karena harus mengisi banyak kolom yang tidak relevan.

Saya membangun sendiri, dengan satu batasan keras: **hanya menyelesaikan masalah yang benar-benar saya alami.** Versi pertama berfokus pada kurikulum dan jurnal pertemuan. Setelah dipakai di kelas, cakupannya tumbuh berdasarkan kebutuhan nyata: data siswa, daftar hadir dan nilai, jadwal pelajaran, materi pokok, serta portal murid. Tetap tidak ada SPP, rapor sekolah, atau dasbor kepala sekolah—ini sistem akademik ekstrakurikuler informatika, bukan SIAKAD seluruh sekolah.

Batasan itu yang membuatnya selesai — dan yang membuatnya benar-benar saya pakai, bukan menumpuk sebagai proyek mangkrak.

---

### 4️⃣ Key Features

**Kurikulum per tingkat kelas** — Program Kerja tiga tingkat dalam bentuk hidup, bukan berkas statis. Kelas 4 *Literasi Digital & Fondasi Logika*, kelas 5 *Pemrograman Visual*, kelas 6 *Logika Pemrograman Teks & Web*.

**Jurnal per pertemuan** — catatan tiap tatap muka yang bisa ditelusuri, bukan diingat-ingat.

**Daftar hadir & nilai per pertemuan** — status kehadiran dan nilai dicatat pada konteks kelas, rombel, dan nomor pertemuan yang sama.

**Rekap nilai berbasis rubrik** — mengikuti rubrik lima kriteria yang saya rancang, dengan perhitungan `(Total Skor / 20) × 100`.

**Manajemen jadwal** — satu sumber kebenaran, diperbarui hanya saat kebijakan sekolah berubah.

**Ekspor ke Excel** — bukan fitur teknis, melainkan keputusan diplomatik. Sekolah tetap butuh berkas Excel untuk pelaporan, dan aplikasi saya tidak boleh memaksa institusi mengubah caranya bekerja. Aplikasi yang menuntut dunia menyesuaikan diri akan ditolak dunia.

**Portal Murid + area editor terlindungi** — murid memilih kelas dan rombel melalui portalnya sendiri; pengelolaan data siswa dan catatan pertemuan tetap membutuhkan akses guru.

---

### 5️⃣ Challenge — Membangun sesuatu yang tidak ada contohnya

Hambatan terbesar bukan hal teknis. Hambatannya: **tidak ada acuan.**

Untuk hampir semua jenis aplikasi ada contoh yang bisa dipelajari — pola datanya, alurnya, tata letaknya. Untuk "aplikasi jurnal mengajar guru komputer SD", tidak ada. Tidak ada templat, tidak ada studi kasus, tidak ada pola mapan untuk ditiru.

Saya membangun versi pertama berdasarkan asumsi saya sendiri tentang apa yang saya butuhkan. **Asumsi itu meleset.** Aplikasinya berfungsi, tapi begitu dipakai beberapa minggu, saya terus menemukan hal yang seharusnya ada tapi tidak terpikirkan saat merancang.

Yang menyelesaikannya bukan kepintaran teknis, melainkan berhenti menebak:

1. Meneliti bagaimana masalah serupa diselesaikan di domain lain
2. Memakai AI sebagai lawan diskusi untuk menguji rancangan
3. **Bertanya langsung kepada guru-guru lain** tentang cara mereka mengerjakan hal yang sama

Poin ketiga yang paling mengubah keadaan. Guru lain punya kebiasaan yang tidak pernah saya pikirkan, karena mereka sudah bertahun-tahun menemukan jalan pintasnya sendiri. Beberapa keputusan desain terbaik di aplikasi ini lahir dari percakapan, bukan dari dokumentasi.

**Yang berubah dari cara saya bekerja:** saya berhenti menganggap *"saya penggunanya, jadi saya pasti tahu yang dibutuhkan"*. Menjadi pengguna memberi saya **masalahnya** — bukan otomatis **solusinya**. Sekarang saya bertanya dulu sebelum membangun, bahkan untuk aplikasi yang hanya saya sendiri yang pakai.

---

### 6️⃣ Impact — Sebelum & sesudah

> ⚠️ **Catatan kejujuran.** Aku sengaja tidak menulis "hemat X jam". Kamu menyusun kurikulum dengan bantuan AI, dan SIAKAD Informatika tidak menulis kurikulum untukmu — ia menyimpan, menata, dan menjaganya tetap hidup. Klaim penghematan waktu akan runtuh dalam satu pertanyaan susulan. Klaim di bawah ini tidak akan.

| | Sebelum | Sesudah |
|---|---|---|
| **Akses kurikulum** | Dokumen tercetak, dibawa ke mana-mana | Dibuka dari perangkat apa pun, kapan pun |
| **Melacak progres materi** | Buka berkas satu per satu | Riwayat jurnal per kelas, langsung terlihat |
| **Merevisi rencana** | Salinan baru tiap revisi, ragu mana yang mutakhir | Satu sumber, selalu versi terbaru |
| **Rencana vs kenyataan kelas** | Dokumen statis yang cepat tertinggal | Dokumen hidup yang ikut bergerak |
| **Menunjukkan materi ke murid** | Tidak terpikirkan | Portal Murid dan halaman materi dibuka langsung di kelas |

**Pernyataan dampak yang tidak butuh satu angka pun:**

> Aplikasi ini dipakai secara nyata, tiap minggu, untuk mengajar tiga tingkat kelas di sekolah dasar. Bukan demo, bukan proyek latihan. Penggunanya adalah orang yang langsung tahu kalau ada yang rusak — karena dia sedang berdiri di depan kelas saat itu terjadi.

---

### 7️⃣ Tech Choices

| Keputusan | Alasan |
|---|---|
| **Next.js 16 + React 19** | Portal murid harus cepat dibuka dari HP di jaringan sekolah; area editor harus interaktif. Satu framework untuk keduanya |
| **Supabase** (Postgres + Auth) | Data akademik relasional secara alami: kelas → rombel → pertemuan → kehadiran dan nilai. Auth melindungi akses editor tanpa membebani portal murid dengan kewenangan yang sama |
| **TypeScript** | Salah tipe di data nilai berarti angka siswa yang salah. Ditangkap sebelum sampai ke layar |
| **Tailwind CSS v4** | Solo, waktu terbatas. Berkas CSS terpisah berarti dua tempat untuk satu perubahan |
| **`xlsx`** | Keputusan produk, bukan teknis — sekolah butuh Excel |
| **Framer Motion** | Halaman ini ditampilkan ke anak-anak; transisi halus membantu mereka mengikuti perpindahan konteks |
| **Vercel** | Nol konfigurasi, gratis, deploy otomatis dari git |

**Repositori ditutup untuk umum — dan itu disengaja:**

> Repositori ini saya privatkan karena skema basis datanya memuat struktur data akademik siswa. Untuk sesuatu yang menyimpan nilai anak-anak, keterbukaan kode bukan prioritas di atas privasi mereka. Kodenya bisa saya tunjukkan langsung dalam sesi wawancara.

Ini bukan alasan untuk menutupi kekurangan. Ini **konsisten dengan positioning-mu** — orang yang menerbitkan riset keamanan seharusnya memang berpikir dua kali sebelum membuka data siswa ke publik. Perekrut yang jeli akan menangkap ini sebagai nilai tambah, bukan kekurangan.

---

### 8️⃣ Screenshot — Placeholder

| # | Aset | Keterangan |
|---|---|---|
| 1 | Halaman depan dari HP | "Dibuka dari HP di jaringan sekolah" |
| 2 | Daftar kurikulum kelas 4 | "Program Kerja sebagai dokumen hidup" |
| 3 | Formulir jurnal pertemuan | "Alur pencatatan setelah mengajar" |
| 4 | Daftar hadir & nilai | "Kehadiran dan evaluasi dalam konteks pertemuan yang sama" |
| 5 | Portal Murid | "Akses kelas dan rombel tanpa membuka area editor" |
| 6 | Hasil ekspor Excel | "Menyesuaikan format yang sekolah butuhkan" |
| 7 | **PDF Program Kerja** — sampul + halaman rubrik | Aset nyata, nol data siswa, aman dipajang & diunduh |
| 8 | **Halaman materi ditampilkan di kelas** | 🔥 Foto layar/proyektor di depan murid. Gambar terkuat di seluruh portofolio |

---
---

# 📕 STUDI KASUS 2 — City Courier

> ⚠️ Ditulis dalam **Batas Rekam Publik**: bersandar pada artikel jurnal yang sudah terbit atas namamu. Tanpa tangkapan layar aplikasi, cuplikan kode, diagram internal, atau tautan repositori.

### Tagline
**Saya menyerang sistem autentikasi saya sendiri sepuluh kali, lalu menerbitkan hasilnya.**

---

### 1️⃣ Problem

Hampir setiap aplikasi modern memakai JSON Web Token untuk menjaga sesi login, dan sebagian besar tutorial mengajarkannya dengan cara yang sama: satu kunci rahasia, algoritma HS256, selesai.

Cara itu berhasil — sampai tidak lagi. JWT punya sejumlah celah yang sudah lama terdokumentasi: serangan `alg: none` yang membuat token tanpa tanda tangan diterima, kebingungan algoritma yang menipu server memverifikasi dengan cara yang salah, dan penyuntikan `kid` yang mengarahkan verifikasi ke kunci milik penyerang.

Yang mengganggu saya bukan keberadaan celah itu, melainkan satu pertanyaan yang tidak terjawab tuntas di materi berbahasa Indonesia yang saya temukan: **kalau saya menerapkan pengamanan yang katanya benar, apakah ia benar-benar bertahan saat diserang?**

Sebagian besar tulisan berhenti pada "gunakan RS256". Nyaris tidak ada yang menunjukkan buktinya.

---

### 2️⃣ User

**Langsung:** pengguna sistem kurir — pengirim, kurir, admin — yang sesi loginnya bergantung pada mekanisme ini. Mereka tidak akan pernah tahu ia ada, dan memang begitu seharusnya. Keamanan yang bekerja itu tidak terlihat.

**Sesungguhnya:** pengembang lain yang menghadapi pertanyaan yang sama. Itulah sebabnya hasilnya saya terbitkan, bukan saya simpan.

---

### 3️⃣ Solution

Alih-alih satu kunci rahasia bersama, sistem ini memakai **kriptografi asimetris RS256** dan mendistribusikan kunci publiknya lewat **JWKS sesuai RFC 7517**.

Perbedaannya bisa dijelaskan tanpa istilah teknis sama sekali:

> **HS256 seperti satu kunci yang dipakai bersama.** Semua pihak yang perlu memeriksa keaslian surat harus memegang kunci yang sama — dan siapa pun yang memegangnya juga bisa **membuat** surat palsu.
>
> **RS256 + JWKS seperti tanda tangan dan contoh tanda tangan.** Hanya saya yang bisa menandatangani. Semua orang boleh memegang contohnya untuk mencocokkan, dan tak seorang pun bisa memalsukannya hanya dari contoh itu.

Ditambah satu hal: kunci-kunci itu **berotasi**. Kalau satu kunci bocor, jendela kerugiannya sempit, bukan selamanya.

**Soal pilihan algoritma, saya menulisnya apa adanya:**

> Perbandingan yang benar-benar saya lakukan saat itu adalah HS256 versus RS256. Saya memilih RS256 karena memisahkan kewenangan menandatangani dari kewenangan memverifikasi — pihak yang memeriksa token tidak perlu memegang kunci yang bisa membuat token.
>
> ES256 baru saya ketahui belakangan. Kalau proyek ini saya mulai hari ini, ES256 akan masuk daftar pertimbangan karena ukuran tanda tangannya lebih ringkas pada tingkat keamanan setara.

---

### 4️⃣ Key Features

Menurut artikel yang terbit, pengujian mencakup **sepuluh skenario serangan kritis**, termasuk kebingungan algoritma dan penyuntikan kunci. Sistem yang diuji menerapkan:

- Rotasi kunci JWKS dinamis
- Distribusi kunci publik sesuai RFC 7517
- Penyimpanan kunci privat terenkripsi
- Pembatasan algoritma secara eksplisit
- Identifikasi kunci berbasis UUID
- Pencatatan menyeluruh

Hasilnya: sistem bertahan terhadap seluruh skenario yang diuji, **dengan dampak performa minimal** — dan bagian terakhir ini penting, karena keamanan yang membuat aplikasi lambat akan dimatikan orang.

---

### 5️⃣ Challenge — Yang tidak ada di jurnal

Artikel itu menceritakan bagian yang berhasil. Bagian ini menceritakan yang tidak.

**Sistemnya berhasil. Kodenya tidak.**

Riset saya lolos sidang dan terbit di jurnal terakreditasi. Tapi basis kodenya tumbuh cepat, dari lebih dari satu tangan, tanpa peninjauan kode, tanpa perlindungan branch, tanpa pemeriksaan otomatis, dan tanpa kesepakatan arsitektur tertulis.

Akibatnya bisa diduga: peringatan menumpuk sampai ratusan, dan satu berkas antarmuka membengkak hingga hampir empat ribu baris. Di sebelahnya tersimpan salinan cadangan berkas itu, lebih besar lagi — pengakuan yang tidak saya sadari sedang saya tulis: **saya sudah tidak percaya pada kode saya sendiri sampai harus menyalinnya sebelum berani mengubah apa pun.**

Saya sempat menyalahkan keadaan. Belakangan saya sadar diagnosis itu tidak menyelesaikan apa pun. Sebagai orang yang memulai proyek ini, sayalah yang seharusnya memasang pagar pengamannya sejak awal. Tidak ada peninjauan kode karena tidak ada yang mensyaratkannya. Tidak ada standar arsitektur karena tidak ada yang menuliskannya.

Ada dua pilihan waktu itu: terus menambal, atau berhenti dan mengakui fondasinya salah sejak awal. Saya memilih berhenti dan menulis ulang dari nol.

Keputusan itu mahal, dan saya yakin itu benar. Menulis kode yang berfungsi bisa dipelajari siapa saja. **Mengenali kapan kode yang berfungsi tetap harus dibuang adalah keterampilan yang berbeda, dan jauh lebih sulit.**

**Pelajaran yang saya bawa:** kualitas kode bukan hasil dari orang yang disiplin, melainkan hasil dari sistem yang membuat ketidakdisiplinan sulit dilakukan.

*Dan ada ironi yang tidak bisa saya hindari: beberapa bulan kemudian saya merancang kurikulum yang mengajarkan peninjauan sejawat kepada murid kelas 5 — praktik yang absennya justru menghancurkan proyek saya sendiri.*

---

### 6️⃣ Impact

| | Sebelum | Sesudah |
|---|---|---|
| Model autentikasi | Kunci rahasia bersama, satu titik kegagalan | Kunci asimetris berotasi, kunci privat terenkripsi |
| Ketahanan serangan | Belum teruji | Diuji terhadap 10 skenario terdokumentasi, bertahan seluruhnya |
| Status pengetahuan | Anggapan pribadi | **Terbit dan dapat dikutip publik** |
| Kondisi basis kode | Utang teknis menumpuk, satu berkas ~4.000 baris | Diakui tidak layak, ditulis ulang dari nol |
| Proses pengembangan | Tanpa review, tanpa pagar | Pelajaran yang kini saya terapkan sejak commit pertama |

**Dampak terkuatnya bukan angka:**

> Riset ini melewati peer review dan terbit di **JUTIF Vol 7 No 2 (2026), hal. 1834–1852** — jurnal terakreditasi **SINTA 2**. DOI `10.52436/1.jutif.2026.7.2.5662`. Siapa pun bisa membacanya, mengutipnya, atau membantahnya. Ini bukan klaim tentang keahlian saya; ini catatan permanen yang dapat diverifikasi siapa saja, kapan saja.

---

### 7️⃣ Tech Choices

| Keputusan | Alasan |
|---|---|
| **RS256** (bukan HS256) | Memisahkan kewenangan menandatangani dari memverifikasi |
| **JWKS / RFC 7517** | Standar terbuka, bukan buatan sendiri. Rotasi kunci mungkin tanpa mengubah kode klien |
| **Pembatasan algoritma eksplisit** | Menutup keluarga serangan kebingungan algoritma di akarnya |
| **`kid` berbasis UUID** | Mencegah penyuntikan `kid` yang menebak lokasi kunci |
| **Kunci privat terenkripsi saat disimpan** | Bocornya berkas tidak otomatis berarti bocornya kunci |
| **Pencatatan menyeluruh** | Serangan yang tidak tercatat adalah serangan yang tidak pernah kamu ketahui |

**Satu trade-off yang saya kalah:**

> Demi pencarian wilayah yang cepat, saya menyertakan data wilayah Indonesia langsung di dalam aplikasi. Kecepatannya tercapai — tapi ukuran aplikasi ikut membengkak sampai batas yang menurut saya sendiri tidak masuk akal untuk sebuah aplikasi kurir. Saya menang di kecepatan dan kalah di ukuran. Hari ini saya akan memilih berbeda: memuat data sesuai kebutuhan, bukan memaketkan semuanya di muka.

---

### 8️⃣ Screenshot — Placeholder

| # | Aset | Keterangan |
|---|---|---|
| 1 | Sampul artikel jurnal | "JUTIF Vol 7 No 2 (2026), terakreditasi SINTA 2" |
| 2 | Diagram alur JWKS **buatanmu sendiri** | Karyamu, bukan aset perusahaan — aman sepenuhnya |
| 3 | Bagan HS256 vs RS256 | Menjelaskan hal rumit secara sederhana |
| 4 | Tautan DOI | Bukti yang bisa diklik siapa pun |

---
---

# 📗 STUDI KASUS 3 — MochiToon

### Tagline
**Saya membangun alat produksinya, dan saya juga yang menulis ceritanya.**

---

### 1️⃣ Problem

Produksi komik indie berantakan bukan karena kurang ide, tapi karena idenya tersebar. Naskah di satu dokumen, profil karakter di dokumen lain, referensi visual di folder, papan storyboard di kepala. Saat ceritanya tumbuh, biaya untuk mengingat *"karakter ini rambutnya seperti apa di bab 3"* jadi lebih mahal daripada menggambarnya.

Saya tahu persis rasanya, karena saya yang menulis ceritanya.

---

### 2️⃣ User

Studio komik indie dan kreator solo. Tapi pengguna nomor satunya adalah **saya sendiri, dalam peran yang berbeda** — bukan sebagai pengembang, melainkan sebagai penulis utama yang tiap hari memakai alat ini untuk menyusun *Kelas Telah Di Mulai*.

Ini kedua kalinya saya membangun perangkat lunak untuk pekerjaan yang saya jalani sendiri. Yang pertama untuk kelas yang saya ajar; yang ini untuk cerita yang saya tulis. Polanya sama: **setiap kekurangan di alat ini saya rasakan sendiri, di hari yang sama.**

---

### 3️⃣ Solution

Satu tempat yang menampung seluruh alur produksi — dari konsep, naskah, storyboard, hingga panel final — dengan dua wajah: **halaman publik** untuk memajang karya kepada pembaca, dan **dasbor terlindungi** untuk mengerjakannya.

Pemisahan itu disengaja. Alat produksi tidak boleh bocor ke pembaca, dan halaman pembaca tidak boleh dibebani kerumitan alat produksi.

---

### 4️⃣ Key Features

**Halaman publik** — galeri karya, halaman detail tiap judul lengkap dengan sinopsis, genre, dan profil karakter; animasi hero; FAQ; SEO dinamis lewat Vercel Edge Functions.

**Dasbor produksi** — manajemen naskah per bab dengan penyunting teks kaya, profil karakter berkolom khusus, pelacakan storyboard (draf → tinjau → revisi → setujui), pustaka referensi (lokasi, arsitektur, pakaian, pose), papan kanban tahapan produksi, manajemen galeri.

**Sistem desain tersendiri** — folder `design-system/` dengan prinsip *Liquid Glass* dan tipografi Archivo & Space Grotesk. Konsistensi visual diputuskan sekali, bukan ditebak ulang di tiap halaman.

---

### 5️⃣ Challenge

🟨 `[ISI: satu hambatan teknis konkret dari MochiToon. Kandidat kuat: penyunting Tiptap, pengelolaan aset gambar di Supabase Storage, atau animasi GSAP yang berat di perangkat lemah. Kalau tidak ada yang teringat, bagian ini kita isi dari refleksi berikut.]`

**Refleksi yang sudah bisa ditulis sekarang:**

> Repositori ini punya riwayat pengembangan paling panjang di antara semua proyek saya — 74 commit — dan sekaligus satu-satunya yang **tidak punya pengujian otomatis sama sekali**. Ketika itu saya belum menerapkannya. Setelah pengalaman melihat sebuah proyek besar runtuh karena tidak ada pagar pengaman, saya tidak akan mengulanginya.

Jawaban jujur seperti ini jauh lebih kuat daripada berpura-pura semuanya sempurna. Pewawancara akan membandingkan repo-repomu; lebih baik kamu yang menyebut kelemahannya lebih dulu.

---

### 6️⃣ Impact

| | Sebelum | Sesudah |
|---|---|---|
| Naskah & karakter | Tersebar di banyak dokumen | Satu tempat, tertaut per bab |
| Konsistensi karakter | Mengandalkan ingatan | Profil karakter jadi rujukan tetap |
| Memajang karya | Belum ada wadah | Halaman publik dengan SEO & kartu media sosial |
| Melacak tahap produksi | Di kepala | Papan kanban dengan tahapan eksplisit |

**Karya berjalan:** *Kelas Telah Di Mulai* — Seinen, genre Action / Horror / Psychology. Seorang instruktur yang terlilit utang menerima kontrak mengajar rahasia dari pemerintah di fasilitas bawah tanah, lalu menyadari ruang kelas itu adalah sistem rekayasa sosial yang mematikan — dan harus meretas aturannya dari dalam demi menyelamatkan murid-muridnya.

*(Sinopsis publik saja. Naskah lengkap ditahan karena akan diterbitkan sebagai komik bergambar.)*

---

### 7️⃣ Tech Choices

| Keputusan | Alasan |
|---|---|
| **React 19 + Vite 6** | Aplikasi ini didominasi dasbor interaktif, bukan halaman konten. Vite memberi umpan balik pengembangan tercepat |
| **Supabase** (Postgres + Auth + Storage) | Data produksi sangat relasional: judul → bab → naskah → karakter → referensi. Storage-nya menampung aset gambar tanpa layanan terpisah |
| **Tiptap** | Naskah butuh penyuntingan kaya (penekanan, struktur), bukan sekadar kotak teks |
| **React Hook Form + Zod** | Formulir profil karakter punya banyak medan. Validasi berbasis skema mencegah data setengah jadi masuk basis data |
| **GSAP + Framer Motion** | Ini situs rumah produksi visual. Kalau animasinya biasa saja, klaim "standar visual tertinggi" gugur di detik pertama |
| **Tailwind v4 + design system** | Konsistensi visual lintas dua wajah aplikasi yang sangat berbeda |
| **Vercel Edge Functions** | SEO dinamis per judul karya, agar tiap karya punya kartu pratinjau sendiri saat dibagikan |

⚠️ **Perbaikan yang sebaiknya kamu lakukan sebelum ini dipajang:** gambar Open Graph situsmu saat ini memakai foto stok dari Unsplash. Untuk rumah produksi komik yang mengklaim "standar visual tertinggi", memakai foto stok orang lain sebagai wajah pertama di media sosial itu kontradiksi yang akan langsung terlihat. Ganti dengan karya sendiri.

---

### 8️⃣ Screenshot — Placeholder

| # | Aset | Keterangan |
|---|---|---|
| 1 | Halaman detail *Kelas Telah Di Mulai* | "Halaman publik dengan sinopsis, genre, dan profil karakter" |
| 2 | Papan kanban produksi | "Tahapan produksi yang eksplisit" |
| 3 | Penyunting naskah Tiptap | "Menulis dan mengelola naskah per bab" |
| 4 | Pustaka referensi karakter | "Konsistensi visual lintas bab" |
| 5 | Cuplikan `design-system/` | "Keputusan visual diambil sekali, bukan ditebak ulang" |

---
---

# 🧵 BENANG MERAH PORTOFOLIO

Ketiga studi kasus ini bukan tiga proyek acak. Ada satu kalimat yang menyatukan semuanya, dan kalimat ini yang akan jadi inti halaman depan:

> **Saya membangun perangkat lunak untuk pekerjaan yang saya jalani sendiri — lalu memperbaikinya karena sayalah yang pertama merasakan kalau ada yang salah.**

| Proyek | Perannya |
|---|---|
| SIAKAD Informatika | Saya gurunya |
| MochiToon | Saya penulisnya |
| City Courier | Saya penyerangnya — lalu menerbitkan hasilnya |

Dan di bawahnya, kalimat yang tidak bisa ditulis kandidat lain mana pun:

> *Saya merancang rubrik peninjauan sejawat untuk murid kelas 5 sebelum saya menerapkannya pada proyek 113.000 baris milik saya sendiri. Pelajaran itu datang dengan harga mahal.*

---

# ✅ SISA SATU HAL

| # | Kebutuhan | Status |
|---|---|---|
| 1 | **Satu cerita debugging teknis** — kandidat: Midtrans, Tiptap, atau Supabase Storage | 🟠 Terakhir |

Portofolio ini sekarang kuat di **produk** (SIAKAD Informatika), **riset** (City Courier), dan **kepemilikan penuh** (MochiToon). Yang belum ada: momen kamu berhadapan dengan bug yang tidak masuk akal dan menaklukkannya.

Kalau benar-benar tidak ada yang teringat — **tidak apa-apa.** Kita jujur soal itu, lalu kita bangun sisi teknisnya di Fase 3 dengan menjadikan **pembangunan situs portofolio ini sendiri** sebagai studi kasus keempat: TDD sungguhan, keputusan arsitektur yang dicatat, dan riwayat commit yang bercerita. Bukti yang dibuat di depan mata, bukan tambal sulam.

**Fase 2 selesai. Menunggu "Lanjut" untuk Fase 3.**
