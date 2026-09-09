import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {SKILLS, SKILL_GROUPS} from '@/lib/skills';

describe('skills data', () => {
  it('has 12 skills, each with a group in SKILL_GROUPS and a hex brandColor', () => {
    expect(SKILLS).toHaveLength(12);
    for (const s of SKILLS) {
      expect(SKILL_GROUPS).toContain(s.group);
      expect(s.brandColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('ships a brand SVG for every skill slug', () => {
    for (const s of SKILLS) {
      expect(existsSync(resolve(__dirname, `../public/tech/${s.slug}.svg`)), s.slug).toBe(true);
    }
  });

  it('SKILL_GROUPS starts with Semua and every non-Semua group is used', () => {
    expect(SKILL_GROUPS[0]).toBe('Semua');
    for (const g of SKILL_GROUPS.slice(1)) {
      expect(SKILLS.some((s) => s.group === g), g).toBe(true);
    }
  });
});
