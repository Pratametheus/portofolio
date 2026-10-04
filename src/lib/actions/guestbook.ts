'use server';

import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {
  createGuestbookEntry,
  setGuestbookApproval,
  softDeleteGuestbookEntry
} from '@/lib/repositories/guestbook';
import {validateGuestbookInput} from '@/lib/guestbook-validation';
import {assertAdminAuth} from '@/lib/auth';

export type GuestbookActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    message?: string;
    website?: string;
  };
};

export async function submitGuestbookEntryAction(
  _prevState: GuestbookActionState,
  formData: FormData
): Promise<GuestbookActionState> {
  const validation = validateGuestbookInput(formData);

  if (validation.isHoneypot) {
    // Silently drop spam submissions while returning success to the bot
    return {success: true};
  }

  if (validation.fieldErrors) {
    return {success: false, fieldErrors: validation.fieldErrors};
  }

  if (!validation.data) {
    return {success: false, error: 'Data formulir tidak lengkap.'};
  }

  try {
    const {env} = await getCloudflareContext({async: true});
    await createGuestbookEntry(env.DB, {
      name: validation.data.name,
      message: validation.data.message,
      website: validation.data.website,
      isApproved: true
    });

    return {success: true};
  } catch (error) {
    console.error('Failed to save guestbook entry:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat menyimpan pesan. Silakan coba lagi.'
    };
  }
}

export async function toggleGuestbookApprovalAction(
  id: number,
  currentApproved: boolean
): Promise<void> {
  await assertAdminAuth();
  const {env} = await getCloudflareContext({async: true});
  await setGuestbookApproval(env.DB, id, !currentApproved);
  redirect('/admin/guestbook');
}

export async function softDeleteGuestbookAction(id: number): Promise<void> {
  await assertAdminAuth();
  const {env} = await getCloudflareContext({async: true});
  await softDeleteGuestbookEntry(env.DB, id);
  redirect('/admin/guestbook');
}
