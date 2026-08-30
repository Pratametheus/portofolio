import type {CaseStudy, Locale} from '../types';

export const mochitoon: Record<Locale, CaseStudy> = {
  id: {
    slug: 'mochitoon',
    title: 'MochiToon',
    tagline: 'Saya membangun alat produksinya, dan saya juga yang menulis ceritanya.',
    year: 2026,
    stack: ['React', 'Vite', 'Supabase', 'Tiptap', 'GSAP'],
    featured: false,
    liveUrl: 'https://manga-studio-one.vercel.app/',
    thumbnail: {
      src: '/karya/mochitoon.webp',
      alt: 'Tangkapan layar studio produksi komik MochiToon'
    },
    sections: [
      {
        heading: 'Problem',
        blocks: [
          {
            type: 'p',
            text: `Produksi komik indie berantakan bukan karena kurang ide, tapi karena idenya tersebar. Naskah di satu dokumen, profil karakter di dokumen lain, referensi visual di folder, papan storyboard di kepala. Saat ceritanya tumbuh, biaya untuk mengingat "karakter ini rambutnya seperti apa di bab 3" jadi lebih mahal daripada menggambarnya.\n\nSaya tahu persis rasanya, karena saya yang menulis ceritanya.`
          }
        ]
      },
      {
        heading: 'User',
        blocks: [
          {
            type: 'p',
            text: `Studio komik indie dan kreator solo. Tapi pengguna nomor satunya adalah saya sendiri, dalam peran yang berbeda — bukan sebagai pengembang, melainkan sebagai penulis utama yang tiap hari memakai alat ini untuk menyusun Kelas Telah Di Mulai.\n\nIni kedua kalinya saya membangun perangkat lunak untuk pekerjaan yang saya jalani sendiri. Yang pertama untuk kelas yang saya ajar; yang ini untuk cerita yang saya tulis. Polanya sama: setiap kekurangan di alat ini saya rasakan sendiri, di hari yang sama.`
          }
        ]
      },
      {
        heading: 'Solution',
        blocks: [
          {
            type: 'p',
            text: `Satu tempat yang menampung seluruh alur produksi — dari konsep, naskah, storyboard, hingga panel final — dengan dua wajah: halaman publik untuk memajang karya kepada pembaca, dan dasbor terlindungi untuk mengerjakannya.\n\nPemisahan itu disengaja. Alat produksi tidak boleh bocor ke pembaca, dan halaman pembaca tidak boleh dibebani kerumitan alat produksi.`
          }
        ]
      },
      {
        heading: 'Key Features',
        blocks: [
          {
            type: 'list',
            items: [
              'Halaman publik — galeri karya, halaman detail tiap judul lengkap dengan sinopsis, genre, dan profil karakter; animasi hero; FAQ; SEO dinamis lewat Vercel Edge Functions.',
              'Dasbor produksi — manajemen naskah per bab dengan penyunting teks kaya, profil karakter berkolom khusus, pelacakan storyboard (draf → tinjau → revisi → setujui), pustaka referensi (lokasi, arsitektur, pakaian, pose), papan kanban tahapan produksi, manajemen galeri.',
              'Sistem desain tersendiri — folder design-system/ dengan prinsip Liquid Glass dan tipografi Archivo & Space Grotesk. Konsistensi visual diputuskan sekali, bukan ditebak ulang di tiap halaman.'
            ]
          }
        ]
      },
      {
        heading: 'Challenge',
        blocks: [
          {
            type: 'p',
            text: '🟨 [ISI: satu hambatan teknis konkret dari MochiToon. Kandidat kuat: penyunting Tiptap, pengelolaan aset gambar di Supabase Storage, atau animasi GSAP yang berat di perangkat lemah. Kalau tidak ada yang teringat, bagian ini kita isi dari refleksi berikut.]\n\nRefleksi yang sudah bisa ditulis sekarang:'
          },
          {
            type: 'quote',
            text: 'Repositori ini punya riwayat pengembangan paling panjang di antara semua proyek saya — 74 commit — dan sekaligus satu-satunya yang tidak punya pengujian otomatis sama sekali. Ketika itu saya belum menerapkannya. Setelah pengalaman melihat sebuah proyek besar runtuh karena tidak ada pagar pengaman, saya tidak akan mengulanginya.'
          },
          {
            type: 'p',
            text: 'Jawaban jujur seperti ini jauh lebih kuat daripada berpura-pura semuanya sempurna. Pewawancara akan membandingkan repo-repomu; lebih baik kamu yang menyebut kelemahannya lebih dulu.'
          }
        ]
      },
      {
        heading: 'Impact',
        blocks: [
          {
            type: 'table',
            rows: [
              ['Naskah & karakter', 'Sebelum: Tersebar di banyak dokumen · Sesudah: Satu tempat, tertaut per bab'],
              ['Konsistensi karakter', 'Sebelum: Mengandalkan ingatan · Sesudah: Profil karakter jadi rujukan tetap'],
              ['Memajang karya', 'Sebelum: Belum ada wadah · Sesudah: Halaman publik dengan SEO & kartu media sosial'],
              ['Melacak tahap produksi', 'Sebelum: Di kepala · Sesudah: Papan kanban dengan tahapan eksplisit']
            ]
          },
          {
            type: 'p',
            text: 'Karya berjalan: Kelas Telah Di Mulai — Seinen, genre Action / Horror / Psychology. Seorang instruktur yang terlilit utang menerima kontrak mengajar rahasia dari pemerintah di fasilitas bawah tanah, lalu menyadari ruang kelas itu adalah sistem rekayasa sosial yang mematikan — dan harus meretas aturannya dari dalam demi menyelamatkan murid-muridnya.'
          },
          {
            type: 'p',
            text: '(Sinopsis publik saja. Naskah lengkap ditahan karena akan diterbitkan sebagai komik bergambar.)'
          }
        ]
      },
      {
        heading: 'Tech Choices',
        blocks: [
          {
            type: 'table',
            rows: [
              ['React 19 + Vite 6', 'Aplikasi ini didominasi dasbor interaktif, bukan halaman konten. Vite memberi umpan balik pengembangan tercepat'],
              ['Supabase (Postgres + Auth + Storage)', 'Data produksi sangat relasional: judul → bab → naskah → karakter → referensi. Storage-nya menampung aset gambar tanpa layanan terpisah'],
              ['Tiptap', 'Naskah butuh penyuntingan kaya (penekanan, struktur), bukan sekadar kotak teks'],
              ['React Hook Form + Zod', 'Formulir profil karakter punya banyak medan. Validasi berbasis skema mencegah data setengah jadi masuk basis data'],
              ['GSAP + Framer Motion', 'Ini situs rumah produksi visual. Kalau animasinya biasa saja, klaim "standar visual tertinggi" gugur di detik pertama'],
              ['Tailwind v4 + design system', 'Konsistensi visual lintas dua wajah aplikasi yang sangat berbeda'],
              ['Vercel Edge Functions', 'SEO dinamis per judul karya, agar tiap karya punya kartu pratinjau sendiri saat dibagikan']
            ]
          },
          {
            type: 'p',
            text: '⚠️ Perbaikan yang sebaiknya kamu lakukan sebelum ini dipajang: gambar Open Graph situsmu saat ini memakai foto stok dari Unsplash. Untuk rumah produksi komik yang mengklaim "standar visual tertinggi", memakai foto stok orang lain sebagai wajah pertama di media sosial itu kontradiksi yang akan langsung terlihat. Ganti dengan karya sendiri.'
          }
        ]
      },
      {
        heading: 'Screenshot — Placeholder',
        blocks: [
          {
            type: 'table',
            rows: [
              ['1 · Halaman detail Kelas Telah Di Mulai', 'Halaman publik dengan sinopsis, genre, dan profil karakter'],
              ['2 · Papan kanban produksi', 'Tahapan produksi yang eksplisit'],
              ['3 · Penyunting naskah Tiptap', 'Menulis dan mengelola naskah per bab'],
              ['4 · Pustaka referensi karakter', 'Konsistensi visual lintas bab'],
              ['5 · Cuplikan design-system/', 'Keputusan visual diambil sekali, bukan ditebak ulang']
            ]
          }
        ]
      }
    ]
  },
  en: {
    slug: 'mochitoon',
    title: 'MochiToon',
    tagline: 'I built the production tool, and I write the story it manages.',
    year: 2026,
    stack: ['React', 'Vite', 'Supabase', 'Tiptap', 'GSAP'],
    featured: false,
    liveUrl: 'https://manga-studio-one.vercel.app/',
    thumbnail: {
      src: '/karya/mochitoon.webp',
      alt: 'Screenshot of the MochiToon comic production studio'
    },
    sections: [
      {
        heading: 'Problem',
        blocks: [
          {
            type: 'p',
            text: `Independent comics rarely run short of ideas; they lose coherence because those ideas live everywhere. Scripts sit in one document, character sheets in another, references in folders, and the storyboard in someone's head. As a story expands, remembering a character's exact appearance in chapter three can take longer than drawing them. I know the cost because I write the story myself.`
          }
        ]
      },
      {
        heading: 'User',
        blocks: [
          {
            type: 'p',
            text: `MochiToon serves independent studios and solo creators, but its first user is me in another role: the lead writer using it daily for Kelas Telah Di Mulai. This is the second product I have built for work I personally do. As with my teaching system, a missing capability becomes my own problem on the same day.`
          }
        ]
      },
      {
        heading: 'Solution',
        blocks: [
          {
            type: 'p',
            text: 'One workspace carries a comic from concept through script and storyboard to final panels. It deliberately has two faces: a public showcase for readers and a protected production dashboard for the studio. Readers should never inherit the complexity of the production tools, and private production work should never leak into the public experience.'
          }
        ]
      },
      {
        heading: 'Key Features',
        blocks: [
          {
            type: 'list',
            items: [
              'Public site — a gallery, title pages with synopsis, genres and character profiles, an animated hero, FAQ, and dynamic social metadata through Vercel Edge Functions.',
              'Production dashboard — rich chapter scripts, structured character profiles, storyboard states from draft to approval, visual references, a production kanban board, and gallery management.',
              'Dedicated design system — a design-system/ directory defines Liquid Glass principles and Archivo/Space Grotesk typography so visual decisions are made once.'
            ]
          }
        ]
      },
      {
        heading: 'Challenge',
        blocks: [
          {
            type: 'p',
            text: 'A concrete technical postmortem still needs to be added—likely the Tiptap editor, Supabase Storage asset handling, or GSAP performance on weaker devices. The evidence already available points to a broader engineering lesson:'
          },
          {
            type: 'quote',
            text: 'This repository has the longest development history of my projects—74 commits—and is also the only one with no automated tests. I had not adopted them yet. After watching a larger project collapse without guardrails, I will not repeat that omission.'
          },
          {
            type: 'p',
            text: 'Naming that weakness directly is more useful than presenting a falsely perfect project. The next iteration needs an explicit technical story and automated protection.'
          }
        ]
      },
      {
        heading: 'Impact',
        blocks: [
          {
            type: 'table',
            rows: [
              ['Scripts and characters', 'Before: spread across documents · After: connected in one chapter-aware workspace'],
              ['Character continuity', 'Before: depended on memory · After: stable character profiles'],
              ['Publishing work', 'Before: no home · After: a public site with SEO and social cards'],
              ['Production tracking', 'Before: held mentally · After: explicit kanban stages']
            ]
          },
          {
            type: 'p',
            text: 'The active work is Kelas Telah Di Mulai, a seinen action/horror/psychology story. A debt-ridden instructor accepts a secret government teaching contract underground, discovers the classroom is a lethal social-engineering system, and must hack its rules from within to save the students.'
          },
          {
            type: 'p',
            text: '(Only the public synopsis appears here; the full script is withheld for the illustrated release.)'
          }
        ]
      },
      {
        heading: 'Tech Choices',
        blocks: [
          {
            type: 'table',
            rows: [
              ['React 19 + Vite 6', 'Prioritises fast feedback for a highly interactive dashboard'],
              ['Supabase (Postgres + Auth + Storage)', 'Keeps relational production data, access control, and image assets in one service'],
              ['Tiptap', 'Supports structured rich-text scripts instead of a plain textarea'],
              ['React Hook Form + Zod', 'Schema validation prevents incomplete character records'],
              ['GSAP + Framer Motion', 'A visual studio needs motion that supports its creative promise'],
              ['Tailwind v4 + design system', 'Maintains consistency across very different public and private surfaces'],
              ['Vercel Edge Functions', 'Generates title-specific SEO and social previews']
            ]
          },
          {
            type: 'p',
            text: 'Before presenting the product, its stock Unsplash Open Graph image should be replaced with original work. A comic studio promising a high visual standard should make its own art the first thing shared on social media.'
          }
        ]
      },
      {
        heading: 'Screenshot — Placeholder',
        blocks: [
          {
            type: 'table',
            rows: [
              ['1 · Kelas Telah Di Mulai detail', 'Public synopsis, genre, and character profiles'],
              ['2 · Production kanban', 'Explicit stages from draft to approval'],
              ['3 · Tiptap script editor', 'Writing and managing individual chapters'],
              ['4 · Character reference library', 'Visual continuity between chapters'],
              ['5 · design-system/ excerpt', 'Visual decisions made once rather than guessed per page']
            ]
          }
        ]
      }
    ]
  }
};
