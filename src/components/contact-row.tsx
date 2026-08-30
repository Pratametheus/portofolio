export function ContactRow({label, value, href}: {label: string; value: string; href?: string}) {
  const external = href?.startsWith('http');

  return (
    <div className="flex flex-col gap-1 border-t border-border py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
      <p className="font-mono text-xs uppercase tracking-wide text-fg-muted">{label}</p>
      {href ? (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="text-fg transition-colors hover:text-accent"
        >
          {value}
        </a>
      ) : (
        <p className="text-fg">{value}</p>
      )}
    </div>
  );
}
