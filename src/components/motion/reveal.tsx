'use client';

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {motion} from 'motion/react';
import {DUR, EASE, REVEAL_TRAVEL, STAGGER_STEP} from '@/lib/motion';
import {usePrefersReducedMotion} from './use-reduced-motion';

type Tag = 'div' | 'section' | 'li';

const VIEWPORT = {once: true, margin: '0px 0px -10% 0px'} as const;

/** True when a <Stagger> ancestor is driving the reveal timeline. */
const StaggerContext = createContext(false);

/** Delays mounting the animated node so SSR / no-JS output is the plain, visible element. */
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
  className
}: {
  children: ReactNode;
  as?: Tag;
  delay?: number;
  index?: number;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const mounted = useMounted();
  const inStagger = useContext(StaggerContext);

  if (reduce || !mounted) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];
  const settleDelay = index != null ? index * STAGGER_STEP : delay;
  const variants = {
    hidden: {opacity: 0.001, y: REVEAL_TRAVEL},
    show: {opacity: 1, y: 0, transition: {duration: DUR.base, ease: EASE, delay: settleDelay}}
  };

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

  if (reduce || !mounted) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];
  return (
    <StaggerContext.Provider value={true}>
      <MotionTag
        className={className}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={{hidden: {}, show: {transition: {staggerChildren: STAGGER_STEP}}}}
      >
        {children}
      </MotionTag>
    </StaggerContext.Provider>
  );
}
