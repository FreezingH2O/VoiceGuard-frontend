import { cn } from '@/lib/cn'

/**
 * Slow-drifting coral/blue gradient blobs + faint grid behind hero and CTA bands
 * (design.md §4). Low opacity, pointer-events-none, decorative. The `drift`
 * keyframe is frozen under reduced motion by the global CSS rule.
 */
export function AmbientBackground({
  className,
  variant = 'hero',
}: {
  className?: string
  variant?: 'hero' | 'band'
}) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {/* faint grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
        }}
      />
      {/* drifting blobs */}
      <div className="absolute -left-32 -top-24 h-[520px] w-[520px] animate-drift rounded-full bg-blue-500/25 blur-[120px]" />
      <div
        className="absolute -right-24 top-10 h-[460px] w-[460px] animate-drift rounded-full bg-coral-500/20 blur-[130px]"
        style={{ animationDelay: '-8s' }}
      />
      {variant === 'hero' && (
        <div
          className="absolute left-1/3 top-40 h-[380px] w-[380px] animate-drift rounded-full bg-teal-400/10 blur-[120px]"
          style={{ animationDelay: '-16s' }}
        />
      )}
    </div>
  )
}
