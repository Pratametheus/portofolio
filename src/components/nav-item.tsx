import {Link} from '@/i18n/navigation';
import type {NavPathname} from '@/i18n/routing';
import {NavIndicator} from '@/components/motion/nav-indicator';
import {Icon, type IconName} from './icon';

export function NavItem({
  href,
  index,
  label,
  active,
  icon,
  count
}: {
  href: NavPathname;
  index: string;
  label: string;
  active: boolean;
  icon?: IconName;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className="relative isolate flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-fg-muted transition-colors hover:bg-surface-2 aria-[current=page]:text-fg"
    >
      {active ? (
        <NavIndicator className="absolute inset-0 -z-10 rounded-lg bg-accent-dim" />
      ) : null}
      {icon ? <Icon name={icon} className="size-[18px] shrink-0" /> : <span className="font-mono text-xs">{index}</span>}
      <span>{label}</span>
      {count != null ? (
        <span className="ml-1 rounded border border-border px-1.5 text-[10px] text-fg-muted">{count}</span>
      ) : null}
      {active ? <span aria-hidden="true" className="ml-auto text-accent">→</span> : null}
    </Link>
  );
}
