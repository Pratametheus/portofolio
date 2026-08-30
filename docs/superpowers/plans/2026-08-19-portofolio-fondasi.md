# Portofolio — Fondasi & Komponen Inti: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `sp-subagent-driven-development` (recommended) or `sp-executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun fondasi situs portofolio `ferryandhikapratama.com` — tooling, sistem desain, dwibahasa, lapisan konten, dan komponen inti — semuanya lewat TDD, sampai siap diisi halaman studi kasus.

**Architecture:** Next.js 16 App Router dengan rute berprefiks locale (`/id`, `/en`) lewat next-intl. Konten studi kasus disimpan sebagai modul TypeScript bertipe, bukan CMS — jumlahnya tiga dan berubah jarang, jadi basis data hanya menambah beban. Komponen presentasi menerima data lewat props supaya bisa diuji tanpa merender halaman utuh.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, next-intl, Vitest + Testing Library, Playwright

**Spec:** `docs/spec/FASE-3-Spec-Arsitektur.md`

## Global Constraints

- Node.js ≥ 20.9. Package manager: `npm`.
- Bahasa: `id` (default) dan `en`. Prefiks locale selalu tampil di URL.
- Warna HANYA dari token di `globals.css`. Dilarang menulis nilai heksadesimal langsung di komponen.
- Satu warna aksen di seluruh situs: `--color-accent` (`#4ADE80`). Tidak ada warna kuat kedua.
- Font: Inter Tight (judul), Inter (isi), JetBrains Mono (angka & istilah teknis) — semuanya gratis, dimuat lewat `next/font`.
- Setiap angka, tanggal, dan istilah teknis dirender dengan kelas `font-mono`.
- Semua animasi wajib menghormati `prefers-reduced-motion`.
- Tidak ada kode produksi tanpa test yang gagal lebih dulu (`sp-test-driven-development`).
- Commit setelah setiap task hijau. Pesan commit memakai format Conventional Commits.
- Target akhir: Lighthouse Accessibility 100, Performance ≥ 90 (mobile), JS awal < 150 KB terkompresi.

---

## File Structure

Peta berkas untuk rencana ini. Tiap berkas punya satu tanggung jawab.

| Berkas | Tanggung jawab |
|---|---|
| `src/app/[locale]/layout.tsx` | Kerangka HTML, font, provider i18n, metadata dasar |
| `src/app/[locale]/page.tsx` | Beranda (sementara: kerangka saja) |
| `src/app/globals.css` | Token desain via `@theme` Tailwind v4 |
| `src/i18n/routing.ts` | Definisi locale & routing |
| `src/i18n/request.ts` | Resolusi locale per permintaan |
| `src/i18n/navigation.ts` | `Link`, `redirect`, `usePathname`, `useRouter` sadar-locale |
| `src/middleware.ts` | Pengalihan locale |
| `messages/id.json`, `messages/en.json` | Teks antarmuka |
| `src/content/case-studies/index.ts` | Data tiga studi kasus, bertipe |
| `src/content/types.ts` | Tipe `CaseStudy` |
| `src/lib/content.ts` | `getCaseStudy`, `getAllCaseStudies` |
| `src/lib/jsonld.ts` | Pembangun skema Person / Article / ScholarlyArticle |
| `src/components/case-study-card.tsx` | Kartu studi kasus |
| `src/components/locale-switcher.tsx` | Pengalih bahasa |
| `tests/` | Test Vitest |
| `e2e/` | Test Playwright |

**Keputusan dekomposisi:** `lib/content.ts` dan `lib/jsonld.ts` dipisah dari komponen supaya keduanya bisa diuji sebagai fungsi murni — tanpa DOM, tanpa render. Ini yang membuat sebagian besar test di rencana ini cepat.

---

### Task 1: Kerangka proyek & tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `vitest.setup.ts`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Consumes: —
- Produces: perintah `npm test` (Vitest) dan `npm run dev` yang berfungsi

- [ ] **Step 1: Buat proyek Next.js**

```bash
cd D:/Project/Portofolio
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint --use-npm
```

Jawab `Yes` bila ditanya soal Turbopack. Jangan menimpa folder `.claude/` yang sudah ada.

- [ ] **Step 2: Pasang perkakas test**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Konfigurasi Vitest**

Buat `vitest.config.ts`:

```ts
import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    globals: true
  },
  resolve: {
    alias: {'@': path.resolve(__dirname, './src')}
  }
});
```

Buat `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Tambahkan skrip di `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Tulis test smoke yang gagal**

Buat `tests/smoke.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {siteName} from '@/lib/site';

describe('konfigurasi situs', () => {
  it('mengekspos nama situs', () => {
    expect(siteName).toBe('Ferry Andhika Pratama');
  });
});
```

- [ ] **Step 5: Jalankan test, pastikan GAGAL**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "@/lib/site"`

- [ ] **Step 6: Implementasi minimal**

Buat `src/lib/site.ts`:

```ts
export const siteName = 'Ferry Andhika Pratama';
export const siteUrl = 'https://ferryandhikapratama.com';
```

- [ ] **Step 7: Jalankan test, pastikan LULUS**

Run: `npm test`
Expected: PASS, 1 test

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with Vitest"
```

---

### Task 2: Token desain

**Files:**
- Modify: `src/app/globals.css`
- Create: `tests/tokens.test.ts`

**Interfaces:**
- Consumes: —
- Produces: variabel CSS `--color-bg`, `--color-surface`, `--color-border`, `--color-fg`, `--color-fg-muted`, `--color-accent`

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/tokens.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf8');

describe('token desain', () => {
  it.each([
    ['--color-bg', '#0A0A0B'],
    ['--color-surface', '#131316'],
    ['--color-border', '#26262B'],
    ['--color-fg', '#EDEDEF'],
    ['--color-fg-muted', '#9B9BA3'],
    ['--color-accent', '#4ADE80']
  ])('mendefinisikan %s sebagai %s', (token, value) => {
    expect(css).toContain(`${token}: ${value}`);
  });

  it('hanya punya satu warna aksen', () => {
    const accents = css.match(/--color-accent[a-z-]*:/g) ?? [];
    expect(accents).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test tests/tokens.test.ts`
Expected: FAIL — token belum ada di `globals.css`

- [ ] **Step 3: Tulis token**

Ganti isi `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0A0A0B;
  --color-surface: #131316;
  --color-border: #26262B;
  --color-fg: #EDEDEF;
  --color-fg-muted: #9B9BA3;
  --color-accent: #4ADE80;

  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-display: var(--font-inter-tight), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

body {
  background-color: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

Run: `npm test tests/tokens.test.ts`
Expected: PASS, 7 test

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tests/tokens.test.ts
git commit -m "feat: add design tokens with single accent constraint"
```

---

### Task 3: Routing dwibahasa

**Files:**
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`, `src/middleware.ts`
- Create: `messages/id.json`, `messages/en.json`
- Create: `tests/routing.test.ts`

**Interfaces:**
- Consumes: —
- Produces: `routing` (objek dengan `locales: ['id','en']`, `defaultLocale: 'id'`), dan `Link`, `redirect`, `usePathname`, `useRouter` dari `@/i18n/navigation`

- [ ] **Step 1: Pasang next-intl**

```bash
npm install next-intl
```

- [ ] **Step 2: Tulis test yang gagal**

Buat `tests/routing.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {routing} from '@/i18n/routing';

describe('routing locale', () => {
  it('mendukung bahasa Indonesia dan Inggris', () => {
    expect(routing.locales).toEqual(['id', 'en']);
  });

  it('memakai bahasa Indonesia sebagai bawaan', () => {
    expect(routing.defaultLocale).toBe('id');
  });
});
```

- [ ] **Step 3: Jalankan test, pastikan GAGAL**

Run: `npm test tests/routing.test.ts`
Expected: FAIL — `Failed to resolve import "@/i18n/routing"`

- [ ] **Step 4: Implementasi**

Buat `src/i18n/routing.ts`:

```ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['id', 'en'],
  defaultLocale: 'id'
});
```

Buat `src/i18n/navigation.ts`:

```ts
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
```

Buat `src/i18n/request.ts`:

```ts
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

Buat `src/middleware.ts`:

```ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)'
};
```

Buat `messages/id.json`:

```json
{
  "nav": {
    "home": "Beranda",
    "work": "Karya",
    "about": "Tentang",
    "guestbook": "Buku Tamu"
  },
  "home": {
    "tagline": "Saya membangun perangkat lunak untuk pekerjaan yang saya jalani sendiri."
  }
}
```

Buat `messages/en.json`:

```json
{
  "nav": {
    "home": "Home",
    "work": "Work",
    "about": "About",
    "guestbook": "Guestbook"
  },
  "home": {
    "tagline": "I build software for the work I actually do myself."
  }
}
```

Tambahkan plugin di `next.config.ts`:

```ts
import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {};

export default createNextIntlPlugin()(nextConfig);
```

- [ ] **Step 5: Jalankan test, pastikan LULUS**

Run: `npm test tests/routing.test.ts`
Expected: PASS, 2 test

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add bilingual routing with next-intl"
```

---

### Task 4: Test kelengkapan terjemahan

Test ini yang mencegah teks kosong diam-diam muncul di versi Inggris. Tanpa ini, kekurangan terjemahan baru ketahuan saat sudah live.

**Files:**
- Create: `tests/messages.test.ts`

**Interfaces:**
- Consumes: `messages/id.json`, `messages/en.json`
- Produces: —

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/messages.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import id from '../messages/id.json';
import en from '../messages/en.json';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? flattenKeys(value as Record<string, unknown>, full)
      : [full];
  });
}

describe('kelengkapan terjemahan', () => {
  const idKeys = flattenKeys(id).sort();
  const enKeys = flattenKeys(en).sort();

  it('setiap kunci Indonesia ada di berkas Inggris', () => {
    expect(enKeys.filter((k) => !idKeys.includes(k))).toEqual([]);
    expect(idKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
  });

  it('tidak ada nilai kosong', () => {
    const empty = [...flattenKeys(id), ...flattenKeys(en)].filter((path) => {
      const source: Record<string, unknown> = path in id ? id : en;
      return false; // diganti di Step 3
    });
    expect(empty).toEqual([]);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan test kedua salah bentuk**

Run: `npm test tests/messages.test.ts`
Expected: Test pertama PASS, test kedua lulus secara palsu (selalu `[]`). Ini sengaja — kita perbaiki di langkah berikutnya, karena test yang selalu hijau tidak membuktikan apa pun.

- [ ] **Step 3: Perbaiki test kedua supaya benar-benar menguji**

Ganti test kedua di `tests/messages.test.ts`:

```ts
  function flattenEntries(
    obj: Record<string, unknown>,
    prefix = ''
  ): Array<[string, unknown]> {
    return Object.entries(obj).flatMap(([key, value]) => {
      const full = prefix ? `${prefix}.${key}` : key;
      return typeof value === 'object' && value !== null
        ? flattenEntries(value as Record<string, unknown>, full)
        : ([[full, value]] as Array<[string, unknown]>);
    });
  }

  it('tidak ada nilai kosong', () => {
    const empty = [...flattenEntries(id), ...flattenEntries(en)]
      .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
      .map(([path]) => path);
    expect(empty).toEqual([]);
  });
```

- [ ] **Step 4: Buktikan test bisa gagal**

Tambahkan sementara `"kosong": ""` ke `messages/en.json`, jalankan `npm test tests/messages.test.ts`.
Expected: FAIL, menyebut `kosong` di dua test (kunci tidak cocok + nilai kosong).
Lalu hapus baris itu dan jalankan ulang.
Expected: PASS, 2 test.

- [ ] **Step 5: Commit**

```bash
git add tests/messages.test.ts
git commit -m "test: enforce translation key parity and non-empty values"
```

---

### Task 5: Lapisan konten

**Files:**
- Create: `src/content/types.ts`, `src/content/case-studies/index.ts`, `src/lib/content.ts`
- Create: `tests/content.test.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `type CaseStudy` dengan medan: `slug`, `title`, `tagline`, `year`, `stack: string[]`, `featured: boolean`
  - `getAllCaseStudies(locale: 'id' | 'en'): CaseStudy[]`
  - `getCaseStudy(slug: string, locale: 'id' | 'en'): CaseStudy` — melempar `Error` untuk slug tak dikenal

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/content.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {getAllCaseStudies, getCaseStudy} from '@/lib/content';

describe('getAllCaseStudies', () => {
  it('mengembalikan tiga studi kasus', () => {
    expect(getAllCaseStudies('id')).toHaveLength(3);
  });

  it('mengembalikan judul berbahasa Indonesia untuk locale id', () => {
    const jurnalguru = getAllCaseStudies('id').find((c) => c.slug === 'jurnalguru');
    expect(jurnalguru?.tagline).toContain('Saya mengajar');
  });

  it('mengembalikan judul berbahasa Inggris untuk locale en', () => {
    const jurnalguru = getAllCaseStudies('en').find((c) => c.slug === 'jurnalguru');
    expect(jurnalguru?.tagline).toContain('I teach');
  });
});

describe('getCaseStudy', () => {
  it('mengembalikan studi kasus berdasarkan slug', () => {
    expect(getCaseStudy('city-courier', 'id').slug).toBe('city-courier');
  });

  it('melempar galat untuk slug tak dikenal', () => {
    expect(() => getCaseStudy('tidak-ada', 'id')).toThrow('Studi kasus tidak ditemukan: tidak-ada');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test tests/content.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/content"`

- [ ] **Step 3: Implementasi**

Buat `src/content/types.ts`:

```ts
export type Locale = 'id' | 'en';

export type CaseStudy = {
  slug: string;
  title: string;
  tagline: string;
  year: number;
  stack: string[];
  featured: boolean;
};
```

Buat `src/content/case-studies/index.ts`:

```ts
import type {CaseStudy, Locale} from '../types';

export const caseStudies: Record<Locale, CaseStudy[]> = {
  id: [
    {
      slug: 'jurnalguru',
      title: 'JurnalGuru',
      tagline: 'Saya mengajar komputer di sekolah dasar. Alat kerjanya saya bangun sendiri.',
      year: 2026,
      stack: ['Next.js', 'React', 'Supabase', 'Tailwind CSS', 'TypeScript'],
      featured: true
    },
    {
      slug: 'city-courier',
      title: 'City Courier',
      tagline: 'Saya menyerang sistem autentikasi saya sendiri sepuluh kali, lalu menerbitkan hasilnya.',
      year: 2026,
      stack: ['Flutter', 'Laravel', 'JWKS', 'RS256'],
      featured: true
    },
    {
      slug: 'mochitoon',
      title: 'MochiToon',
      tagline: 'Saya membangun alat produksinya, dan saya juga yang menulis ceritanya.',
      year: 2026,
      stack: ['React', 'Vite', 'Supabase', 'Tiptap', 'GSAP'],
      featured: false
    }
  ],
  en: [
    {
      slug: 'jurnalguru',
      title: 'JurnalGuru',
      tagline: 'I teach computing at a primary school. I built the tool I use to do it.',
      year: 2026,
      stack: ['Next.js', 'React', 'Supabase', 'Tailwind CSS', 'TypeScript'],
      featured: true
    },
    {
      slug: 'city-courier',
      title: 'City Courier',
      tagline: 'I attacked my own authentication system ten times, then published what I found.',
      year: 2026,
      stack: ['Flutter', 'Laravel', 'JWKS', 'RS256'],
      featured: true
    },
    {
      slug: 'mochitoon',
      title: 'MochiToon',
      tagline: 'I built the production tool, and I write the story it manages.',
      year: 2026,
      stack: ['React', 'Vite', 'Supabase', 'Tiptap', 'GSAP'],
      featured: false
    }
  ]
};
```

Buat `src/lib/content.ts`:

```ts
import {caseStudies} from '@/content/case-studies';
import type {CaseStudy, Locale} from '@/content/types';

export function getAllCaseStudies(locale: Locale): CaseStudy[] {
  return caseStudies[locale];
}

export function getCaseStudy(slug: string, locale: Locale): CaseStudy {
  const found = caseStudies[locale].find((c) => c.slug === slug);
  if (!found) {
    throw new Error(`Studi kasus tidak ditemukan: ${slug}`);
  }
  return found;
}
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

Run: `npm test tests/content.test.ts`
Expected: PASS, 5 test

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add typed case study content layer"
```

---

### Task 6: Pembangun JSON-LD

**Files:**
- Create: `src/lib/jsonld.ts`
- Create: `tests/jsonld.test.ts`

**Interfaces:**
- Consumes: `siteUrl`, `siteName` dari `@/lib/site`
- Produces: `buildPersonSchema()`, `buildScholarlyArticleSchema()` — keduanya mengembalikan objek dengan `@context` dan `@type`

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/jsonld.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {buildPersonSchema, buildScholarlyArticleSchema} from '@/lib/jsonld';

describe('buildPersonSchema', () => {
  const schema = buildPersonSchema();

  it('memakai konteks schema.org', () => {
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Person');
  });

  it('memuat nama dan URL situs', () => {
    expect(schema.name).toBe('Ferry Andhika Pratama');
    expect(schema.url).toBe('https://ferryandhikapratama.com');
  });
});

describe('buildScholarlyArticleSchema', () => {
  const schema = buildScholarlyArticleSchema();

  it('bertipe ScholarlyArticle', () => {
    expect(schema['@type']).toBe('ScholarlyArticle');
  });

  it('memuat DOI sebagai identifier', () => {
    expect(schema.identifier).toBe('10.52436/1.jutif.2026.7.2.5662');
  });

  it('menyebut Ferry sebagai penulis pertama', () => {
    expect(schema.author[0].name).toBe('Ferry Andhika Pratama');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test tests/jsonld.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/jsonld"`

- [ ] **Step 3: Implementasi**

Buat `src/lib/jsonld.ts`:

```ts
import {siteName, siteUrl} from './site';

export function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person' as const,
    name: siteName,
    url: siteUrl,
    jobTitle: 'Software Engineer',
    alumniOf: {'@type': 'CollegeOrUniversity', name: 'Universitas 17 Agustus 1945 Surabaya'},
    sameAs: ['https://github.com/Pratametheus']
  };
}

export function buildScholarlyArticleSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle' as const,
    headline:
      'Security Assessment of JWKS-Based Authentication: Mitigating JWT Attack Vectors Through Penetration Testing',
    identifier: '10.52436/1.jutif.2026.7.2.5662',
    url: 'https://doi.org/10.52436/1.jutif.2026.7.2.5662',
    datePublished: '2026-04-18',
    author: [
      {'@type': 'Person', name: 'Ferry Andhika Pratama'},
      {'@type': 'Person', name: 'Agus Hermanto'},
      {'@type': 'Person', name: 'Geri Kusnanto'}
    ],
    isPartOf: {'@type': 'Periodical', name: 'Jurnal Teknik Informatika (JUTIF)'},
    pagination: '1834-1852'
  };
}
```

> ⚠️ **Verifikasi sebelum commit:** nama universitas di `alumniOf` adalah dugaanku dari nama pembimbingmu. **Ferry harus mengoreksinya kalau salah** — data pendidikan yang keliru di JSON-LD akan terbaca mesin dan sulit diperbaiki setelah terindeks.

- [ ] **Step 4: Jalankan test, pastikan LULUS**

Run: `npm test tests/jsonld.test.ts`
Expected: PASS, 5 test

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add JSON-LD schema builders including ScholarlyArticle"
```

---

### Task 7: Komponen CaseStudyCard

**Files:**
- Create: `src/components/case-study-card.tsx`
- Create: `tests/case-study-card.test.tsx`

**Interfaces:**
- Consumes: `CaseStudy` dari `@/content/types`
- Produces: `<CaseStudyCard caseStudy={...} locale="id" />`

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/case-study-card.test.tsx`:

```tsx
import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CaseStudyCard} from '@/components/case-study-card';
import type {CaseStudy} from '@/content/types';

const sample: CaseStudy = {
  slug: 'jurnalguru',
  title: 'JurnalGuru',
  tagline: 'Alat kerja yang saya bangun sendiri.',
  year: 2026,
  stack: ['Next.js', 'Supabase'],
  featured: true
};

describe('CaseStudyCard', () => {
  it('menampilkan judul dan tagline', () => {
    render(<CaseStudyCard caseStudy={sample} locale="id" />);
    expect(screen.getByRole('heading', {name: 'JurnalGuru'})).toBeInTheDocument();
    expect(screen.getByText('Alat kerja yang saya bangun sendiri.')).toBeInTheDocument();
  });

  it('menampilkan setiap teknologi', () => {
    render(<CaseStudyCard caseStudy={sample} locale="id" />);
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Supabase')).toBeInTheDocument();
  });

  it('menautkan ke halaman studi kasus dengan prefiks locale', () => {
    render(<CaseStudyCard caseStudy={sample} locale="id" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/id/work/jurnalguru');
  });

  it('merender tahun dengan font monospace', () => {
    render(<CaseStudyCard caseStudy={sample} locale="id" />);
    expect(screen.getByText('2026')).toHaveClass('font-mono');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test tests/case-study-card.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/case-study-card"`

- [ ] **Step 3: Implementasi minimal**

Buat `src/components/case-study-card.tsx`:

```tsx
import type {CaseStudy, Locale} from '@/content/types';

type Props = {
  caseStudy: CaseStudy;
  locale: Locale;
};

export function CaseStudyCard({caseStudy, locale}: Props) {
  return (
    <a
      href={`/${locale}/work/${caseStudy.slug}`}
      className="block rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent"
    >
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl text-fg">{caseStudy.title}</h3>
        <span className="font-mono text-sm text-fg-muted">{caseStudy.year}</span>
      </div>
      <p className="mb-4 text-fg-muted">{caseStudy.tagline}</p>
      <ul className="flex flex-wrap gap-2">
        {caseStudy.stack.map((tech) => (
          <li key={tech} className="font-mono text-xs text-fg-muted">
            {tech}
          </li>
        ))}
      </ul>
    </a>
  );
}
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

Run: `npm test tests/case-study-card.test.tsx`
Expected: PASS, 4 test

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add CaseStudyCard component"
```

---

### Task 8: Layout locale & beranda kerangka

**Files:**
- Create: `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`
- Delete: `src/app/page.tsx`, `src/app/layout.tsx` (bawaan create-next-app)

**Interfaces:**
- Consumes: `routing`, `getAllCaseStudies`, `CaseStudyCard`
- Produces: halaman `/id` dan `/en` yang bisa dibuka

- [ ] **Step 1: Pasang font**

Buat `src/app/fonts.ts`:

```ts
import {Inter, Inter_Tight, JetBrains_Mono} from 'next/font/google';

export const inter = Inter({subsets: ['latin'], variable: '--font-inter'});
export const interTight = Inter_Tight({subsets: ['latin'], variable: '--font-inter-tight'});
export const jetbrainsMono = JetBrains_Mono({subsets: ['latin'], variable: '--font-jetbrains-mono'});
```

- [ ] **Step 2: Tulis layout**

Buat `src/app/[locale]/layout.tsx`:

```tsx
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {inter, interTight, jetbrainsMono} from '../fonts';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Buat `src/app/[locale]/page.tsx`:

```tsx
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {getAllCaseStudies} from '@/lib/content';
import {CaseStudyCard} from '@/components/case-study-card';
import type {Locale} from '@/content/types';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const caseStudies = getAllCaseStudies(locale as Locale);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-display text-4xl text-fg">Ferry Andhika Pratama</h1>
      <p className="mt-4 text-lg text-fg-muted">{t('tagline')}</p>

      <section className="mt-16 grid gap-4">
        {caseStudies.map((caseStudy) => (
          <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} locale={locale as Locale} />
        ))}
      </section>
    </main>
  );
}
```

Hapus berkas bawaan:

```bash
rm src/app/page.tsx src/app/layout.tsx
```

- [ ] **Step 3: Jalankan dev server dan periksa**

Run: `npm run dev`
Buka `http://localhost:3000` → harus dialihkan ke `/id`
Buka `http://localhost:3000/en` → tagline berbahasa Inggris

- [ ] **Step 4: Pastikan seluruh test masih hijau**

Run: `npm test`
Expected: PASS, semua test

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add locale layout and homepage skeleton"
```

---

### Task 9: E2E smoke test

**Files:**
- Create: `playwright.config.ts`, `e2e/home.spec.ts`

**Interfaces:**
- Consumes: aplikasi yang berjalan di `http://localhost:3000`
- Produces: perintah `npm run test:e2e`

- [ ] **Step 1: Pasang Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Konfigurasi**

Buat `playwright.config.ts`:

```ts
import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {baseURL: 'http://localhost:3000'},
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'mobile', use: {...devices['Pixel 5']}}
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true
  }
});
```

Tambahkan skrip: `"test:e2e": "playwright test"`

- [ ] **Step 3: Tulis test yang gagal**

Buat `e2e/home.spec.ts`:

```ts
import {expect, test} from '@playwright/test';

test('akar dialihkan ke bahasa Indonesia', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/id$/);
});

test('judul utama terlihat', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Ferry Andhika Pratama');
});

test('halaman Inggris menampilkan tagline Inggris', async ({page}) => {
  await page.goto('/en');
  await expect(page.getByText('I build software')).toBeVisible();
});

test('ketiga studi kasus tampil di beranda', async ({page}) => {
  await page.goto('/id');
  await expect(page.getByRole('link')).toHaveCount(3);
});

test('navigasi keyboard menjangkau kartu pertama', async ({page}) => {
  await page.goto('/id');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link').first()).toBeFocused();
});
```

- [ ] **Step 4: Jalankan dan perbaiki sampai hijau**

Run: `npm run test:e2e`
Expected: 5 test × 2 peramban = 10 lulus.
Kalau ada yang gagal, **perbaiki kodenya, jangan perbaiki test-nya.**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add end-to-end smoke tests for homepage and locales"
```

---

### Task 10: Integrasi berkelanjutan

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Tulis workflow**

Buat `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm test
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

- [ ] **Step 2: Dorong dan pastikan hijau**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: run type check, unit tests, and e2e on every push"
git push
```

Periksa tab Actions di GitHub sampai centang hijau.

> Ini adalah pagar pengaman yang tidak dimiliki City Courier. Dipasang di task pertama, bukan setelah masalah muncul.

---

## Self-Review

**1. Cakupan spek.** Spek Fase 3 mencakup: token desain (Task 2 ✓), dwibahasa (Task 3–4 ✓), lapisan konten (Task 5 ✓), JSON-LD (Task 6 ✓, `Article` menyusul di rencana halaman studi kasus), komponen (Task 7 ✓), TDD (di seluruh task ✓), Playwright (Task 9 ✓). **Belum tercakup di rencana ini** — dan memang sengaja, karena akan jadi rencana terpisah: halaman studi kasus, hero 3D, versi Inggris penuh, audit aksesibilitas & performa, deploy Cloudflare.

**2. Pemindaian placeholder.** Tidak ada "TBD" atau "tangani galat secukupnya". Setiap langkah kode punya blok kode nyata. Satu hal yang ditandai butuh verifikasi manusia: nama universitas di Task 6 — dan itu ditandai eksplisit, bukan disembunyikan.

**3. Konsistensi tipe.** `Locale` didefinisikan sekali di `src/content/types.ts` dan dipakai konsisten di Task 5, 7, 8. `CaseStudy` punya medan yang sama di test dan implementasi. `getCaseStudy` melempar pesan galat yang persis sama dengan yang diuji.

---

## Execution Handoff

Rencana ini tersimpan di `docs/superpowers/plans/2026-08-19-portofolio-fondasi.md`. Dua pilihan eksekusi:

**1. Subagent-Driven (rekomendasi)** — satu subagent segar per task, ditinjau di antara task, iterasi cepat.

**2. Inline Execution** — task dieksekusi berurutan di sesi ini dengan checkpoint untuk ditinjau.

Mana yang kamu pilih?
