'use client';

export default function AdminError({
  error,
  reset
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-600/40 bg-red-600/5 p-6">
      <h2 className="font-display text-lg text-fg">Terjadi kesalahan</h2>
      <p className="mt-2 text-sm text-fg-muted">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 min-h-9 rounded-lg border border-border px-4 py-1.5 text-sm text-fg transition-colors hover:bg-surface"
      >
        Coba lagi
      </button>
    </div>
  );
}
