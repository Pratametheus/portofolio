'use client';

import {useEffect, useRef, useState} from 'react';
import {animate, useInView, useMotionValue} from 'motion/react';
import {DUR, EASE} from '@/lib/motion';
import {usePrefersReducedMotion} from './use-reduced-motion';

export function Counter({
  to,
  from = 0,
  duration,
  className,
  format
}: {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const show = (n: number) => (format ? format(n) : String(n));
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {once: true, margin: '0px 0px -10% 0px'});
  const count = useMotionValue(from);

  // The server / no-JS / reduced-motion value is the final number, always in the DOM.
  const [display, setDisplay] = useState(() => show(to));

  useEffect(() => {
    if (reduce || !inView) return;
    count.set(from);
    const controls = animate(count, to, {
      duration: duration ?? DUR.slow * 3,
      ease: EASE,
      onUpdate: (v) => setDisplay(show(Math.round(v)))
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, inView, to, from, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
