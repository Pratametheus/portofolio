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
      'nav.dashboard', 'nav.guestbook', 'nav.contact', 'nav.links',
      'sidebar.name', 'sidebar.role', 'sidebar.availability', 'sidebar.railNote', 'sidebar.footer',
      'sidebar.themeGroupLabel', 'sidebar.themeNight', 'sidebar.themeLight', 'sidebar.localeGroupLabel',
      'home.helloEyebrow', 'home.helloHeading', 'home.intro1', 'home.intro2',
      'home.aboutLink', 'home.selectedWork', 'home.selectedWorkAll',
      'home.researchEyebrow', 'home.researchHeadline', 'home.researchSummary', 'home.researchLink',
      'work.title', 'work.intro',
      'about.title', 'about.biography1', 'about.biography2', 'about.biography3',
      'about.biography4', 'about.signoff',
      'research.title', 'research.count', 'research.listCardCta', 'research.paper.title', 'research.paper.meta',
      'research.paper.summary', 'research.paper.doiLabel', 'research.paper.focusTitle', 'research.paper.focusBody',
      'research.paper.methodTitle', 'research.paper.methodBody', 'research.paper.pubTitle', 'research.paper.relatedTitle',
      'research.paper.readAtPublisher',
      'achievements.title', 'achievements.intro', 'achievements.listTitle',
      'achievements.publicationTitle', 'achievements.publicationBody',
      'achievements.teachingTitle', 'achievements.teachingBody',
      'achievements.productTitle', 'achievements.productBody',
      'guestbook.title', 'guestbook.intro', 'guestbook.emptyTitle', 'guestbook.empty',
      'contact.title', 'contact.intro', 'contact.emailLabel', 'contact.emailValue',
      'contact.githubLabel', 'contact.githubValue', 'contact.availability',
      'links.title', 'links.intro', 'links.githubLabel', 'links.githubDescription',
      'links.githubUrl', 'links.journalLabel', 'links.journalDescription',
      'links.journalUrl', 'links.siakadLabel', 'links.siakadDescription',
      'links.siakadUrl', 'metadata.title', 'metadata.description',
      'about.meta.description', 'work.meta.description', 'research.meta.description',
      'achievements.meta.description', 'guestbook.meta.description',
      'contact.meta.description', 'links.meta.description',
      'notFound.title', 'notFound.description', 'notFound.back', 'common.visitApp',
      'skills.title', 'skills.description', 'skills.filterLabel',
      'skills.groups.semua', 'skills.groups.frontend', 'skills.groups.backend',
      'skills.groups.mobile', 'skills.groups.database', 'skills.groups.tools',
      'work.filters.typeLabel', 'work.filters.type.semua', 'work.filters.type.web',
      'work.filters.type.mobile', 'work.filters.categoryLabel',
      'work.filters.category.semua', 'work.filters.category.pendidikan',
      'work.filters.category.keamanan', 'work.filters.category.penulisan',
      'work.cardCta', 'work.coverAction', 'work.count', 'work.featuredLabel',
      'work.empty.title', 'work.empty.body',
      'work.detail.back', 'work.detail.techTitle', 'work.detail.fullCaseTitle', 'work.detail.relatedTitle',
      'about.career.title', 'about.career.description', 'about.career.detailSummary',
      'about.education.title', 'about.education.description',
      'about.education.emptyTitle', 'about.education.emptyBody',
      'achievements.filters.searchLabel', 'achievements.filters.searchPlaceholder',
      'achievements.filters.typeLabel', 'achievements.filters.type.semua',
      'achievements.filters.type.publikasi', 'achievements.filters.type.sertifikat',
      'achievements.filters.categoryLabel', 'achievements.filters.category.semua',
      'achievements.filters.category.keamanan', 'achievements.filters.category.pendidikan',
      'achievements.filters.category.pengembangan', 'achievements.total',
      'achievements.empty.title', 'achievements.empty.body', 'achievements.reset',
      'achievements.dataNote', 'achievements.detailSummary', 'achievements.coverLabel',
      'dashboard.intro', 'dashboard.meta.description', 'dashboard.github.title',
      'dashboard.github.link', 'dashboard.github.stats.followers',
      'dashboard.github.stats.repositories', 'dashboard.github.stats.stars',
      'dashboard.github.calendarEmpty.title', 'dashboard.github.calendarEmpty.description',
      'dashboard.repos.title', 'dashboard.wakatime.title',
      'dashboard.wakatime.stats.codingTime', 'dashboard.wakatime.stats.topLanguage',
      'dashboard.wakatime.stats.dailyAverage', 'dashboard.monkeytype.title',
      'dashboard.monkeytype.stats.wpm', 'dashboard.monkeytype.stats.accuracy',
      'dashboard.monkeytype.stats.tests', 'dashboard.notConnected', 'dashboard.statValueLabel',
      'footer.title', 'footer.description', 'footer.githubCta', 'footer.copyright',
      'contact.connectTitle', 'contact.github.title', 'contact.github.body', 'contact.github.cta',
      'contact.email.title', 'contact.email.body', 'contact.email.status',
      'contact.form.from', 'contact.form.prepareTitle', 'contact.form.note', 'contact.form.name', 'contact.form.email',
      'contact.form.message', 'contact.form.submit', 'contact.form.statusOk', 'contact.form.statusFail'
    ];

    expect(idKeys).toEqual(expect.arrayContaining(requiredKeys));
    expect(enKeys).toEqual(expect.arrayContaining(requiredKeys));
  });
});
