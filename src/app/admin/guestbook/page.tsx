import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listAdminGuestbookEntries} from '@/lib/repositories/guestbook';
import {GuestbookAdminList} from '@/components/admin/guestbook-list';

export const dynamic = 'force-dynamic';

export default async function AdminGuestbookPage() {
  const {env} = await getCloudflareContext({async: true});
  const entries = await listAdminGuestbookEntries(env.DB);
  return <GuestbookAdminList entries={entries} />;
}
