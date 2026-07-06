/**
 * Fixed full-viewport SVG noise texture over dark surfaces (design.md §4).
 * pointer-events-none — kills the flat digital look. Static image (no
 * animation), so nothing to gate on prefers-reduced-motion.
 *
 * Uses `mix-blend-mode: screen` rather than `overlay`: overlay's blend math
 * collapses toward zero when the base pixel is near-black (our #050505/#0A0A0A
 * canvas), so the grain was mathematically present but visually imperceptible.
 * Screen instead lifts near-black pixels by the noise value, so the speckle
 * actually reads against the near-black canvas.
 */
export function GrainOverlay() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.07,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        zIndex: 30,
      }}
    >
      <filter id="vg-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#vg-grain)" />
    </svg>
  )
}
