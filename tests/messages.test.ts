import {describe, expect, it} from 'vitest';
import id from '../messages/id.json';
import en from '../messages/en.json';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? flattenKeys(value as Record<string, unknown>, full)
      : [full];
  });
}

function flattenEntries(
  obj: Record<string, unknown>,
  prefix = ''
): Array<[string, unknown]> {
  return Object.entries(obj).flatMap(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? flattenEntries(value as Record<string, unknown>, full)
      : ([[full, value]] as Array<[string, unknown]>);
  });
}

describe('kelengkapan terjemahan', () => {
  const idKeys = flattenKeys(id).sort();
  const enKeys = flattenKeys(en).sort();

  it('setiap kunci Indonesia ada di berkas Inggris', () => {
    expect(enKeys.filter((k) => !idKeys.includes(k))).toEqual([]);
    expect(idKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
  });

  it('tidak ada nilai kosong', () => {
    const empty = [...flattenEntries(id), ...flattenEntries(en)]
      .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
      .map(([path]) => path);
    expect(empty).toEqual([]);
  });

  it('memuat seluruh kontrak katalog Ruang Kerja', () => {
    const requiredKeys = [
      'nav.home', 'nav.about', 'nav.work', 'nav.research', 'nav.achievements',
      'nav.guestbook', 'nav.contact', 'nav.links',
      'sidebar.role', 'sidebar.availability', 'sidebar.footer',
      'home.eyebrow', 'home.tagline', 'home.statement', 'home.pillarsTitle',
      'home.pillars.build.title', 'home.pillars.build.body',
      'home.pillars.teach.title', 'home.pillars.teach.body',
      'home.pillars.secure.title', 'home.pillars.secure.body',
      'home.selectedWork', 'home.researchTitle', 'home.contactTitle', 'home.contactCta',
      'work.title', 'work.intro',
      'about.title', 'about.body1', 'about.body2', 'about.body3',
      'research.title', 'research.paper.title', 'research.paper.meta',
      'research.paper.summary', 'research.paper.doiLabel',
      'achievements.title', 'achievements.intro',
      'achievements.publicationTitle', 'achievements.publicationBody',
      'achievements.teachingTitle', 'achievements.teachingBody',
      'achievements.productTitle', 'achievements.productBody',
      'guestbook.title', 'guestbook.empty',
      'contact.title', 'contact.intro', 'contact.emailLabel', 'contact.emailValue',
      'contact.githubLabel', 'contact.githubValue', 'contact.availability',
      'links.title', 'links.intro', 'links.githubLabel', 'links.githubDescription',
      'links.githubUrl', 'links.journalLabel', 'links.journalDescription',
      'links.journalUrl', 'links.siakadLabel', 'links.siakadDescription',
      'links.siakadUrl', 'metadata.title', 'metadata.description',
      'about.meta.description', 'work.meta.description', 'research.meta.description',
      'achievements.meta.description', 'guestbook.meta.description',
      'contact.meta.description', 'links.meta.description',
      'notFound.title', 'notFound.description', 'notFound.back', 'common.visitApp'
    ];

    expect(idKeys).toEqual(expect.arrayContaining(requiredKeys));
    expect(enKeys).toEqual(expect.arrayContaining(requiredKeys));
  });
});
