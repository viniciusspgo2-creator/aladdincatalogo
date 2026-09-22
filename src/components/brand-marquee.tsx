'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface MarqueeBrand {
  name: string
  slug: string
  tagline?: string | null
  featured?: boolean
}

/** Single infinite row. dir=left → moves right→left; dir=right → moves left→right. */
function Row({ brands, dir, duration }: { brands: MarqueeBrand[]; dir: 'left' | 'right'; duration: number }) {
  const doubled = [...brands, ...brands]
  return (
    <div className="marquee-fade overflow-hidden py-2">
      <div
        className={cn('flex w-max gap-2.5 pr-2.5', dir === 'left' ? 'marquee-track-left' : 'marquee-track-right')}
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
      >
        {doubled.map((b, i) => (
          <Link
            key={`${b.slug}-${i}`}
            href={`/marca/${b.slug}`}
            aria-hidden={i >= brands.length}
            tabIndex={i >= brands.length ? -1 : 0}
            className="group relative flex h-14 min-w-36 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-gradient-to-b from-white/[0.055] via-white/[0.02] to-transparent px-5 transition-all duration-300 hover:border-gold/70 sm:h-16 sm:min-w-44 sm:px-6"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 10px rgba(0,0,0,0.5)' }}
          >
            {/* inner top light */}
            <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" aria-hidden />
            {/* hover gold aura */}
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(201,162,39,0.22),transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
            {/* hover inner frame */}
            <span className="pointer-events-none absolute inset-[3px] rounded-[4px] border border-gold/0 transition-colors duration-300 group-hover:border-gold/25" aria-hidden />
            <span className="relative font-display text-sm font-bold uppercase tracking-[0.18em] text-neutral-400 transition-all duration-300 group-hover:text-gold-gradient group-hover:tracking-[0.24em] sm:text-base">
              {b.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function BrandMarquee({ brands }: { brands: MarqueeBrand[] }) {
  if (brands.length === 0) return null
  const half = Math.ceil(brands.length / 2)
  const rowA = brands.slice(0, half)
  const rowB = brands.slice(half).length ? brands.slice(half) : brands.slice(0, half)
  return (
    <section aria-label="Marcas parceiras em destaque" className="relative py-10">
      <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6">
        <p className="kicker text-center">As marcas que movem o balcão</p>
        <h2 className="mt-3 text-center font-display text-3xl font-bold text-white sm:text-4xl">
          Um time <span className="text-gold-gradient">global</span> no seu estoque
        </h2>
      </div>
      <div className="marquee-paused space-y-0.5">
        <Row brands={rowA} dir="left" duration={48} />
        <Row brands={rowB} dir="right" duration={54} />
      </div>
    </section>
  )
}
