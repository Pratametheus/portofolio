import {Link} from '@/i18n/navigation';
import type {NavPathname} from '@/i18n/routing';

export function NavItem({
  href,
  index,
  label,
  active
}: {
  href: NavPathname;
  index: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-fg-muted transition-colors hover:bg-surface-2 aria-[current=page]:bg-accent-dim aria-[current=page]:text-fg"
    >
      <span className="font-mono text-xs">{index}</span>
      <span>{label}</span>
    </Link>
  );
}
