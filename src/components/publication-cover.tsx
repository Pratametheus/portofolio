import {useTranslations} from 'next-intl';

/**
 * JUTIF publication cover, server-safe. Renders an uploaded cover image when one
 * is provided; otherwise falls back to the original hard-coded JUTIF graphic
 * (still correct for the one real publication that has no uploaded cover).
 * `useTranslations` is isomorphic, so this still needs no 'use client' directive.
 */
export function PublicationCover({
  size = 'grid',
  coverUrl
}: {
  size?: 'grid' | 'list';
  coverUrl?: string;
}) {
  const t = useTranslations();
  const heightClass = size === 'list' ? 'h-60' : 'h-52';

  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt=""
        className={`w-full object-cover ${heightClass}`}
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-start border-b-4 border-accent bg-surface p-6 text-fg ${heightClass}`}
    >
      <span className="text-xs tracking-[0.2em] text-fg-muted">JUTIF</span>
      <strong className="mt-3 font-display text-2xl leading-tight">
        Jurnal Teknik
        <br />
        Informatika
      </strong>
      <small className="mt-2 text-xs text-fg-muted">Vol. 7 No. 2 · 2026</small>
      <b className="mt-auto text-[10px] font-medium text-fg-muted">
        {t('achievements.coverLabel')}
      </b>
    </div>
  );
}
