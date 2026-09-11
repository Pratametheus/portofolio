import {notFound} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {getAdminCareerEntry} from '@/lib/repositories/career';
import {CareerEntryForm} from '@/components/admin/career-entry-form';

export const dynamic = 'force-dynamic';

export default async function AdminCareerEntryPage({
  params
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  if (id === 'new') {
    return <CareerEntryForm kind="career" entry={null} />;
  }
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();
  const {env} = await getCloudflareContext({async: true});
  const entry = await getAdminCareerEntry(env.DB, numericId);
  if (!entry) notFound();
  return <CareerEntryForm kind="career" entry={entry} />;
}
