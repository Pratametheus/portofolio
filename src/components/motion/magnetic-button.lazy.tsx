'use client';

import dynamic from 'next/dynamic';

/**
 * Client-only, lazily hydrated MagneticButton. The CTA sits well below the fold
 * and its pull/shimmer is interaction-triggered, so `motion` need not be in the
 * initial JS. Trade-off: no-JS readers do not get this link (the contact rows
 * above it still render).
 */
export const MagneticButton = dynamic(
  () => import('./magnetic-button').then((m) => m.MagneticButton),
  {ssr: false}
);
