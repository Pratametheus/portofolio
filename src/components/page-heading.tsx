export function PageHeading({title, description}: {title: string; description: string}) {
  return (
    <header className="mb-7 border-b border-dashed border-border pb-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">{title}</h1>
      <p className="mt-2.5 text-[15px] text-fg-muted">{description}</p>
    </header>
  );
}
