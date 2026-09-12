-- scripts/seed-initial-content.sql
-- One-time seed of the content that was previously hard-coded in
-- src/content/career.ts and src/content/achievements.ts. Run once per
-- database (local, then remote, then the staging database) — see Step 2.
--
-- Each INSERT is guarded by a WHERE NOT EXISTS check on a natural key so this
-- script is safe to re-run against a non-empty database.

INSERT INTO career_entries
  (kind, role_id, role_en, organization_id, organization_en, period_id, period_en,
   category_id, category_en, mark, description_id, description_en, sort_order)
SELECT
  'career',
  'Guru Informatika', 'Computing Teacher',
  'SDN Ujung XIII/38', 'SDN Ujung XIII/38',
  'Mulai April 2026', 'Since April 2026',
  'Pendidikan', 'Education',
  'SD',
  'Mengajar komputer untuk kelas 4, 5, dan 6. Menyusun materi sesuai kebutuhan dan keterbatasan sekolah, serta membangun SIAKAD Informatika untuk mendukung kegiatan mengajar.',
  'Teaching computing to grades 4, 5 and 6. Building the syllabus around the school''s real needs and constraints, and building SIAKAD Informatika to support the teaching.',
  0
WHERE NOT EXISTS (
  SELECT 1 FROM career_entries WHERE kind = 'career' AND role_id = 'Guru Informatika'
);

INSERT INTO achievements
  (title_id, title_en, issuer, year, type, category, description_id, description_en, url, sort_order)
SELECT
  'Analisis Kerentanan Keamanan Aplikasi Web Menggunakan Metode Black Box Testing',
  'Web Application Security Vulnerability Analysis Using Black Box Testing',
  'JUTIF · Vol. 7 No. 2',
  '2026',
  'Publikasi',
  'Keamanan',
  'Artikel penelitian dengan sepuluh skenario pengujian. Terbit pada halaman 1834–1852 di jurnal terakreditasi SINTA 2.',
  'A research article with ten test scenarios. Published on pages 1834–1852 in a SINTA 2 accredited journal.',
  'https://doi.org/10.52436/1.jutif.2026.7.2.5662',
  0
WHERE NOT EXISTS (
  SELECT 1 FROM achievements
  WHERE title_id = 'Analisis Kerentanan Keamanan Aplikasi Web Menggunakan Metode Black Box Testing'
);
