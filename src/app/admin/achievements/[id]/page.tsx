import {notFound} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {getAdminAchievement} from '@/lib/repositories/achievements';
import {AchievementForm} from '@/components/admin/achievement-form';

export const dynamic = 'force-dynamic';

export default async function AdminAchievementEntryPage({
  params
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  if (id === 'new') {
    return <AchievementForm entry={null} />;
  }
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();
  const {env} = await getCloudflareContext({async: true});
  const entry = await getAdminAchievement(env.DB, numericId);
  if (!entry) notFound();
  return <AchievementForm entry={entry} />;
}
