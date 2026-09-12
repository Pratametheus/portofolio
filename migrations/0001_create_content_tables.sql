-- migrations/0001_create_content_tables.sql

CREATE TABLE career_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('career', 'education')),
  role_id TEXT NOT NULL,
  role_en TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  organization_en TEXT NOT NULL,
  period_id TEXT NOT NULL,
  period_en TEXT NOT NULL,
  category_id TEXT NOT NULL,
  category_en TEXT NOT NULL,
  mark TEXT NOT NULL,
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  previous_snapshot TEXT,
  snapshot_at TEXT
);

CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Publikasi', 'Sertifikat')),
  category TEXT NOT NULL CHECK (category IN ('Keamanan', 'Pendidikan', 'Pengembangan')),
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  previous_snapshot TEXT,
  snapshot_at TEXT
);
