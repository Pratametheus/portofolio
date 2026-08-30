'use client';

import {useRef, type PointerEvent, type ReactNode} from 'react';
import {DUR} from '@/lib/motion';

/**
 * Hover treatment for media tiles: a cursor-tracked radial highlight plus a
 * small lift. Pure CSS/DOM — no `motion` import. The lift and glare are gated
 * behind `motion-safe:` / `motion-reduce:` so reduced-motion users get a static
 * card. Content renders with no JS; only the highlight position needs script.
 */
export function GlareCard({children, className}: {children: ReactNode; className?: string}) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.width ? ((event.clientX - rect.left) / rect.width) * 100 : 50;
    const y = rect.height ? ((event.clientY - rect.top) / rect.height) * 100 : 50;
    el.style.setProperty('--glare-x', `${x}%`);
    el.style.setProperty('--glare-y', `${y}%`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      style={{transitionDuration: `${DUR.base}s`}}
      className={[
        'group relative isolate transition-transform ease-out',
        'motion-safe:hover:-translate-y-1',
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 bg-[radial-gradient(220px_circle_at_var(--glare-x,50%)_var(--glare-y,50%),color-mix(in_oklab,var(--color-fg)_14%,transparent),transparent_65%)] group-hover:opacity-100 motion-reduce:hidden"
      />
      {children}
    </div>
  );
}
