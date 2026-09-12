import {describe, expect, it} from 'vitest';
import {parseCareerEntryForm} from '@/lib/actions/career-entries';

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const validFields = {
  roleId: 'Guru', roleEn: 'Teacher',
  organizationId: 'Sekolah', organizationEn: 'School',
  periodId: 'Mulai 2026', periodEn: 'Since 2026',
  categoryId: 'Pendidikan', categoryEn: 'Education',
  mark: 'SD',
  descriptionId: 'Deskripsi.', descriptionEn: 'Description.',
  sortOrder: '0'
};

describe('parseCareerEntryForm', () => {
  it('parses a fully-filled form into CareerEntryInput', () => {
    const input = parseCareerEntryForm(fd(validFields), 'career');
    expect(input).toEqual({
      kind: 'career',
      roleId: 'Guru', roleEn: 'Teacher',
      organizationId: 'Sekolah', organizationEn: 'School',
      periodId: 'Mulai 2026', periodEn: 'Since 2026',
      categoryId: 'Pendidikan', categoryEn: 'Education',
      mark: 'SD',
      descriptionId: 'Deskripsi.', descriptionEn: 'Description.',
      sortOrder: 0
    });
  });

  it('throws when a required bilingual field is missing', () => {
    const fields = {...validFields};
    delete (fields as Record<string, string>).roleEn;
    expect(() => parseCareerEntryForm(fd(fields), 'career')).toThrow(/roleEn/);
  });

  it('throws when sortOrder is not a number', () => {
    expect(() =>
      parseCareerEntryForm(fd({...validFields, sortOrder: 'abc'}), 'career')
    ).toThrow(/sortOrder/);
  });

  it('defaults sortOrder to 0 when blank', () => {
    const input = parseCareerEntryForm(fd({...validFields, sortOrder: ''}), 'career');
    expect(input.sortOrder).toBe(0);
  });
});
