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
  await hardDeleteCareerEntry(env.DB, id);
  redirect('/admin/trash');
}

export async function restoreAchievementFromTrashAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await restoreAchievement(env.DB, id);
  redirect('/admin/trash');
}

export async function permanentlyDeleteAchievementAction(id: number): Promise<void> {
  const {env} = await getCloudflareContext({async: true});
  await hardDeleteAchievement(env.DB, id);
  redirect('/admin/trash');
}
