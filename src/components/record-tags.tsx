export function RecordTags({tags}: {tags: string[]}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-fg-muted">
          {tag}
        </span>
      ))}
    </div>
  );
}
