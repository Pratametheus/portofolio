'use client';

import dynamic from 'next/dynamic';

/**
 * Client-only, lazily hydrated ParallaxY — same treatment as the other motion
 * islands: keeps `motion` out of the route's initial JS. The wrapped media is
 * fully rendered before this loads (its own SSR fallback path).
 */
export const ParallaxY = dynamic(
  () => import('./parallax-y').then((m) => m.ParallaxY),
  {ssr: false}
);
