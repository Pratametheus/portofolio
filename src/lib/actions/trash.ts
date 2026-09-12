'use server';

import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {restoreCareerEntry, hardDeleteCareerEntry} from '@/lib/repositories/career';
import {restoreAchievement, hardDeleteAchievement} from '@/lib/repositories/achievements';

export async function restoreCareerEntryFromTrashAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await restoreCareerEntry(env.DB, id);
  redirect('/admin/trash');
}

export async function permanentlyDeleteCareerEntryAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  const logoKey = await hardDeleteCareerEntry(env.DB, id);
  if (logoKey) {
    try {
      await env.UPLOADS.delete(logoKey);
    } catch (error) {
      console.error(`Failed to delete R2 object ${logoKey} after permanent delete:`, error);
    }
  }
  redirect('/admin/trash');
}

export async function restoreAchievementFromTrashAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await restoreAchievement(env.DB, id);
  redirect('/admin/trash');
}

export async function permanentlyDeleteAchievementAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  const coverKey = await hardDeleteAchievement(env.DB, id);
  if (coverKey) {
    try {
      await env.UPLOADS.delete(coverKey);
    } catch (error) {
      console.error(`Failed to delete R2 object ${coverKey} after permanent delete:`, error);
    }
  }
  redirect('/admin/trash');
}
