'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Plus, Check, Flame, Snowflake, PackageOpen, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useBag } from '@/lib/bag-store'
import { brl } from '@/lib/format'
import { trackEvent } from '@/components/analytics'
import { cn } from '@/lib/utils'

export interface CardProduct {
  id: string
  slug: string
  name: string
  price: number
  oldPrice?: number | null
  minQuantity: number
  stock: number
  brand: { name: string; slug: string }
  category?: { name: string; slug: string } | null
  subCategory?: { name: string } | null
  images: { url: string }[]
  featured?: boolean
  isNew?: boolean
  onSale?: boolean
}

export function ProductCard({ product, priority = false }: { product: CardProduct; priority?: boolean }) {
  const add = useBag((s) => s.add)
  const [added, setAdded] = useState(false)
  const img = product.images[0]?.url
  const out = product.stock <= 0

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (out) return
    add(
      {
        productId: product.id, slug: product.slug, name: product.name,
        brand: product.brand.name, code: null, image: img ?? null,
        price: product.price, minQuantity: product.minQuantity,
      },
      product.minQuantity,
    )
    setAdded(true)
    trackEvent('add_to_bag', { item_id: product.id, item_name: product.name, brand: product.brand.name, value: product.price })
    window.dispatchEvent(new Event('bag-updated'))
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article className="card-3d card-shine group relative overflow-hidden rounded-lg border border-white/8 bg-card">
      <Link href={`/produto/${product.slug}`} className="block" aria-label={`Ver ${product.name}`}>
        <div className="card-zoom relative aspect-square overflow-hidden bg-[#0d0d0d]">
          {img ? (
            <Image
              src={img}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center"><PackageOpen className="h-10 w-10 text-neutral-800" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {product.isNew && <Badge className="border-0 bg-white text-black hover:bg-white"><Snowflake className="mr-1 h-3 w-3" />Novo</Badge>}
            {product.featured && <Badge className="border-0 bg-gold text-black hover:bg-gold"><Flame className="mr-1 h-3 w-3" />Destaque</Badge>}
            {product.onSale && product.oldPrice && <Badge className="border-0 bg-red-600 text-white hover:bg-red-600">-{Math.round((1 - product.price / product.oldPrice) * 100)}%</Badge>}
          </div>
          {out && (
            <div className="absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-[2px]">
              <span className="rounded border border-white/20 px-3 py-1.5 text-xs uppercase tracking-widest text-neutral-300">Sem estoque</span>
            </div>
          )}
        </div>

        <div className="space-y-2 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/90">{product.brand.name}</p>
          <h3 className="line-clamp-2 min-h-[2.6em] text-sm font-medium leading-snug text-neutral-100">{product.name}</h3>
          {product.category && <p className="text-[11px] text-neutral-500">{product.category.name}{product.subCategory ? ` • ${product.subCategory.name}` : ''}</p>}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-display text-lg font-bold text-white">{brl(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-neutral-500 line-through">{brl(product.oldPrice)}</span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500">
            {product.minQuantity > 1 ? `Pedido mínimo: ${product.minQuantity} un` : 'Pedido mínimo: 1 un'}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={onAdd}
          disabled={out}
          aria-label={`Adicionar ${product.name} à sacola`}
          className={cn(
            'group/btn relative flex h-11 w-full items-center justify-center gap-2.5 overflow-hidden rounded-md text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300',
            out
              ? 'cursor-not-allowed border border-white/8 bg-white/5 text-neutral-600'
              : added
                ? 'bg-emerald-500 text-black shadow-[0_0_24px_rgba(16,185,129,0.45)]'
                : 'btn-gold-premium text-black',
          )}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> Adicionado
            </>
          ) : out ? (
            <>Sem estoque</>
          ) : (
            <>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-black/25 transition-transform duration-300 group-hover/btn:scale-110">
                <Plus className="h-3.5 w-3.5" />
              </span>
              Adicionar pedido
              <ShoppingBag className="h-3.5 w-3.5 opacity-0 -ml-2 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:ml-0" />
            </>
          )}
        </button>
      </div>
    </article>
  )
}
