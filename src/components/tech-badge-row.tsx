import {SKILLS} from '@/lib/skills';

export function TechBadgeRow({slugs, size}: {slugs: string[]; size?: number}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {slugs.map((slug) => (
        <img
          key={slug}
          src={`/tech/${slug}.svg`}
          alt={SKILLS.find((s) => s.slug === slug)?.name ?? slug}
          width={size ?? 24}
          height={size ?? 24}
          loading="lazy"
          className="object-contain"
        />
      ))}
    </div>
  );
}
