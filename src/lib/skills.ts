export type SkillGroup = 'Frontend' | 'Backend' | 'Mobile' | 'Database' | 'Tools';

export type Skill = {
  name: string;
  slug: string;
  group: SkillGroup;
  brandColor: string;
};

// Verbatim from public/design-preview/profile-sections.js `profileSkills`
// (`color` renamed to `brandColor`).
export const SKILLS: Skill[] = [
  {name: 'HTML', slug: 'html5', group: 'Frontend', brandColor: '#e98145'},
  {name: 'CSS', slug: 'css3', group: 'Frontend', brandColor: '#68a9ef'},
  {name: 'TypeScript', slug: 'typescript', group: 'Frontend', brandColor: '#79aef2'},
  {name: 'React', slug: 'react', group: 'Frontend', brandColor: '#69d3ec'},
  {name: 'Next.js', slug: 'nextjs', group: 'Frontend', brandColor: '#bfc6d3'},
  {name: 'Tailwind CSS', slug: 'tailwindcss', group: 'Frontend', brandColor: '#55c9d9'},
  {name: 'Vite', slug: 'vitejs', group: 'Frontend', brandColor: '#bda1ee'},
  {name: 'Laravel', slug: 'laravel', group: 'Backend', brandColor: '#ee877e'},
  {name: 'Flutter', slug: 'flutter', group: 'Mobile', brandColor: '#70c5ee'},
  {name: 'Supabase', slug: 'supabase', group: 'Database', brandColor: '#78d5a9'},
  {name: 'PostgreSQL', slug: 'postgresql', group: 'Database', brandColor: '#93b9dc'},
  {name: 'Git', slug: 'git', group: 'Tools', brandColor: '#e79877'}
];

export const SKILL_GROUPS = [
  'Semua',
  'Frontend',
  'Backend',
  'Mobile',
  'Database',
  'Tools'
] as const;

export type SkillGroupFilter = (typeof SKILL_GROUPS)[number];
