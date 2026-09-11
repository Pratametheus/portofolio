import Link from 'next/link';
import type {CareerEntryRow, CareerKind} from '@/lib/repositories/career';
import {softDeleteCareerEntryAction, undoCareerEntryEditAction} from '@/lib/actions/career-entries';

export function CareerEntryList({
  kind,
  title,
  entries
}: {
  kind: CareerKind;
  title: string;
  entries: CareerEntryRow[];
}) {
  const basePath = kind === 'career' ? '/admin/career' : '/admin/education';

  return (
    <section>
      <h2>{title}</h2>
      <Link href={`${basePath}/new`}>+ Tambah</Link>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id} style={{marginTop: '0.75rem'}}>
            <strong>{entry.roleId}</strong> / {entry.roleEn} — {entry.organizationId}
            {' · '}
            <Link href={`${basePath}/${entry.id}`}>Edit</Link>
            {' · '}
            {entry.previousSnapshot ? (
              <form action={undoCareerEntryEditAction.bind(null, kind, entry.id)} style={{display: 'inline'}}>
                <button type="submit">Urungkan perubahan dari {entry.snapshotAt}</button>
              </form>
            ) : null}
            {' · '}
            <form action={softDeleteCareerEntryAction.bind(null, kind, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
