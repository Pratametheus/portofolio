'use client';

export default function AdminError({
  error,
  reset
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  return (
    <div style={{padding: '2rem', fontFamily: 'system-ui, sans-serif'}}>
      <h2>Terjadi kesalahan</h2>
      <p>{error.message}</p>
      <button type="button" onClick={() => reset()} style={{marginTop: '1rem'}}>
        Coba lagi
      </button>
    </div>
  );
}
