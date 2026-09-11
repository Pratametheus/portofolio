import type {CareerEntryRow, CareerKind} from '@/lib/repositories/career';
import {createCareerEntryAction, updateCareerEntryAction} from '@/lib/actions/career-entries';

const FIELD_STYLE: React.CSSProperties = {display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem'};
const COLUMN_STYLE: React.CSSProperties = {flex: 1, padding: '1rem', border: '1px solid #ddd4c3', borderRadius: 8};

export function CareerEntryForm({kind, entry}: {kind: CareerKind; entry: CareerEntryRow | null}) {
  const action = entry
    ? updateCareerEntryAction.bind(null, entry.id, kind)
    : createCareerEntryAction.bind(null, kind);

  return (
    <form action={action} style={{maxWidth: 720}}>
      <div style={{display: 'flex', gap: '1rem'}}>
        <div style={COLUMN_STYLE}>
          <h3>Indonesia</h3>
          <label>Peran<input style={FIELD_STYLE} name="roleId" defaultValue={entry?.roleId} required /></label>
          <label>Organisasi<input style={FIELD_STYLE} name="organizationId" defaultValue={entry?.organizationId} required /></label>
          <label>Periode<input style={FIELD_STYLE} name="periodId" defaultValue={entry?.periodId} required /></label>
          <label>Kategori<input style={FIELD_STYLE} name="categoryId" defaultValue={entry?.categoryId} required /></label>
          <label>Deskripsi<textarea style={FIELD_STYLE} name="descriptionId" defaultValue={entry?.descriptionId} required /></label>
        </div>
        <div style={COLUMN_STYLE}>
          <h3>English</h3>
          <label>Role<input style={FIELD_STYLE} name="roleEn" defaultValue={entry?.roleEn} required /></label>
          <label>Organization<input style={FIELD_STYLE} name="organizationEn" defaultValue={entry?.organizationEn} required /></label>
          <label>Period<input style={FIELD_STYLE} name="periodEn" defaultValue={entry?.periodEn} required /></label>
          <label>Category<input style={FIELD_STYLE} name="categoryEn" defaultValue={entry?.categoryEn} required /></label>
          <label>Description<textarea style={FIELD_STYLE} name="descriptionEn" defaultValue={entry?.descriptionEn} required /></label>
        </div>
      </div>
      <div style={{marginTop: '1rem'}}>
        <label>Mark (2 huruf)<input style={FIELD_STYLE} name="mark" defaultValue={entry?.mark} maxLength={2} required /></label>
        <label>Urutan tampil<input style={FIELD_STYLE} name="sortOrder" type="number" defaultValue={entry?.sortOrder ?? 0} /></label>
      </div>
      <button type="submit" style={{marginTop: '1rem'}}>Simpan</button>
    </form>
  );
}
