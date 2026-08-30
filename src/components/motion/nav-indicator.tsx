'use client';

import type {ReactNode} from 'react';
import {LayoutGroup, motion} from 'motion/react';
import {DUR, EASE} from '@/lib/motion';
import {usePrefersReducedMotion} from './use-reduced-motion';

/**
 * Shared layout context for the active-nav pill. Renders no DOM of its own —
 * it just scopes the `layoutId` so the pill animates between items on route
 * change.
 */
export function NavIndicatorGroup({children}: {children: ReactNode}) {
  return <LayoutGroup id="nav">{children}</LayoutGroup>;
}

/**
 * The pill background for the active nav item. Decorative (`aria-hidden`); the
 * label stays the accessible target. With `layoutId`, `motion` slides it from
 * the previously-active item. Reduced motion: it still appears on the active
 * item, just without the slide.
 */
export function NavIndicator({className}: {className?: string}) {
  const reduce = usePrefersReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      data-testid="nav-indicator"
      layoutId="nav-indicator"
      transition={reduce ? {duration: 0} : {duration: DUR.base, ease: EASE}}
      className={className}
    />
  );
}
