// A tileable fractal-noise field as a data URI — no network, no asset.
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E";

/**
 * Full-viewport grain, kept faint (opacity ~0.035) so it reads as texture on
 * both themes. A slow positional drift plays only when motion is safe — the
 * global `prefers-reduced-motion` rule in globals.css also freezes it. Purely
 * decorative: aria-hidden, not focusable, no text, no pointer events.
 */
export function Noise() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] mix-blend-soft-light opacity-[0.035] motion-safe:animate-[grain_8s_steps(6)_infinite]"
      style={{backgroundImage: `url("${GRAIN}")`}}
    />
  );
}
