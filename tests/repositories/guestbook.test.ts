/**
 * @vitest-environment node
 */
import {describe, expect, it, beforeAll, afterAll, beforeEach} from 'vitest';
import {createTestDb, resetTestDb} from '../helpers/d1';
import {
  createGuestbookEntry,
  listPublicGuestbookEntries,
  listAdminGuestbookEntries,
  listTrashedGuestbookEntries,
  getGuestbookEntry,
  setGuestbookApproval,
  softDeleteGuestbookEntry,
  restoreGuestbookEntry,
  hardDeleteGuestbookEntry
} from '@/lib/repositories/guestbook';

describe('guestbook repository', () => {
  let db: D1Database;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({db, dispose} = await createTestDb());
  });

  afterAll(async () => {
    await dispose();
  });

  beforeEach(async () => {
    await resetTestDb(db);
  });

  it('creates and lists public guestbook entries', async () => {
    await createGuestbookEntry(db, {
      name: 'Rin',
      message: 'Halo dari Surabaya! Website keren.',
      website: 'https://example.com'
    });

    const entries = await listPublicGuestbookEntries(db);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('Rin');
    expect(entries[0].message).toBe('Halo dari Surabaya! Website keren.');
    expect(entries[0].website).toBe('https://example.com');
  });

  it('hides unapproved entries from public list but shows in admin', async () => {
    await createGuestbookEntry(db, {
      name: 'Pending User',
      message: 'Menunggu persetujuan.',
      isApproved: false
    });

    const publicEntries = await listPublicGuestbookEntries(db);
    expect(publicEntries).toHaveLength(0);

    const adminEntries = await listAdminGuestbookEntries(db);
    expect(adminEntries).toHaveLength(1);
    expect(adminEntries[0].isApproved).toBe(false);

    await setGuestbookApproval(db, adminEntries[0].id, true);

    const updatedPublic = await listPublicGuestbookEntries(db);
    expect(updatedPublic).toHaveLength(1);
    expect(updatedPublic[0].name).toBe('Pending User');
  });

  it('soft deletes, lists in trash, and restores', async () => {
    await createGuestbookEntry(db, {
      name: 'Spam Bot',
      message: 'Buy cheap things!'
    });

    const adminEntries = await listAdminGuestbookEntries(db);
    const id = adminEntries[0].id;

    await softDeleteGuestbookEntry(db, id);

    expect(await listPublicGuestbookEntries(db)).toHaveLength(0);
    expect(await listAdminGuestbookEntries(db)).toHaveLength(0);

    const trashed = await listTrashedGuestbookEntries(db);
    expect(trashed).toHaveLength(1);
    expect(trashed[0].id).toBe(id);

    await restoreGuestbookEntry(db, id);
    expect(await listAdminGuestbookEntries(db)).toHaveLength(1);
  });

  it('permanently deletes an entry', async () => {
    await createGuestbookEntry(db, {
      name: 'Delete Me',
      message: 'To be removed permanently.'
    });

    const [entry] = await listAdminGuestbookEntries(db);
    await hardDeleteGuestbookEntry(db, entry.id);

    expect(await listAdminGuestbookEntries(db)).toHaveLength(0);
    expect(await getGuestbookEntry(db, entry.id)).toBeNull();
  });
});
