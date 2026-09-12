import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {
  createCareerEntry,
  updateCareerEntry,
  softDeleteCareerEntry,
  undoLastCareerEdit,
  type CareerEntryInput,
  type CareerKind
} from '@/lib/repositories/career';

const REQUIRED_FIELDS = [
  'roleId', 'roleEn',
  'organizationId', 'organizationEn',
  'periodId', 'periodEn',
  'categoryId', 'categoryEn',
  'mark',
  'descriptionId', 'descriptionEn'
] as const;

export function parseCareerEntryForm(formData: FormData, kind: CareerKind): CareerEntryInput {
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
    logoKey: null,
    sortOrder
  };
}

function listPathFor(kind: CareerKind): string {
  return kind === 'career' ? '/admin/career' : '/admin/education';
}

export async function createCareerEntryAction(
  kind: CareerKind,
  formData: FormData
): Promise<void> {
  'use server';
  const input = parseCareerEntryForm(formData, kind);
  const {env} = await getCloudflareContext({async: true});
  await createCareerEntry(env.DB, input);
  redirect(listPathFor(kind));
}

export async function updateCareerEntryAction(
  id: number,
  kind: CareerKind,
  formData: FormData
): Promise<void> {
  'use server';
  const input = parseCareerEntryForm(formData, kind);
  const {env} = await getCloudflareContext({async: true});
  await updateCareerEntry(env.DB, id, input);
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
