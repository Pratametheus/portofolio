'use client';

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {motion} from 'motion/react';
import {DUR, EASE, REVEAL_TRAVEL, STAGGER_STEP} from '@/lib/motion';
import {usePrefersReducedMotion} from './use-reduced-motion';

type Tag = 'div' | 'section' | 'li';

const VIEWPORT = {once: true, margin: '0px 0px -10% 0px'} as const;

/** True when a <Stagger> ancestor is driving the reveal timeline. */
const StaggerContext = createContext(false);

/** Flips true after the first client render. */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function Reveal({
  children,
  as = 'div',
  delay = 0,
  index,
  scaleIn = false,
  className
}: {
  children: ReactNode;
  as?: Tag;
  delay?: number;
  index?: number;
  scaleIn?: boolean;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const mounted = useMounted();
  const inStagger = useContext(StaggerContext);
  const animate = mounted && !reduce;

  const MotionTag = motion[as];
  const settleDelay = index != null ? index * STAGGER_STEP : delay;
  const variants = {
    hidden: {opacity: 0.001, y: REVEAL_TRAVEL, ...(scaleIn ? {scale: 0.98} : {})},
    show: {
      opacity: 1,
      y: 0,
      ...(scaleIn ? {scale: 1} : {}),
      transition: {duration: DUR.base, ease: EASE, delay: settleDelay}
    }
  };

  // The element type never changes across renders — it is always `motion[as]`.
  // Server, pre-mount and reduced-motion just omit the animation props, so the
  // node renders clean (no opacity:0, no transform) and hydration mutates it in
  // place instead of replacing or reparenting it.
  if (!animate) {
    return (
      <MotionTag className={className} initial={false}>
        {children}
      </MotionTag>
    );
  }

  // Inside a <Stagger> the parent propagates the "hidden"/"show" labels and the
  // stagger offset; standalone, the element triggers itself on scroll-in.
  return inStagger ? (
    <MotionTag className={className} variants={variants}>
      {children}
    </MotionTag>
  ) : (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </MotionTag>
  );
}

export function Stagger({
  children,
  as = 'div',
  className
}: {
  children: ReactNode;
  as?: Tag;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const mounted = useMounted();
  const animate = mounted && !reduce;

  const MotionTag = motion[as];

  return (
    <StaggerContext.Provider value={true}>
      {animate ? (
        <MotionTag
          className={className}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={{hidden: {}, show: {transition: {staggerChildren: STAGGER_STEP}}}}
        >
          {children}
        </MotionTag>
      ) : (
        <MotionTag className={className} initial={false}>
          {children}
        </MotionTag>
      )}
    </StaggerContext.Provider>
  );
}
