import {Icon, type IconName} from './icon';

type PillarIcon = Extract<IconName, 'build' | 'teach' | 'secure'>;

export function PillarCard({
  icon,
  title,
  body
}: {
  icon: PillarIcon;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-6">
      <Icon name={icon} className="text-accent" />
      <h3 className="mt-5 font-display text-lg text-fg">{title}</h3>
      <p className="mt-2 leading-7 text-fg-muted">{body}</p>
    </article>
  );
}
