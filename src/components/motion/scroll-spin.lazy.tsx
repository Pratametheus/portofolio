'use client';

import dynamic from 'next/dynamic';

/**
 * Client-only, lazily hydrated ScrollSpin. Keeps `motion` and its feature
 * bundle out of the route's initial JS. The wrapped hero art is a non-critical
 * enhancement — the page reads fully before this loads.
 */
export const ScrollSpin = dynamic(
  () => import('./scroll-spin').then((m) => m.ScrollSpin),
  {ssr: false}
);
