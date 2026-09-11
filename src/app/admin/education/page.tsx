import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listAdminCareerEntries} from '@/lib/repositories/career';
import {CareerEntryList} from '@/components/admin/career-entry-list';

export const dynamic = 'force-dynamic';

export default async function AdminEducationPage() {
  const {env} = await getCloudflareContext({async: true});
  const entries = await listAdminCareerEntries(env.DB, 'education');
  return <CareerEntryList kind="education" title="Pendidikan" entries={entries} />;
}
