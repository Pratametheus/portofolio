import type {CaseStudy, Locale} from '../types';

export const siakadInformatika: Record<Locale, CaseStudy> = {
  id: {
    slug: 'siakad-informatika',
    title: 'SIAKAD Informatika',
    tagline: 'Saya mengajar informatika di sekolah dasar. Sistem akademik yang saya gunakan, saya bangun sendiri.',
    scope: 'Sistem Akademik Ekstrakurikuler Informatika · SDN Ujung XIII',
    year: 2026,
    stack: ['Next.js', 'React', 'Supabase', 'Tailwind CSS', 'TypeScript'],
    featured: true,
    liveUrl: 'https://jurnal-mengajar-blond.vercel.app/',
    repositoryNote: 'Repositori privat untuk melindungi struktur data akademik siswa.',
    thumbnail: {
      src: '/karya/siakad-informatika.webp',
      alt: 'Tangkapan layar aplikasi SIAKAD Informatika'
    },
    sections: [
      {
        heading: 'Problem',
        blocks: [
          {
            type: 'p',
            text: `Sejak April 2026 saya mengajar komputer untuk kelas 4, 5, dan 6 di SDN Ujung XIII/38.\n\nSebelum tahun ajaran dimulai, saya menyusun Program Kerja: kurikulum lengkap tiga tingkat kelas, dua semester, beserta rubrik penilaiannya. Enam jam kerja, sekali setahun. Hasilnya satu dokumen yang harus tetap hidup dan mudah dijangkau selama satu tahun ajaran penuh.\n\nLalu setiap pertemuan menambah lapisan baru: apa yang diajarkan, sampai mana, siapa yang tertinggal, berapa nilainya.\n\nAwalnya saya kira masalah saya adalah waktu. Ternyata bukan. Menyusun kurikulum memang lama, tapi itu pekerjaan berpikir — dan pekerjaan berpikir memang butuh waktu. Merekap nilai malah cepat, tidak sampai lima menit.\n\nMasalahnya baru terasa setelah dokumen itu jadi:`
          },
          {
            type: 'list',
            items: [
              'Dokumen tercetak harus dibawa ke mana-mana',
              'Melacak "materi Scratch kelas 5 sudah sampai blok apa?" berarti membuka berkas satu per satu',
              'Setiap revisi melahirkan salinan baru, dan setiap salinan baru melahirkan keraguan mana yang paling mutakhir',
              'Rencana setahun yang tersimpan sebagai berkas statis akan segera tertinggal dari kenyataan di kelas'
            ]
          },
          {
            type: 'p',
            text: 'Yang saya butuhkan bukan penghemat waktu, melainkan satu tempat yang bisa saya buka dari mana saja — dan yang selalu benar.'
          }
        ]
      },
      {
        heading: 'User',
        blocks: [
          {
            type: 'p',
            text: `Pengguna utama: saya sendiri. Guru yang mengampu tiga tingkat kelas dengan kurikulum berbeda di tiap tingkat.\n\nPengguna kedua yang tidak saya rencanakan: murid-murid saya. Saya mulai membuka halaman materi di depan kelas sebagai cuplikan — "minggu depan kita belajar ini". Fungsinya berubah: dari alat administrasi pribadi menjadi alat mengajar. Versi sekarang memberi murid jalur tersendiri melalui Portal Murid, tempat mereka memilih kelas dan rombel tanpa memperoleh akses editor.\n\nPerubahan itu memaksa saya memperbaiki hal yang tadinya tidak saya pedulikan. Kalau sebuah halaman ditampilkan ke anak berusia sepuluh tahun, halaman itu harus terbaca — bukan sekadar berfungsi. Ukuran huruf, kontras, dan kerapian mendadak jadi penting, bukan karena teori desain, tapi karena ada tiga puluh anak yang menyipitkan mata ke layar.\n\nBelum ada guru lain yang memakainya sebagai editor. Saya menuliskannya apa adanya: ini belum menjadi sistem institusional; satu guru yang benar-benar memakainya tiap minggu, ditambah murid yang mengakses portal kelasnya, lebih bernilai daripada adopsi luas yang diklaim tanpa bukti.`
          }
        ]
      },
      {
        heading: 'Solution',
        blocks: [
          {
            type: 'p',
            text: `Tiga pilihan: bertahan manual, memakai aplikasi manajemen sekolah yang ada, atau membangun sendiri.\n\nAplikasi sekolah yang tersedia dirancang untuk administrasi institusi — absensi, SPP, rapor. Untuk kebutuhan saya itu berlebihan, dan justru menambah pekerjaan karena harus mengisi banyak kolom yang tidak relevan.\n\nSaya membangun sendiri, dengan satu batasan keras: hanya menyelesaikan masalah yang benar-benar saya alami. Versi pertama berfokus pada kurikulum dan jurnal pertemuan. Setelah dipakai di kelas, cakupannya tumbuh berdasarkan kebutuhan nyata: data siswa, daftar hadir dan nilai, jadwal pelajaran, materi pokok, serta portal murid. Tetap tidak ada SPP, rapor sekolah, atau dasbor kepala sekolah—ini sistem akademik ekstrakurikuler informatika, bukan SIAKAD seluruh sekolah.\n\nBatasan itu yang membuatnya selesai — dan yang membuatnya benar-benar saya pakai, bukan menumpuk sebagai proyek mangkrak.`
          }
        ]
      },
      {
        heading: 'Key Features',
        blocks: [
          {
            type: 'list',
            items: [
              'Kurikulum per tingkat kelas — Program Kerja tiga tingkat dalam bentuk hidup, bukan berkas statis. Kelas 4 Literasi Digital & Fondasi Logika, kelas 5 Pemrograman Visual, kelas 6 Logika Pemrograman Teks & Web.',
              'Jurnal per pertemuan — catatan tiap tatap muka yang bisa ditelusuri, bukan diingat-ingat.',
              'Daftar hadir & nilai per pertemuan — status kehadiran dan nilai dicatat pada konteks kelas, rombel, dan nomor pertemuan yang sama.',
              'Rekap nilai berbasis rubrik — mengikuti rubrik lima kriteria yang saya rancang, dengan perhitungan (Total Skor / 20) × 100.',
              'Manajemen jadwal — satu sumber kebenaran, diperbarui hanya saat kebijakan sekolah berubah.',
              'Ekspor ke Excel — bukan fitur teknis, melainkan keputusan diplomatik. Sekolah tetap butuh berkas Excel untuk pelaporan, dan aplikasi saya tidak boleh memaksa institusi mengubah caranya bekerja. Aplikasi yang menuntut dunia menyesuaikan diri akan ditolak dunia.',
              'Portal Murid + area editor terlindungi — murid memilih kelas dan rombel melalui portalnya sendiri; pengelolaan data siswa dan catatan pertemuan tetap membutuhkan akses guru.'
            ]
          }
        ]
      },
      {
        heading: 'Challenge — Membangun sesuatu yang tidak ada contohnya',
        blocks: [
          {
            type: 'p',
            text: `Hambatan terbesar bukan hal teknis. Hambatannya: tidak ada acuan.\n\nUntuk hampir semua jenis aplikasi ada contoh yang bisa dipelajari — pola datanya, alurnya, tata letaknya. Untuk "aplikasi jurnal mengajar guru komputer SD", tidak ada. Tidak ada templat, tidak ada studi kasus, tidak ada pola mapan untuk ditiru.\n\nSaya membangun versi pertama berdasarkan asumsi saya sendiri tentang apa yang saya butuhkan. Asumsi itu meleset. Aplikasinya berfungsi, tapi begitu dipakai beberapa minggu, saya terus menemukan hal yang seharusnya ada tapi tidak terpikirkan saat merancang.\n\nYang menyelesaikannya bukan kepintaran teknis, melainkan berhenti menebak:`
          },
          {
            type: 'list',
            items: [
              'Meneliti bagaimana masalah serupa diselesaikan di domain lain',
              'Memakai AI sebagai lawan diskusi untuk menguji rancangan',
              'Bertanya langsung kepada guru-guru lain tentang cara mereka mengerjakan hal yang sama'
            ]
          },
          {
            type: 'p',
            text: `Poin ketiga yang paling mengubah keadaan. Guru lain punya kebiasaan yang tidak pernah saya pikirkan, karena mereka sudah bertahun-tahun menemukan jalan pintasnya sendiri. Beberapa keputusan desain terbaik di aplikasi ini lahir dari percakapan, bukan dari dokumentasi.\n\nYang berubah dari cara saya bekerja: saya berhenti menganggap "saya penggunanya, jadi saya pasti tahu yang dibutuhkan". Menjadi pengguna memberi saya masalahnya — bukan otomatis solusinya. Sekarang saya bertanya dulu sebelum membangun, bahkan untuk aplikasi yang hanya saya sendiri yang pakai.`
          }
        ]
      },
      {
        heading: 'Impact — Sebelum & sesudah',
        blocks: [
          {
            type: 'quote',
            text: '⚠️ Catatan kejujuran. Aku sengaja tidak menulis "hemat X jam". Kamu menyusun kurikulum dengan bantuan AI, dan SIAKAD Informatika tidak menulis kurikulum untukmu — ia menyimpan, menata, dan menjaganya tetap hidup. Klaim penghematan waktu akan runtuh dalam satu pertanyaan susulan. Klaim di bawah ini tidak akan.'
          },
          {
            type: 'table',
            rows: [
              ['Akses kurikulum', 'Sebelum: Dokumen tercetak, dibawa ke mana-mana · Sesudah: Dibuka dari perangkat apa pun, kapan pun'],
              ['Melacak progres materi', 'Sebelum: Buka berkas satu per satu · Sesudah: Riwayat jurnal per kelas, langsung terlihat'],
              ['Merevisi rencana', 'Sebelum: Salinan baru tiap revisi, ragu mana yang mutakhir · Sesudah: Satu sumber, selalu versi terbaru'],
              ['Rencana vs kenyataan kelas', 'Sebelum: Dokumen statis yang cepat tertinggal · Sesudah: Dokumen hidup yang ikut bergerak'],
              ['Menunjukkan materi ke murid', 'Sebelum: Tidak terpikirkan · Sesudah: Portal Murid dan halaman materi dibuka langsung di kelas']
            ]
          },
          {type: 'p', text: 'Pernyataan dampak yang tidak butuh satu angka pun:'},
          {
            type: 'quote',
            text: 'Aplikasi ini dipakai secara nyata, tiap minggu, untuk mengajar tiga tingkat kelas di sekolah dasar. Bukan demo, bukan proyek latihan. Penggunanya adalah orang yang langsung tahu kalau ada yang rusak — karena dia sedang berdiri di depan kelas saat itu terjadi.'
          }
        ]
      },
      {
        heading: 'Tech Choices',
        blocks: [
          {
            type: 'table',
            rows: [
              ['Next.js 16 + React 19', 'Portal murid harus cepat dibuka dari HP di jaringan sekolah; area editor harus interaktif. Satu framework untuk keduanya'],
              ['Supabase (Postgres + Auth)', 'Data akademik relasional secara alami: kelas → rombel → pertemuan → kehadiran dan nilai. Auth melindungi akses editor tanpa membebani portal murid dengan kewenangan yang sama'],
              ['TypeScript', 'Salah tipe di data nilai berarti angka siswa yang salah. Ditangkap sebelum sampai ke layar'],
              ['Tailwind CSS v4', 'Solo, waktu terbatas. Berkas CSS terpisah berarti dua tempat untuk satu perubahan'],
              ['xlsx', 'Keputusan produk, bukan teknis — sekolah butuh Excel'],
              ['Framer Motion', 'Halaman ini ditampilkan ke anak-anak; transisi halus membantu mereka mengikuti perpindahan konteks'],
              ['Vercel', 'Nol konfigurasi, gratis, deploy otomatis dari git']
            ]
          },
          {type: 'p', text: 'Repositori ditutup untuk umum — dan itu disengaja:'},
          {
            type: 'quote',
            text: 'Repositori ini saya privatkan karena skema basis datanya memuat struktur data akademik siswa. Untuk sesuatu yang menyimpan nilai anak-anak, keterbukaan kode bukan prioritas di atas privasi mereka. Kodenya bisa saya tunjukkan langsung dalam sesi wawancara.'
          },
          {
            type: 'p',
            text: 'Ini bukan alasan untuk menutupi kekurangan. Ini konsisten dengan positioning-mu — orang yang menerbitkan riset keamanan seharusnya memang berpikir dua kali sebelum membuka data siswa ke publik. Perekrut yang jeli akan menangkap ini sebagai nilai tambah, bukan kekurangan.'
          }
        ]
      },
      {
        heading: 'Screenshot — Placeholder',
        blocks: [
          {
            type: 'table',
            rows: [
              ['1 · Halaman depan dari HP', 'Dibuka dari HP di jaringan sekolah'],
              ['2 · Daftar kurikulum kelas 4', 'Program Kerja sebagai dokumen hidup'],
              ['3 · Formulir jurnal pertemuan', 'Alur pencatatan setelah mengajar'],
              ['4 · Daftar hadir & nilai', 'Kehadiran dan evaluasi dalam konteks pertemuan yang sama'],
              ['5 · Portal Murid', 'Akses kelas dan rombel tanpa membuka area editor'],
              ['6 · Hasil ekspor Excel', 'Menyesuaikan format yang sekolah butuhkan'],
              ['7 · PDF Program Kerja — sampul + halaman rubrik', 'Aset nyata, nol data siswa, aman dipajang & diunduh'],
              ['8 · Halaman materi ditampilkan di kelas', '🔥 Foto layar/proyektor di depan murid. Gambar terkuat di seluruh portofolio']
            ]
          }
        ]
      }
    ]
  },
  en: {
    slug: 'siakad-informatika',
    title: 'SIAKAD Informatika',
    tagline: 'I teach computing at a primary school. I built the academic system I use.',
    scope: 'Computing extracurricular academic system · SDN Ujung XIII',
    year: 2026,
    stack: ['Next.js', 'React', 'Supabase', 'Tailwind CSS', 'TypeScript'],
    featured: true,
    liveUrl: 'https://jurnal-mengajar-blond.vercel.app/',
    repositoryNote: 'Private repository to protect the structure of student academic data.',
    thumbnail: {
      src: '/karya/siakad-informatika.webp',
      alt: 'Screenshot of the SIAKAD Informatika application'
    },
    sections: [
      {
        heading: 'Problem',
        blocks: [
          {
            type: 'p',
            text: `I have taught computing to years 4, 5, and 6 at SDN Ujung XIII/38 since April 2026. Before the school year begins, I prepare a three-year curriculum covering both semesters and its assessment rubrics. That annual six-hour planning session creates a document that needs to remain useful for the entire year. Every lesson then adds reality: what I taught, how far each class progressed, who fell behind, and what they scored.\n\nThe expensive part was not planning or entering marks. It was keeping the finished plan trustworthy once teaching began:`
          },
          {
            type: 'list',
            items: [
              'A printed document had to travel everywhere with me',
              'Checking how far year 5 had reached in Scratch meant opening files one by one',
              'Every revision created another copy and another doubt about which copy was current',
              'A static annual plan drifted away from what had actually happened in class'
            ]
          },
          {
            type: 'p',
            text: 'I did not need a time-saving trick. I needed one dependable place I could reach anywhere and trust to be current.'
          }
        ]
      },
      {
        heading: 'User',
        blocks: [
          {
            type: 'p',
            text: `The primary user is me: one teacher managing distinct curricula for three year groups. The unexpected users are my pupils. I began showing upcoming material in class, and a private administration tool became part of the lesson itself. A dedicated Student Portal now lets pupils choose their class without exposing editing controls.\n\nThat changed the quality bar. A page shown to thirty ten-year-olds must be legible, not merely functional. Type size, contrast, and visual order became practical classroom requirements. No other teacher currently edits the system, and I do not pretend this is institution-wide adoption. One teacher relying on it every week, plus pupils using their portal, is stronger evidence than an inflated adoption claim.`
          }
        ]
      },
      {
        heading: 'Solution',
        blocks: [
          {
            type: 'p',
            text: `I could stay with paper, force a general school-management product to fit, or build the narrow tool I actually needed. Existing products centred on institutional administration—fees, attendance, report cards—and demanded fields irrelevant to an extracurricular computing class.\n\nI chose to build only against problems I had personally encountered. The first version covered curriculum and lesson journals. Real classroom use then justified student records, attendance and marks, timetables, core material, and the Student Portal. It still has no fee collection, school report cards, or head-teacher dashboard. That boundary made the product finishable and useful rather than another abandoned side project.`
          }
        ]
      },
      {
        heading: 'Key Features',
        blocks: [
          {
            type: 'list',
            items: [
              'Curriculum by year group — a living programme for digital literacy, visual programming, and text-based web foundations.',
              'Lesson journals — a searchable account of every meeting rather than a memory test.',
              'Attendance and marks per lesson — both recorded in the same class, group, and meeting context.',
              'Rubric-based totals — five assessment criteria converted with (total score / 20) × 100.',
              'Timetable management — one source updated only when school policy changes.',
              'Excel export — a product decision that respects the reporting format the school already uses.',
              'Student Portal and protected editor — pupils can reach their material while academic records remain behind teacher access.'
            ]
          }
        ]
      },
      {
        heading: 'Challenge — Building without a template',
        blocks: [
          {
            type: 'p',
            text: `The hardest constraint was not technical: there was no established model for a primary-school computing teacher's lesson-journal application. My first version encoded assumptions about my own needs, and classroom use quickly exposed what those assumptions had missed. The way forward was to stop guessing:`
          },
          {
            type: 'list',
            items: [
              'Study how adjacent domains organise similar work',
              'Use AI as a critical design partner rather than an answer machine',
              'Ask other teachers how they already solve the same operational problems'
            ]
          },
          {
            type: 'p',
            text: `Conversations produced several of the product's best decisions because experienced teachers had developed shortcuts I had never seen. I learned that being the user gives me privileged access to the problem, not automatic knowledge of the solution. I now ask before building, even when I expect to be the only user.`
          }
        ]
      },
      {
        heading: 'Impact — Before and after',
        blocks: [
          {
            type: 'quote',
            text: 'Honesty note: the application does not write the curriculum for me, so I make no invented hours-saved claim. Its value is keeping that curriculum organised, current, and available.'
          },
          {
            type: 'table',
            rows: [
              ['Curriculum access', 'Before: carried as printouts · After: available from any device'],
              ['Tracking progress', 'Before: searched file by file · After: lesson history visible by class'],
              ['Revising plans', 'Before: conflicting copies · After: one current source'],
              ['Plan versus classroom', 'Before: a static document · After: a living record'],
              ['Showing pupils material', 'Before: not considered · After: opened directly through the Student Portal']
            ]
          },
          {type: 'p', text: 'The outcome needs no synthetic metric:'},
          {
            type: 'quote',
            text: 'This application is used every week to teach three primary-school year groups. It is not a demo. Its user discovers a failure immediately because he may be standing in front of a class when it happens.'
          }
        ]
      },
      {
        heading: 'Tech Choices',
        blocks: [
          {
            type: 'table',
            rows: [
              ['Next.js 16 + React 19', 'Fast phone access for pupils and an interactive editor in one framework'],
              ['Supabase (Postgres + Auth)', 'Relational academic records and separate authorization for teacher tools'],
              ['TypeScript', 'Catches data-shape mistakes before they become incorrect student marks'],
              ['Tailwind CSS v4', 'Keeps a solo project moving without splitting each visual change across files'],
              ['xlsx', 'Preserves the Excel reporting workflow the school requires'],
              ['Framer Motion', 'Gentle transitions help young pupils follow context changes'],
              ['Vercel', 'Automatic deployment with almost no operational overhead']
            ]
          },
          {type: 'p', text: 'The repository is private by design:'},
          {
            type: 'quote',
            text: 'Its database schema represents student academic records. For software that stores children’s marks, public source code is less important than protecting their privacy. I can walk through the code in an interview.'
          },
          {
            type: 'p',
            text: 'That is not a way to hide shortcomings; it is consistent risk management for someone who publishes security research.'
          }
        ]
      },
      {
        heading: 'Screenshot — Placeholder',
        blocks: [
          {
            type: 'table',
            rows: [
              ['1 · Mobile home screen', 'Opened on a phone over the school network'],
              ['2 · Year 4 curriculum', 'The programme as a living document'],
              ['3 · Lesson journal form', 'The post-lesson recording flow'],
              ['4 · Attendance and marks', 'Evaluation in the context of one meeting'],
              ['5 · Student Portal', 'Class access without editor permissions'],
              ['6 · Excel export', 'Output shaped for the school’s workflow'],
              ['7 · Programme PDF and rubric', 'A real artifact with no student data'],
              ['8 · Material shown in class', 'A projector view in front of the pupils—the strongest portfolio image']
            ]
          }
        ]
      }
    ]
  }
};
