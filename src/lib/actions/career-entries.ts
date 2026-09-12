import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {
  createCareerEntry,
  updateCareerEntry,
  softDeleteCareerEntry,
  undoLastCareerEdit,
  getAdminCareerEntry,
  type CareerEntryInput,
  type CareerKind
} from '@/lib/repositories/career';
import {validateUploadedFile, buildUploadKey} from '@/lib/uploads';

const REQUIRED_FIELDS = [
  'roleId', 'roleEn',
  'organizationId', 'organizationEn',
  'periodId', 'periodEn',
  'categoryId', 'categoryEn',
  'mark',
  'descriptionId', 'descriptionEn'
] as const;

export function parseCareerEntryForm(formData: FormData, kind: CareerKind): Omit<CareerEntryInput, 'logoKey'> {
  const values: Record<string, string> = {};
  for (const field of REQUIRED_FIELDS) {
    const raw = formData.get(field);
    if (typeof raw !== 'string' || raw.trim() === '') {
      throw new Error(`Field "${field}" is required`);
    }
    values[field] = raw.trim();
  }

  if (values.mark.length > 2) {
    throw new Error('Field "mark" must be at most 2 characters');
  }

  const sortOrderRaw = formData.get('sortOrder');
  let sortOrder = 0;
  if (typeof sortOrderRaw === 'string' && sortOrderRaw.trim() !== '') {
    sortOrder = Number(sortOrderRaw);
    if (!Number.isInteger(sortOrder)) {
      throw new Error('Field "sortOrder" must be a whole number');
    }
  }

  return {
    kind,
    roleId: values.roleId,
    roleEn: values.roleEn,
    organizationId: values.organizationId,
    organizationEn: values.organizationEn,
    periodId: values.periodId,
    periodEn: values.periodEn,
    categoryId: values.categoryId,
    categoryEn: values.categoryEn,
    mark: values.mark,
    descriptionId: values.descriptionId,
    descriptionEn: values.descriptionEn,
    sortOrder
  };
}

/**
 * Resolves what `logoKey` a create/update should write: unchanged if no new file
 * was submitted (including an untouched, zero-byte file input), or a freshly
 * uploaded key otherwise. Pure with respect to D1 — the caller is responsible for
 * deleting `existingKey` from R2 afterward if this returns a different key.
 */
export async function resolveLogoKey(
  bucket: R2Bucket,
  formData: FormData,
  existingKey: string | null
): Promise<string | null> {
  const file = formData.get('logo');
  if (!(file instanceof File) || file.size === 0) {
    return existingKey;
  }
  validateUploadedFile(file);
  const key = buildUploadKey('career-logos', file.type);
  await bucket.put(key, await file.arrayBuffer(), {httpMetadata: {contentType: file.type}});
  return key;
}

function listPathFor(kind: CareerKind): string {
  return kind === 'career' ? '/admin/career' : '/admin/education';
}

export async function createCareerEntryAction(
  kind: CareerKind,
  formData: FormData
): Promise<void> {
  'use server';
  const fields = parseCareerEntryForm(formData, kind);
  const {env} = await getCloudflareContext({async: true});
  const logoKey = await resolveLogoKey(env.UPLOADS, formData, null);
  await createCareerEntry(env.DB, {...fields, logoKey});
  redirect(listPathFor(kind));
}

export async function updateCareerEntryAction(
  id: number,
  kind: CareerKind,
  formData: FormData
): Promise<void> {
  'use server';
  const fields = parseCareerEntryForm(formData, kind);
  const {env} = await getCloudflareContext({async: true});
  const existing = await getAdminCareerEntry(env.DB, id);
  const previousLogoKey = existing?.logoKey ?? null;
  const logoKey = await resolveLogoKey(env.UPLOADS, formData, previousLogoKey);
  await updateCareerEntry(env.DB, id, {...fields, logoKey});
  if (logoKey !== previousLogoKey && previousLogoKey) {
    await env.UPLOADS.delete(previousLogoKey);
  }
  redirect(listPathFor(kind));
}

export async function softDeleteCareerEntryAction(kind: CareerKind, id: number): Promise<void> {
  'use server';
  const {env} = await getCloudflareContext({async: true});
  await softDeleteCareerEntry(env.DB, id);
  redirect(listPathFor(kind));
}

export async function undoCareerEntryEditAction(kind: CareerKind, id: number): Promise<void> {
  'use server';
  const {env} = await getCloudflareContext({async: true});
  await undoLastCareerEdit(env.DB, id);
  redirect(listPathFor(kind));
}
