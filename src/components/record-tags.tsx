export function RecordTags({tags}: {tags: string[]}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="rounded-full border border-border px-2.5 py-0.5 text-[10px] text-fg-muted">
          {tag}
        </span>
      ))}
    </div>
  );
}
