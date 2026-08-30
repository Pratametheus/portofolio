import type {CaseStudy, Locale} from '../types';

export const cityCourier: Record<Locale, CaseStudy> = {
  id: {
    slug: 'city-courier',
    title: 'City Courier',
    tagline: 'Saya menyerang sistem autentikasi saya sendiri sepuluh kali, lalu menerbitkan hasilnya.',
    year: 2026,
    stack: ['Flutter', 'Laravel', 'JWKS', 'RS256'],
    featured: true,
    thumbnail: {
      src: '/karya/city-courier.webp',
      alt: 'Diagram autentikasi aplikasi City Courier'
    },
    sections: [
      {
        heading: 'Problem',
        blocks: [
          {
            type: 'p',
            text: `Hampir setiap aplikasi modern memakai JSON Web Token untuk menjaga sesi login, dan sebagian besar tutorial mengajarkannya dengan cara yang sama: satu kunci rahasia, algoritma HS256, selesai.\n\nCara itu berhasil — sampai tidak lagi. JWT punya sejumlah celah yang sudah lama terdokumentasi: serangan \`alg: none\` yang membuat token tanpa tanda tangan diterima, kebingungan algoritma yang menipu server memverifikasi dengan cara yang salah, dan penyuntikan \`kid\` yang mengarahkan verifikasi ke kunci milik penyerang.\n\nYang mengganggu saya bukan keberadaan celah itu, melainkan satu pertanyaan yang tidak terjawab tuntas di materi berbahasa Indonesia yang saya temukan: kalau saya menerapkan pengamanan yang katanya benar, apakah ia benar-benar bertahan saat diserang?\n\nSebagian besar tulisan berhenti pada "gunakan RS256". Nyaris tidak ada yang menunjukkan buktinya.`
          }
        ]
      },
      {
        heading: 'User',
        blocks: [
          {
            type: 'p',
            text: `Langsung: pengguna sistem kurir — pengirim, kurir, admin — yang sesi loginnya bergantung pada mekanisme ini. Mereka tidak akan pernah tahu ia ada, dan memang begitu seharusnya. Keamanan yang bekerja itu tidak terlihat.\n\nSesungguhnya: pengembang lain yang menghadapi pertanyaan yang sama. Itulah sebabnya hasilnya saya terbitkan, bukan saya simpan.`
          }
        ]
      },
      {
        heading: 'Solution',
        blocks: [
          {
            type: 'p',
            text: `Alih-alih satu kunci rahasia bersama, sistem ini memakai kriptografi asimetris RS256 dan mendistribusikan kunci publiknya lewat JWKS sesuai RFC 7517.\n\nPerbedaannya bisa dijelaskan tanpa istilah teknis sama sekali:`
          },
          {
            type: 'quote',
            text: 'HS256 seperti satu kunci yang dipakai bersama. Semua pihak yang perlu memeriksa keaslian surat harus memegang kunci yang sama — dan siapa pun yang memegangnya juga bisa membuat surat palsu.\n\nRS256 + JWKS seperti tanda tangan dan contoh tanda tangan. Hanya saya yang bisa menandatangani. Semua orang boleh memegang contohnya untuk mencocokkan, dan tak seorang pun bisa memalsukannya hanya dari contoh itu.'
          },
          {
            type: 'quote',
            text: `Ditambah satu hal: kunci-kunci itu berotasi. Kalau satu kunci bocor, jendela kerugiannya sempit, bukan selamanya.\n\nSoal pilihan algoritma, saya menulisnya apa adanya:\n\nPerbandingan yang benar-benar saya lakukan saat itu adalah HS256 versus RS256. Saya memilih RS256 karena memisahkan kewenangan menandatangani dari kewenangan memverifikasi — pihak yang memeriksa token tidak perlu memegang kunci yang bisa membuat token.\n\nES256 baru saya ketahui belakangan. Kalau proyek ini saya mulai hari ini, ES256 akan masuk daftar pertimbangan karena ukuran tanda tangannya lebih ringkas pada tingkat keamanan setara.`
          }
        ]
      },
      {
        heading: 'Key Features',
        blocks: [
          {
            type: 'p',
            text: 'Menurut artikel yang terbit, pengujian mencakup sepuluh skenario serangan kritis, termasuk kebingungan algoritma dan penyuntikan kunci. Sistem yang diuji menerapkan:'
          },
          {
            type: 'list',
            items: [
              'Rotasi kunci JWKS dinamis',
              'Distribusi kunci publik sesuai RFC 7517',
              'Penyimpanan kunci privat terenkripsi',
              'Pembatasan algoritma secara eksplisit',
              'Identifikasi kunci berbasis UUID',
              'Pencatatan menyeluruh'
            ]
          },
          {
            type: 'p',
            text: 'Hasilnya: sistem bertahan terhadap seluruh skenario yang diuji, dengan dampak performa minimal — dan bagian terakhir ini penting, karena keamanan yang membuat aplikasi lambat akan dimatikan orang.'
          }
        ]
      },
      {
        heading: 'Challenge — Yang tidak ada di jurnal',
        blocks: [
          {
            type: 'p',
            text: `Artikel itu menceritakan bagian yang berhasil. Bagian ini menceritakan yang tidak.\n\nSistemnya berhasil. Kodenya tidak.\n\nRiset saya lolos sidang dan terbit di jurnal terakreditasi. Tapi basis kodenya tumbuh cepat, dari lebih dari satu tangan, tanpa peninjauan kode, tanpa perlindungan branch, tanpa pemeriksaan otomatis, dan tanpa kesepakatan arsitektur tertulis.\n\nAkibatnya bisa diduga: peringatan menumpuk sampai ratusan, dan satu berkas antarmuka membengkak hingga hampir empat ribu baris. Di sebelahnya tersimpan salinan cadangan berkas itu, lebih besar lagi — pengakuan yang tidak saya sadari sedang saya tulis: saya sudah tidak percaya pada kode saya sendiri sampai harus menyalinnya sebelum berani mengubah apa pun.\n\nSaya sempat menyalahkan keadaan. Belakangan saya sadar diagnosis itu tidak menyelesaikan apa pun. Sebagai orang yang memulai proyek ini, sayalah yang seharusnya memasang pagar pengamannya sejak awal. Tidak ada peninjauan kode karena tidak ada yang mensyaratkannya. Tidak ada standar arsitektur karena tidak ada yang menuliskannya.\n\nAda dua pilihan waktu itu: terus menambal, atau berhenti dan mengakui fondasinya salah sejak awal. Saya memilih berhenti dan menulis ulang dari nol.\n\nKeputusan itu mahal, dan saya yakin itu benar. Menulis kode yang berfungsi bisa dipelajari siapa saja. Mengenali kapan kode yang berfungsi tetap harus dibuang adalah keterampilan yang berbeda, dan jauh lebih sulit.\n\nPelajaran yang saya bawa: kualitas kode bukan hasil dari orang yang disiplin, melainkan hasil dari sistem yang membuat ketidakdisiplinan sulit dilakukan.\n\nDan ada ironi yang tidak bisa saya hindari: beberapa bulan kemudian saya merancang kurikulum yang mengajarkan peninjauan sejawat kepada murid kelas 5 — praktik yang absennya justru menghancurkan proyek saya sendiri.`
          }
        ]
      },
      {
        heading: 'Impact',
        blocks: [
          {
            type: 'table',
            rows: [
              ['Model autentikasi', 'Sebelum: Kunci rahasia bersama, satu titik kegagalan · Sesudah: Kunci asimetris berotasi, kunci privat terenkripsi'],
              ['Ketahanan serangan', 'Sebelum: Belum teruji · Sesudah: Diuji terhadap 10 skenario terdokumentasi, bertahan seluruhnya'],
              ['Status pengetahuan', 'Sebelum: Anggapan pribadi · Sesudah: Terbit dan dapat dikutip publik'],
              ['Kondisi basis kode', 'Sebelum: Utang teknis menumpuk, satu berkas ~4.000 baris · Sesudah: Diakui tidak layak, ditulis ulang dari nol'],
              ['Proses pengembangan', 'Sebelum: Tanpa review, tanpa pagar · Sesudah: Pelajaran yang kini saya terapkan sejak commit pertama']
            ]
          },
          {type: 'p', text: 'Dampak terkuatnya bukan angka:'},
          {
            type: 'quote',
            text: 'Riset ini melewati peer review dan terbit di JUTIF Vol 7 No 2 (2026), hal. 1834–1852 — jurnal terakreditasi SINTA 2. DOI `10.52436/1.jutif.2026.7.2.5662`. Siapa pun bisa membacanya, mengutipnya, atau membantahnya. Ini bukan klaim tentang keahlian saya; ini catatan permanen yang dapat diverifikasi siapa saja, kapan saja.'
          }
        ]
      },
      {
        heading: 'Tech Choices',
        blocks: [
          {
            type: 'table',
            rows: [
              ['RS256 (bukan HS256)', 'Memisahkan kewenangan menandatangani dari memverifikasi'],
              ['JWKS / RFC 7517', 'Standar terbuka, bukan buatan sendiri. Rotasi kunci mungkin tanpa mengubah kode klien'],
              ['Pembatasan algoritma eksplisit', 'Menutup keluarga serangan kebingungan algoritma di akarnya'],
              ['kid berbasis UUID', 'Mencegah penyuntikan kid yang menebak lokasi kunci'],
              ['Kunci privat terenkripsi saat disimpan', 'Bocornya berkas tidak otomatis berarti bocornya kunci'],
              ['Pencatatan menyeluruh', 'Serangan yang tidak tercatat adalah serangan yang tidak pernah kamu ketahui']
            ]
          },
          {type: 'p', text: 'Satu trade-off yang saya kalah:'},
          {
            type: 'quote',
            text: 'Demi pencarian wilayah yang cepat, saya menyertakan data wilayah Indonesia langsung di dalam aplikasi. Kecepatannya tercapai — tapi ukuran aplikasi ikut membengkak sampai batas yang menurut saya sendiri tidak masuk akal untuk sebuah aplikasi kurir. Saya menang di kecepatan dan kalah di ukuran. Hari ini saya akan memilih berbeda: memuat data sesuai kebutuhan, bukan memaketkan semuanya di muka.'
          }
        ]
      },
      {
        heading: 'Screenshot — Placeholder',
        blocks: [
          {
            type: 'table',
            rows: [
              ['1 · Sampul artikel jurnal', 'JUTIF Vol 7 No 2 (2026), terakreditasi SINTA 2'],
              ['2 · Diagram alur JWKS buatanmu sendiri', 'Karyamu, bukan aset perusahaan — aman sepenuhnya'],
              ['3 · Bagan HS256 vs RS256', 'Menjelaskan hal rumit secara sederhana'],
              ['4 · Tautan DOI', 'Bukti yang bisa diklik siapa pun']
            ]
          }
        ]
      }
    ]
  },
  en: {
    slug: 'city-courier',
    title: 'City Courier',
    tagline: 'I attacked my own authentication system ten times, then published what I found.',
    year: 2026,
    stack: ['Flutter', 'Laravel', 'JWKS', 'RS256'],
    featured: true,
    thumbnail: {
      src: '/karya/city-courier.webp',
      alt: 'Authentication diagram for the City Courier application'
    },
    sections: [
      {
        heading: 'Problem',
        blocks: [
          {
            type: 'p',
            text: `JWT tutorials often stop at a shared HS256 secret and call authentication complete. That works until token verification is confronted with known attacks: unsigned \`alg: none\` tokens, algorithm confusion, or a manipulated \`kid\` that points verification at an attacker's key.\n\nThe vulnerabilities were already documented. What I could not find clearly demonstrated in Indonesian material was whether the recommended defence would survive when someone actively tried to break it. "Use RS256" is advice; I wanted evidence.`
          }
        ]
      },
      {
        heading: 'User',
        blocks: [
          {
            type: 'p',
            text: `The immediate users were senders, couriers, and administrators whose sessions depended on the mechanism. Good authentication should remain invisible to them. The broader audience was other developers asking the same security question, which is why I published the result instead of keeping it as an internal claim.`
          }
        ]
      },
      {
        heading: 'Solution',
        blocks: [
          {
            type: 'p',
            text: 'The system replaced one shared secret with asymmetric RS256 signatures, distributed public keys through an RFC 7517 JWKS endpoint, and rotated those keys to limit the useful lifetime of a compromise.'
          },
          {
            type: 'quote',
            text: 'HS256 resembles sharing the same physical key with everyone who verifies a letter: every verifier can also forge one. RS256 plus JWKS resembles keeping the signing hand private while publishing a signature specimen. Anyone can check it, but the specimen cannot create a new signature.'
          },
          {
            type: 'quote',
            text: 'My experiment compared HS256 with RS256, and RS256 separated permission to sign from permission to verify. I learned about ES256 later; starting today, I would evaluate it too because it offers smaller signatures at a comparable security level.'
          }
        ]
      },
      {
        heading: 'Key Features',
        blocks: [
          {
            type: 'p',
            text: 'The published experiment exercised ten critical attack scenarios, including algorithm confusion and key injection. The tested system included:'
          },
          {
            type: 'list',
            items: [
              'Dynamic JWKS key rotation',
              'RFC 7517 public-key distribution',
              'Encrypted private-key storage',
              'An explicit algorithm allow-list',
              'UUID-based key identifiers',
              'Comprehensive logging'
            ]
          },
          {
            type: 'p',
            text: 'It resisted every tested scenario with minimal performance impact—an important constraint because controls that make a product unusably slow are eventually switched off.'
          }
        ]
      },
      {
        heading: 'Challenge — What the paper leaves out',
        blocks: [
          {
            type: 'p',
            text: `The security mechanism worked; the codebase did not. It grew through several hands without review, protected branches, automated checks, or a written architecture. Warnings reached the hundreds, one interface file approached four thousand lines, and a still larger backup copy sat beside it—a quiet admission that I no longer trusted my own changes.\n\nI initially blamed the circumstances. Eventually I accepted that, as the person who began the project, I should have installed its guardrails. I stopped patching and rewrote it from scratch. Working code is not necessarily maintainable code, and recognising when functioning software must be discarded was the harder lesson.\n\nCode quality is not produced by hoping everyone remains disciplined. It comes from a system that makes undisciplined changes difficult. Months later, I designed peer review into a curriculum for year-5 pupils—the very practice whose absence had damaged my own project.`
          }
        ]
      },
      {
        heading: 'Impact',
        blocks: [
          {
            type: 'table',
            rows: [
              ['Authentication model', 'Before: one shared secret · After: rotating asymmetric keys and encrypted private material'],
              ['Attack resistance', 'Before: assumed · After: all ten documented scenarios tested and resisted'],
              ['Knowledge status', 'Before: a personal belief · After: published and publicly citable'],
              ['Codebase condition', 'Before: mounting debt and a ~4,000-line file · After: rejected and rebuilt'],
              ['Development process', 'Before: no review or guardrails · After: safeguards applied from the first commit']
            ]
          },
          {type: 'p', text: 'The strongest result is not a metric:'},
          {
            type: 'quote',
            text: 'The research passed peer review and appeared in JUTIF Vol. 7 No. 2 (2026), pages 1834–1852, a SINTA 2 accredited journal. DOI: 10.52436/1.jutif.2026.7.2.5662. Anyone can read, cite, or challenge it; the evidence is public.'
          }
        ]
      },
      {
        heading: 'Tech Choices',
        blocks: [
          {
            type: 'table',
            rows: [
              ['RS256 over HS256', 'Separates signing authority from verification'],
              ['JWKS / RFC 7517', 'Uses an open standard and permits rotation without client code changes'],
              ['Explicit algorithm restriction', 'Closes algorithm-confusion attacks at the boundary'],
              ['UUID-based kid', 'Prevents identifiers from becoming guessable key locations'],
              ['Encrypted private keys at rest', 'A leaked file does not immediately expose signing capability'],
              ['Comprehensive logging', 'Makes attempted attacks observable']
            ]
          },
          {type: 'p', text: 'One trade-off went the wrong way:'},
          {
            type: 'quote',
            text: 'Bundling all Indonesian region data made location search fast but pushed the courier app to an unreasonable size. Today I would load regional data on demand instead of shipping all of it up front.'
          }
        ]
      },
      {
        heading: 'Screenshot — Placeholder',
        blocks: [
          {
            type: 'table',
            rows: [
              ['1 · Journal cover', 'JUTIF Vol. 7 No. 2 (2026), SINTA 2 accredited'],
              ['2 · Original JWKS flow diagram', 'My own publishable artifact rather than company material'],
              ['3 · HS256 versus RS256 diagram', 'A visual explanation of the threat model'],
              ['4 · DOI link', 'Publicly clickable evidence']
            ]
          }
        ]
      }
    ]
  }
};
