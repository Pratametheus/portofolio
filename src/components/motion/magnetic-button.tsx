'use client';

import {useEffect, useRef, useState, type PointerEvent, type ReactNode} from 'react';
import {motion, useSpring} from 'motion/react';
import {DUR} from '@/lib/motion';
import {usePrefersReducedMotion} from './use-reduced-motion';

const SPRING = {stiffness: 220, damping: 18, mass: 0.4};

/**
 * A primary CTA that eases toward the pointer and sweeps a shimmer on hover.
 * Renders a real <a> (with href) or <button type="button">, so keyboard focus
 * and activation are unchanged. SSR / no-JS / reduced-motion: a plain element,
 * no transform.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  className,
  strength = 0.25
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  strength?: number;
}) {
  const reduce = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const ref = useRef<HTMLElement>(null);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  const classes = ['relative isolate inline-flex items-center justify-center overflow-hidden', className]
    .filter(Boolean)
    .join(' ');

  if (reduce || !mounted) {
    return href ? (
      <a href={href} onClick={onClick} className={classes}>
        {children}
      </a>
    ) : (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }

  const shimmer = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 -translate-x-full bg-[linear-gradient(110deg,transparent,color-mix(in_oklab,var(--color-on-accent)_35%,transparent),transparent)] transition-transform duration-500 ease-out group-hover:translate-x-full"
    />
  );

  const common = {
    ref: ref as never,
    onClick,
    onPointerMove: handlePointerMove,
    onPointerLeave: reset,
    style: {x, y},
    transition: {duration: DUR.base},
    className: `group ${classes}`
  };

  return href ? (
    <motion.a href={href} {...common}>
      {shimmer}
      {children}
    </motion.a>
  ) : (
    <motion.button type="button" {...common}>
      {shimmer}
      {children}
    </motion.button>
  );
}
