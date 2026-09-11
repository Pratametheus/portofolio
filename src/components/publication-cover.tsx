/**
 * Static, server-safe JUTIF publication cover. No hooks, no props beyond an
 * optional layout size. The single real publication is a JUTIF article, so the
 * cover is hard-coded rather than data-driven.
 */
export function PublicationCover({size = 'grid'}: {size?: 'grid' | 'list'}) {
  return (
    <div
      className={`flex flex-col items-start border-b-4 border-accent bg-surface p-6 text-fg ${
        size === 'list' ? 'h-60' : 'h-52'
      }`}
    >
      <span className="text-xs tracking-[0.2em] text-fg-muted">JUTIF</span>
      <strong className="mt-3 font-display text-2xl leading-tight">
        Jurnal Teknik
        <br />
        Informatika
      </strong>
      <small className="mt-2 text-xs text-fg-muted">Vol. 7 No. 2 · 2026</small>
      <b className="mt-auto text-[10px] font-medium text-fg-muted">
        Artikel penelitian
      </b>
    </div>
  );
}
