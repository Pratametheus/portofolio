import type {ReactNode} from 'react';
import {Icon, type IconName} from './icon';

export function DataEmpty({
  icon,
  title,
  description,
  action,
  headingLevel = 3
}: {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-surface p-6 text-fg-muted">
      {icon ? <Icon name={icon} className="mt-0.5 size-5 shrink-0 text-accent" /> : null}
      <div>
        <Heading className="font-display text-base font-semibold text-fg">{title}</Heading>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-fg-muted">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
