import type {AchievementRow} from '@/lib/repositories/achievements';
import {createAchievementAction, updateAchievementAction} from '@/lib/actions/achievements';

const FIELD_STYLE: React.CSSProperties = {display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem'};
const COLUMN_STYLE: React.CSSProperties = {flex: 1, padding: '1rem', border: '1px solid #ddd4c3', borderRadius: 8};

export function AchievementForm({entry}: {entry: AchievementRow | null}) {
  const action = entry
    ? updateAchievementAction.bind(null, entry.id)
    : createAchievementAction;

  return (
    <form action={action} style={{maxWidth: 720}}>
      <div style={{display: 'flex', gap: '1rem'}}>
        <div style={COLUMN_STYLE}>
          <h3>Indonesia</h3>
          <label>Judul<input style={FIELD_STYLE} name="titleId" defaultValue={entry?.titleId} required /></label>
          <label>Deskripsi<textarea style={FIELD_STYLE} name="descriptionId" defaultValue={entry?.descriptionId} required /></label>
        </div>
        <div style={COLUMN_STYLE}>
          <h3>English</h3>
          <label>Title<input style={FIELD_STYLE} name="titleEn" defaultValue={entry?.titleEn} required /></label>
          <label>Description<textarea style={FIELD_STYLE} name="descriptionEn" defaultValue={entry?.descriptionEn} required /></label>
        </div>
      </div>
      <div style={{marginTop: '1rem'}}>
        <label>Penerbit<input style={FIELD_STYLE} name="issuer" defaultValue={entry?.issuer} required /></label>
        <label>Tahun<input style={FIELD_STYLE} name="year" defaultValue={entry?.year} required /></label>
        <label>
          Tipe
          <select style={FIELD_STYLE} name="type" defaultValue={entry?.type ?? 'Publikasi'}>
            <option value="Publikasi">Publikasi</option>
            <option value="Sertifikat">Sertifikat</option>
          </select>
        </label>
        <label>
          Kategori
          <select style={FIELD_STYLE} name="category" defaultValue={entry?.category ?? 'Keamanan'}>
            <option value="Keamanan">Keamanan</option>
            <option value="Pendidikan">Pendidikan</option>
            <option value="Pengembangan">Pengembangan</option>
          </select>
        </label>
        <label>URL (opsional)<input style={FIELD_STYLE} name="url" type="url" defaultValue={entry?.url ?? ''} /></label>
        <label>Urutan tampil<input style={FIELD_STYLE} name="sortOrder" type="number" defaultValue={entry?.sortOrder ?? 0} /></label>
      </div>
      <button type="submit" style={{marginTop: '1rem'}}>Simpan</button>
    </form>
  );
}
