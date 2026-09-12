import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listTrashedCareerEntries} from '@/lib/repositories/career';
import {listTrashedAchievements} from '@/lib/repositories/achievements';
import {
  restoreCareerEntryFromTrashAction,
  permanentlyDeleteCareerEntryAction,
  restoreAchievementFromTrashAction,
  permanentlyDeleteAchievementAction
} from '@/lib/actions/trash';

export const dynamic = 'force-dynamic';

export default async function AdminTrashPage() {
  const {env} = await getCloudflareContext({async: true});
  const [careerEntries, achievements] = await Promise.all([
    listTrashedCareerEntries(env.DB),
    listTrashedAchievements(env.DB)
  ]);

  return (
    <section>
      <h2>Sampah</h2>

      <h3>Karier &amp; Pendidikan</h3>
      {careerEntries.length === 0 ? <p>Kosong.</p> : null}
      <ul>
        {careerEntries.map((entry) => (
          <li key={entry.id} style={{marginTop: '0.75rem'}}>
            {entry.roleId} ({entry.kind}) — dihapus {entry.deletedAt}
            {' · '}
            <form action={restoreCareerEntryFromTrashAction.bind(null, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Pulihkan</button>
            </form>
            {' · '}
            <form action={permanentlyDeleteCareerEntryAction.bind(null, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Hapus permanen</button>
            </form>
          </li>
        ))}
      </ul>

      <h3>Pencapaian</h3>
      {achievements.length === 0 ? <p>Kosong.</p> : null}
      <ul>
        {achievements.map((entry) => (
          <li key={entry.id} style={{marginTop: '0.75rem'}}>
            {entry.titleId} — dihapus {entry.deletedAt}
            {' · '}
            <form action={restoreAchievementFromTrashAction.bind(null, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Pulihkan</button>
            </form>
            {' · '}
            <form action={permanentlyDeleteAchievementAction.bind(null, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Hapus permanen</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
