import type {ReactNode} from 'react';
import {Icon, type IconName} from './icon';

export function SectionHead({
  icon,
  title,
  description,
  aside
}: {
  icon?: IconName;
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <div>
        <h2 className="font-display text-xl tracking-tight text-fg">
          {icon ? (
            <Icon name={icon} className="mr-1.5 inline size-[18px] -translate-y-0.5 text-accent" />
          ) : null}
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm text-fg-muted">{description}</p> : null}
      </div>
      {aside ? <div className="shrink-0 text-sm text-fg-muted">{aside}</div> : null}
    </div>
  );
}
