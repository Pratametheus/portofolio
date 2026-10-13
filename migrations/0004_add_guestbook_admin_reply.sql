-- migrations/0004_add_guestbook_admin_reply.sql

ALTER TABLE guestbook_entries ADD COLUMN admin_reply TEXT;
ALTER TABLE guestbook_entries ADD COLUMN replied_at TEXT;
