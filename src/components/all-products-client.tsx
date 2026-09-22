'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductGrid } from '@/components/product-grid'
import { cn } from '@/lib/utils'

export interface BrandBlock {
  id: string
  name: string
  slug: string
  count: number
}

/** Seção de marca com carregamento lazy via IntersectionObserver. */
function BrandSection({ brand, index }: { brand: BrandBlock; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(index < 2)

  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      const t = setTimeout(() => setVisible(true), 0)
      return () => clearTimeout(t)
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true)
            obs.disconnect()
          }
        }
      },
      { rootMargin: '400px 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [visible])

  return (
    <div ref={ref} id={`marca-${brand.slug}`} className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-white/8 pb-3">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
            {brand.name}
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {brand.count.toLocaleString('pt-BR')} produto{brand.count === 1 ? '' : 's'} no catálogo
          </p>
        </div>
        <Link
          href={`/marca/${brand.slug}`}
          className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold hover:text-gold-light"
        >
          Página da marca
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      {visible ? (
        <ProductGrid query={{ marca: brand.slug }} perPage={1000} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-white/5 bg-card">
              <div className="aspect-square bg-white/[0.03]" />
              <div className="space-y-2 p-4"><div className="h-3 w-1/3 bg-white/10 rounded" /><div className="h-4 w-full bg-white/5 rounded" /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AllProductsClient({ brands, query }: { brands: BrandBlock[]; query?: string }) {
  const [filter, setFilter] = useState('')
  const q = filter.trim().toLowerCase()
  const shown = q ? brands.filter((b) => b.name.toLowerCase().includes(q)) : brands

  return (
    <div>
      {/* navegação por marca */}
      <div className="sticky top-16 z-30 -mx-4 mb-10 border-y border-white/8 bg-background/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Pular para a marca…"
            aria-label="Filtrar marcas na página"
            className="h-9 w-44 shrink-0 rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-white placeholder:text-neutral-500 focus:border-gold/50 focus:outline-none"
          />
          <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {brands.map((b, i) => (
              <a
                key={b.id}
                href={`#marca-${b.slug}`}
                className={cn(
                  'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-all',
                  q && !b.name.toLowerCase().includes(q)
                    ? 'pointer-events-none opacity-25'
                    : 'border-white/10 text-neutral-400 hover:border-gold/50 hover:text-gold',
                  i % 2 === 0 ? '' : '',
                )}
              >
                {b.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* seções por marca */}
      <div className="space-y-14">
        {shown.map((b, i) => (
          <BrandSection key={b.id} brand={b} index={i} />
        ))}
        {shown.length === 0 && (
          <p className="py-16 text-center text-sm text-neutral-500">Nenhuma marca encontrada para “{filter}”.</p>
        )}
      </div>

      {query && (
        <p className="mt-10 text-center text-xs text-neutral-600">Exibindo todas as marcas com produtos ativos no catálogo.</p>
      )}
    </div>
  )
}
