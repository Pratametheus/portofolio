'use client';

import {useEffect, useState} from 'react';
import {useReducedMotion} from 'motion/react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * `motion`'s own `useReducedMotion()` samples the setting once per process (a
 * module singleton) and never re-reads it, so it is stale after the first mount
 * and in tests. Pair it with a live `matchMedia` subscription; either signal
 * turning true means: no motion.
 */
export function usePrefersReducedMotion(): boolean {
  const fromMotion = useReducedMotion();
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(QUERY);
    const sync = () => setLive(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return Boolean(fromMotion) || live;
}
