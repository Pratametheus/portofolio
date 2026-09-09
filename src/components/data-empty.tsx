import type {ReactNode} from 'react';
import {Icon, type IconName} from './icon';

export function DataEmpty({
  icon,
  title,
  description,
  action
}: {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-dashed border-border p-6 text-fg-muted">
      {icon ? <Icon name={icon} className="mt-0.5 size-6 shrink-0" /> : null}
      <div>
        <h3 className="font-display text-base text-fg">{title}</h3>
        <p className="mt-2 max-w-xl text-sm text-fg-muted">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
