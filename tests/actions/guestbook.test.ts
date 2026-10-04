/**
 * @vitest-environment node
 */
import {describe, expect, it, vi, beforeAll, afterAll, beforeEach} from 'vitest';
import {
  submitGuestbookEntryAction,
  toggleGuestbookApprovalAction,
  softDeleteGuestbookAction
} from '@/lib/actions/guestbook';
import {validateGuestbookInput} from '@/lib/guestbook-validation';
import {
  restoreGuestbookFromTrashAction,
  permanentlyDeleteGuestbookAction
} from '@/lib/actions/trash';
import {createTestDb, resetTestDb} from '../helpers/d1';
import {
  listAdminGuestbookEntries,
  listPublicGuestbookEntries,
  listTrashedGuestbookEntries,
  createGuestbookEntry
} from '@/lib/repositories/guestbook';

let testDb: D1Database;
let disposeProxy: () => Promise<void>;

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}));

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(async () => ({
    env: {DB: testDb}
  }))
}));

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

describe('guestbook actions', () => {
  beforeAll(async () => {
    ({db: testDb, dispose: disposeProxy} = await createTestDb());
  });

  afterAll(async () => {
    await disposeProxy();
  });

  beforeEach(async () => {
    await resetTestDb(testDb);
  });

  describe('validateGuestbookInput', () => {
    it('detects honeypot for bots', () => {
      const form = fd({
        name: 'Bot',
        message: 'Spam text here',
        company_url_hp: 'http://spam.com'
      });
      const result = validateGuestbookInput(form);
      expect(result.isHoneypot).toBe(true);
    });

    it('validates required name and message', () => {
      const form = fd({name: '', message: 'ab'});
      const result = validateGuestbookInput(form);
      expect(result.fieldErrors?.name).toBeDefined();
      expect(result.fieldErrors?.message).toBeDefined();
    });

    it('rejects invalid website url', () => {
      const form = fd({
        name: 'Rin',
        message: 'Halo Ferry!',
        website: 'ftp://invalidscheme.com'
      });
      const result = validateGuestbookInput(form);
      expect(result.fieldErrors?.website).toBeDefined();
    });

    it('accepts valid input with optional website', () => {
      const form = fd({
        name: 'Rin',
        message: 'Keren banget website portofolionya!',
        website: 'https://example.com'
      });
      const result = validateGuestbookInput(form);
      expect(result.fieldErrors).toBeUndefined();
      expect(result.data).toEqual({
        name: 'Rin',
        message: 'Keren banget website portofolionya!',
        website: 'https://example.com'
      });
    });
  });

  describe('submitGuestbookEntryAction', () => {
    it('silently ignores honeypot submissions without saving to DB', async () => {
      const form = fd({
        name: 'Spam Bot',
        message: 'Buy sunglasses',
        company_url_hp: 'http://spammer.com'
      });

      const res = await submitGuestbookEntryAction({}, form);
      expect(res.success).toBe(true);

      const entries = await listAdminGuestbookEntries(testDb);
      expect(entries).toHaveLength(0);
    });

    it('saves valid entry to D1 database', async () => {
      const form = fd({
        name: 'Budi',
        message: 'Semangat terus mengajar dan berkarya!',
        website: 'https://budi.dev'
      });

      const res = await submitGuestbookEntryAction({}, form);
      expect(res.success).toBe(true);

      const entries = await listPublicGuestbookEntries(testDb);
      expect(entries).toHaveLength(1);
      expect(entries[0].name).toBe('Budi');
      expect(entries[0].message).toBe('Semangat terus mengajar dan berkarya!');
      expect(entries[0].website).toBe('https://budi.dev');
    });
  });

  describe('admin actions', () => {
    it('toggles guestbook approval', async () => {
      await createGuestbookEntry(testDb, {
        name: 'User 1',
        message: 'Komentar pertama',
        isApproved: true
      });

      const [entry] = await listAdminGuestbookEntries(testDb);
      expect(entry.isApproved).toBe(true);

      await toggleGuestbookApprovalAction(entry.id, true);

      const [updated] = await listAdminGuestbookEntries(testDb);
      expect(updated.isApproved).toBe(false);
    });

    it('soft deletes, restores from trash, and permanently deletes', async () => {
      await createGuestbookEntry(testDb, {
        name: 'User 2',
        message: 'Komentar kedua'
      });

      const [entry] = await listAdminGuestbookEntries(testDb);

      // Soft delete
      await softDeleteGuestbookAction(entry.id);
      expect(await listAdminGuestbookEntries(testDb)).toHaveLength(0);
      expect(await listTrashedGuestbookEntries(testDb)).toHaveLength(1);

      // Restore
      await restoreGuestbookFromTrashAction(entry.id);
      expect(await listAdminGuestbookEntries(testDb)).toHaveLength(1);
      expect(await listTrashedGuestbookEntries(testDb)).toHaveLength(0);

      // Permanently delete
      await softDeleteGuestbookAction(entry.id);
      await permanentlyDeleteGuestbookAction(entry.id);
      expect(await listTrashedGuestbookEntries(testDb)).toHaveLength(0);
      expect(await listAdminGuestbookEntries(testDb)).toHaveLength(0);
    });
  });
});
