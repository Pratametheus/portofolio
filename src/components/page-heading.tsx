export function PageHeading({title, description}: {title: string; description: string}) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{description}</p>
    </header>
  );
}
