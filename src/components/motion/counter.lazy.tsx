'use client';

import dynamic from 'next/dynamic';

/**
 * Client-only, lazily hydrated Counter. The count-up is below the fold and
 * decorative; deferring it moves `motion` out of the initial JS. Trade-off:
 * no-JS readers do not see the numeral (the surrounding label still renders).
 */
export const Counter = dynamic(
  () => import('./counter').then((m) => m.Counter),
  {ssr: false}
);
