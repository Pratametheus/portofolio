import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {
  createAchievement,
  updateAchievement,
  softDeleteAchievement,
  undoLastAchievementEdit,
  getAdminAchievement,
  type AchievementInput,
  type AchievementType,
  type AchievementCategory
} from '@/lib/repositories/achievements';
import {validateUploadedFile, buildUploadKey} from '@/lib/uploads';

const ACHIEVEMENT_TYPES: AchievementType[] = ['Publikasi', 'Sertifikat'];
const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = ['Keamanan', 'Pendidikan', 'Pengembangan'];

const REQUIRED_TEXT_FIELDS = [
  'titleId', 'titleEn', 'issuer', 'year', 'descriptionId', 'descriptionEn'
] as const;

export function parseAchievementForm(formData: FormData): Omit<AchievementInput, 'coverKey'> {
  const values: Record<string, string> = {};
  for (const field of REQUIRED_TEXT_FIELDS) {
    const raw = formData.get(field);
    if (typeof raw !== 'string' || raw.trim() === '') {
      throw new Error(`Field "${field}" is required`);
    }
    values[field] = raw.trim();
  }

  const type = formData.get('type');
  if (typeof type !== 'string' || !ACHIEVEMENT_TYPES.includes(type as AchievementType)) {
    throw new Error(`Field "type" must be one of ${ACHIEVEMENT_TYPES.join(', ')}`);
  }

  const category = formData.get('category');
  if (
    typeof category !== 'string' ||
    !ACHIEVEMENT_CATEGORIES.includes(category as AchievementCategory)
  ) {
    throw new Error(`Field "category" must be one of ${ACHIEVEMENT_CATEGORIES.join(', ')}`);
  }

  const urlRaw = formData.get('url');
  let url: string | null = null;
  if (typeof urlRaw === 'string' && urlRaw.trim() !== '') {
    try {
      new URL(urlRaw);
    } catch {
      throw new Error('Field "url" must be a well-formed URL');
    }
    url = urlRaw;
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
    titleId: values.titleId,
    titleEn: values.titleEn,
    issuer: values.issuer,
    year: values.year,
    type: type as AchievementType,
    category: category as AchievementCategory,
    descriptionId: values.descriptionId,
    descriptionEn: values.descriptionEn,
    url,
    sortOrder
  };
}

export async function resolveCoverKey(
  bucket: R2Bucket,
  formData: FormData,
  existingKey: string | null
): Promise<string | null> {
  const file = formData.get('cover');
  if (!(file instanceof File) || file.size === 0) {
    return existingKey;
  }
  validateUploadedFile(file);
  const key = buildUploadKey('achievement-covers', file.type);
  await bucket.put(key, await file.arrayBuffer(), {httpMetadata: {contentType: file.type}});
  return key;
}

export async function createAchievementAction(formData: FormData): Promise<void> {
  'use server';
  const fields = parseAchievementForm(formData);
  const {env} = await getCloudflareContext({async: true});
  const coverKey = await resolveCoverKey(env.UPLOADS, formData, null);
  await createAchievement(env.DB, {...fields, coverKey});
  redirect('/admin/achievements');
}

export async function updateAchievementAction(id: number, formData: FormData): Promise<void> {
  'use server';
  const fields = parseAchievementForm(formData);
  const {env} = await getCloudflareContext({async: true});
  const existing = await getAdminAchievement(env.DB, id);
  const previousCoverKey = existing?.coverKey ?? null;
  const coverKey = await resolveCoverKey(env.UPLOADS, formData, previousCoverKey);
  await updateAchievement(env.DB, id, {...fields, coverKey});
  if (coverKey !== previousCoverKey && previousCoverKey) {
    await env.UPLOADS.delete(previousCoverKey);
  }
  redirect('/admin/achievements');
}

export async function softDeleteAchievementAction(id: number): Promise<void> {
  'use server';
  const {env} = await getCloudflareContext({async: true});
  await softDeleteAchievement(env.DB, id);
  redirect('/admin/achievements');
}

export async function undoAchievementEditAction(id: number): Promise<void> {
  'use server';
  const {env} = await getCloudflareContext({async: true});
  await undoLastAchievementEdit(env.DB, id);
  redirect('/admin/achievements');
}
