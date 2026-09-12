import Link from 'next/link';
import type {AchievementRow} from '@/lib/repositories/achievements';
import {createAchievementAction, updateAchievementAction} from '@/lib/actions/achievements';
import {uploadUrl} from '@/lib/uploads';

const FIELD_CLASS =
  'mt-1.5 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg';
const LABEL_CLASS = 'block text-sm text-fg-muted';
const COLUMN_CLASS = 'flex-1 space-y-4 rounded-2xl border border-border bg-surface p-5';

export function AchievementForm({entry}: {entry: AchievementRow | null}) {
  const action = entry ? updateAchievementAction.bind(null, entry.id) : createAchievementAction;

  return (
    <div>
      <Link href="/admin/achievements" className="text-sm text-accent hover:underline">
        ← Kembali ke Pencapaian
      </Link>
      <h1 className="mt-3 font-display text-xl text-fg">
        {entry ? 'Ubah Pencapaian' : 'Tambah Pencapaian'}
      </h1>

      <form action={action} className="mt-6 max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className={COLUMN_CLASS}>
            <h2 className="font-display text-sm font-semibold text-fg">Indonesia</h2>
            <label className={LABEL_CLASS}>
              Judul
              <input className={FIELD_CLASS} name="titleId" defaultValue={entry?.titleId} required />
            </label>
            <label className={LABEL_CLASS}>
              Deskripsi
              <textarea className={`${FIELD_CLASS} min-h-24 py-2`} name="descriptionId" defaultValue={entry?.descriptionId} required />
            </label>
          </div>
          <div className={COLUMN_CLASS}>
            <h2 className="font-display text-sm font-semibold text-fg">English</h2>
            <label className={LABEL_CLASS}>
              Title
              <input className={FIELD_CLASS} name="titleEn" defaultValue={entry?.titleEn} required />
            </label>
            <label className={LABEL_CLASS}>
              Description
              <textarea className={`${FIELD_CLASS} min-h-24 py-2`} name="descriptionEn" defaultValue={entry?.descriptionEn} required />
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
          <label className={LABEL_CLASS}>
            Penerbit
            <input className={FIELD_CLASS} name="issuer" defaultValue={entry?.issuer} required />
          </label>
          <label className={LABEL_CLASS}>
            Tahun
            <input className={FIELD_CLASS} name="year" defaultValue={entry?.year} required />
          </label>
          <label className={LABEL_CLASS}>
            Tipe
            <select className={FIELD_CLASS} name="type" defaultValue={entry?.type ?? 'Publikasi'}>
              <option value="Publikasi">Publikasi</option>
              <option value="Sertifikat">Sertifikat</option>
            </select>
          </label>
          <label className={LABEL_CLASS}>
            Kategori
            <select className={FIELD_CLASS} name="category" defaultValue={entry?.category ?? 'Keamanan'}>
              <option value="Keamanan">Keamanan</option>
              <option value="Pendidikan">Pendidikan</option>
              <option value="Pengembangan">Pengembangan</option>
            </select>
          </label>
          <label className={LABEL_CLASS}>
            URL (opsional)
            <input className={FIELD_CLASS} name="url" type="url" defaultValue={entry?.url ?? ''} />
          </label>
          <label className={LABEL_CLASS}>
            Urutan tampil
            <input className={FIELD_CLASS} name="sortOrder" type="number" defaultValue={entry?.sortOrder ?? 0} />
          </label>
          <label className={`${LABEL_CLASS} sm:col-span-2`}>
            Cover (opsional, PNG/JPEG/WebP, maks 5MB)
            {entry?.coverKey ? (
              <img
                src={uploadUrl(entry.coverKey)}
                alt=""
                className="mt-2 h-24 w-40 rounded-lg border border-border object-cover"
              />
            ) : null}
            <input
              className={`${FIELD_CLASS} p-2`}
              name="cover"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 min-h-11 rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:opacity-90"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
