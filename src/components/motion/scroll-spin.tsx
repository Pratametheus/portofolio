'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {motion, useScroll, useTransform} from 'motion/react';
import {usePrefersReducedMotion} from './use-reduced-motion';

/**
 * Wraps the hero key-ring art and drifts it a few degrees as the section
 * scrolls past — a gentle tie to scroll position, not a spin. SSR / no-JS /
 * reduced-motion: the same wrapper, no transform. `'use client'` is enough; it
 * hydrates lazily as a client island.
 */
export function ScrollSpin({
  children,
  max = 18,
  className
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const animate = mounted && !reduce;

  const ref = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({target: ref, offset: ['start end', 'end start']});
  const rotate = useTransform(scrollYProgress, [0, 1], [0, max]);

  // Stable structure: the wrapper + inner layer always render the same way; the
  // rotation MotionValue is only attached once motion is allowed, so hydration
  // mutates the node in place rather than reparenting the children.
  return (
    <div ref={ref} className={className}>
      <motion.div
        className="relative h-full w-full"
        style={animate ? {rotate} : undefined}
        initial={false}
      >
        {children}
      </motion.div>
    </div>
  );
}
