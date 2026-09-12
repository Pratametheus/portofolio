import {redirect} from 'next/navigation';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {
  createAchievement,
  updateAchievement,
  softDeleteAchievement,
  undoLastAchievementEdit,
  type AchievementInput,
  type AchievementType,
  type AchievementCategory
} from '@/lib/repositories/achievements';

const ACHIEVEMENT_TYPES: AchievementType[] = ['Publikasi', 'Sertifikat'];
const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = ['Keamanan', 'Pendidikan', 'Pengembangan'];

const REQUIRED_TEXT_FIELDS = [
  'titleId', 'titleEn', 'issuer', 'year', 'descriptionId', 'descriptionEn'
] as const;

export function parseAchievementForm(formData: FormData): AchievementInput {
  const values: Record<string, string> = {};
  for (const field of REQUIRED_TEXT_FIELDS) {
    const raw = formData.get(field);
    if (typeof raw !== 'string' || raw.trim() === '') {
      throw new Error(`Field "${field}" is required`);
    }
    values[field] = raw;
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
    if (!Number.isFinite(sortOrder)) {
      throw new Error('Field "sortOrder" must be a number');
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

export async function createAchievementAction(formData: FormData): Promise<void> {
  'use server';
  const input = parseAchievementForm(formData);
  const {env} = await getCloudflareContext({async: true});
  await createAchievement(env.DB, input);
  redirect('/admin/achievements');
}

export async function updateAchievementAction(id: number, formData: FormData): Promise<void> {
  'use server';
  const input = parseAchievementForm(formData);
  const {env} = await getCloudflareContext({async: true});
  await updateAchievement(env.DB, id, input);
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
