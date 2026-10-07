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
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight text-fg sm:text-xl">
          {icon ? (
            <Icon name={icon} className="mr-2 inline size-4 -translate-y-0.5 text-accent" />
          ) : null}
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
      </div>
      {aside ? <div className="shrink-0 text-xs text-fg-muted sm:text-sm">{aside}</div> : null}
    </div>
  );
}
