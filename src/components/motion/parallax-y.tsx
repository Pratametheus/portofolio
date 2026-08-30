'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {motion, useScroll, useTransform} from 'motion/react';
import {REVEAL_TRAVEL} from '@/lib/motion';
import {usePrefersReducedMotion} from './use-reduced-motion';

/**
 * Nudges its children along the Y axis as the wrapper scrolls past — a quiet
 * depth cue, capped at the motion vocabulary's travel budget. Mirrors
 * ScrollSpin: SSR / no-JS / reduced-motion render the same wrapper with no
 * transform. Give the wrapper a bleed (e.g. `-inset-4`) so the shift stays
 * covered.
 */
export function ParallaxY({
  children,
  distance = REVEAL_TRAVEL,
  className
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const animate = mounted && !reduce;

  const ref = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({target: ref, offset: ['start end', 'end start']});
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  // Stable structure — see ScrollSpin. The MotionValue attaches only once motion
  // is allowed; the element type and nesting never change across renders.
  return (
    <div ref={ref} className={className}>
      <motion.div
        className="relative h-full w-full"
        style={animate ? {y} : undefined}
        initial={false}
      >
        {children}
      </motion.div>
    </div>
  );
}
