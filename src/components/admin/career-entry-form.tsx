import Link from 'next/link';
import type {CareerEntryRow, CareerKind} from '@/lib/repositories/career';
import {createCareerEntryAction, updateCareerEntryAction} from '@/lib/actions/career-entries';

const FIELD_CLASS =
  'mt-1.5 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg';
const LABEL_CLASS = 'block text-sm text-fg-muted';
const COLUMN_CLASS = 'flex-1 space-y-4 rounded-2xl border border-border bg-surface p-5';

const KIND_LABEL: Record<CareerKind, string> = {career: 'Karier', education: 'Pendidikan'};
const KIND_BASE_PATH: Record<CareerKind, string> = {career: '/admin/career', education: '/admin/education'};

export function CareerEntryForm({kind, entry}: {kind: CareerKind; entry: CareerEntryRow | null}) {
  const action = entry
    ? updateCareerEntryAction.bind(null, entry.id, kind)
    : createCareerEntryAction.bind(null, kind);
  const basePath = KIND_BASE_PATH[kind];

  return (
    <div>
      <Link href={basePath} className="text-sm text-accent hover:underline">
        ← Kembali ke {KIND_LABEL[kind]}
      </Link>
      <h1 className="mt-3 font-display text-xl text-fg">
        {entry ? `Ubah ${KIND_LABEL[kind]}` : `Tambah ${KIND_LABEL[kind]}`}
      </h1>

      <form action={action} className="mt-6 max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className={COLUMN_CLASS}>
            <h2 className="font-display text-sm font-semibold text-fg">Indonesia</h2>
            <label className={LABEL_CLASS}>
              Peran
              <input className={FIELD_CLASS} name="roleId" defaultValue={entry?.roleId} required />
            </label>
            <label className={LABEL_CLASS}>
              Organisasi
              <input className={FIELD_CLASS} name="organizationId" defaultValue={entry?.organizationId} required />
            </label>
            <label className={LABEL_CLASS}>
              Periode
              <input className={FIELD_CLASS} name="periodId" defaultValue={entry?.periodId} required />
            </label>
            <label className={LABEL_CLASS}>
              Kategori
              <input className={FIELD_CLASS} name="categoryId" defaultValue={entry?.categoryId} required />
            </label>
            <label className={LABEL_CLASS}>
              Deskripsi
              <textarea className={`${FIELD_CLASS} min-h-24 py-2`} name="descriptionId" defaultValue={entry?.descriptionId} required />
            </label>
          </div>
          <div className={COLUMN_CLASS}>
            <h2 className="font-display text-sm font-semibold text-fg">English</h2>
            <label className={LABEL_CLASS}>
              Role
              <input className={FIELD_CLASS} name="roleEn" defaultValue={entry?.roleEn} required />
            </label>
            <label className={LABEL_CLASS}>
              Organization
              <input className={FIELD_CLASS} name="organizationEn" defaultValue={entry?.organizationEn} required />
            </label>
            <label className={LABEL_CLASS}>
              Period
              <input className={FIELD_CLASS} name="periodEn" defaultValue={entry?.periodEn} required />
            </label>
            <label className={LABEL_CLASS}>
              Category
              <input className={FIELD_CLASS} name="categoryEn" defaultValue={entry?.categoryEn} required />
            </label>
            <label className={LABEL_CLASS}>
              Description
              <textarea className={`${FIELD_CLASS} min-h-24 py-2`} name="descriptionEn" defaultValue={entry?.descriptionEn} required />
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
          <label className={LABEL_CLASS}>
            Mark (2 huruf)
            <input className={FIELD_CLASS} name="mark" defaultValue={entry?.mark} maxLength={2} required />
          </label>
          <label className={LABEL_CLASS}>
            Urutan tampil
            <input className={FIELD_CLASS} name="sortOrder" type="number" defaultValue={entry?.sortOrder ?? 0} />
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
