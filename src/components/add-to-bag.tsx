'use client'

import { useState } from 'react'
import { Minus, Plus, Check, ShoppingBag, Truck, Flame, Snowflake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useBag } from '@/lib/bag-store'
import { brl } from '@/lib/format'
import { trackEvent } from '@/components/analytics'
import { cn } from '@/lib/utils'

interface P {
  id: string; slug: string; name: string; brand: string; image: string | null
  price: number; oldPrice?: number | null; stock: number; unit: string; minQuantity: number
}

export function AddToBag({ product }: { product: P }) {
  const add = useBag((s) => s.add)
  const [qty, setQty] = useState(product.minQuantity || 1)
  const [added, setAdded] = useState(false)
  const out = product.stock <= 0

  const handleAdd = () => {
    add(
      { productId: product.id, slug: product.slug, name: product.name, brand: product.brand, code: null, image: product.image, price: product.price, minQuantity: product.minQuantity },
      qty,
    )
    setAdded(true)
    trackEvent('add_to_bag', { item_id: product.id, item_name: product.name, brand: product.brand, value: product.price * qty, quantity: qty })
    window.dispatchEvent(new Event('bag-updated'))
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-display text-4xl font-bold text-white">{brl(product.price)}</span>
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="text-lg text-neutral-500 line-through">{brl(product.oldPrice)}</span>
        )}
        <span className="text-sm text-neutral-500">/ {product.unit}</span>
      </div>
      <p className="mt-1.5 text-xs text-neutral-500">Preço de atacado • Pedido mínimo de {product.minQuantity} un por item</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-md border border-white/12 bg-white/[0.04]">
          <button onClick={() => setQty(Math.max(product.minQuantity, qty - 1))} disabled={out} aria-label="Diminuir quantidade" className="grid h-full w-11 place-items-center text-neutral-300 hover:text-gold disabled:opacity-30"><Minus className="h-4 w-4" /></button>
          <input
            type="number"
            value={qty}
            min={product.minQuantity}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            aria-label="Quantidade"
            className="h-full w-14 bg-transparent text-center font-display text-lg font-bold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button onClick={() => setQty(qty + 1)} disabled={out} aria-label="Aumentar quantidade" className="grid h-full w-11 place-items-center text-neutral-300 hover:text-gold disabled:opacity-30"><Plus className="h-4 w-4" /></button>
        </div>

        <button
          onClick={handleAdd}
          disabled={out}
          className={cn(
            'group/btn relative flex h-14 flex-1 min-w-52 items-center justify-center gap-3 overflow-hidden rounded-md text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300',
            out
              ? 'cursor-not-allowed border border-white/8 bg-white/5 text-neutral-600'
              : added
                ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                : 'btn-gold-premium text-black',
          )}
        >
          {out ? (
            'Sem estoque'
          ) : added ? (
            <><Check className="h-5 w-5" /> Adicionado à sacola</>
          ) : (
            <>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-black/25 transition-transform duration-300 group-hover/btn:scale-110">
                <ShoppingBag className="h-4 w-4" />
              </span>
              Adicionar pedido
              <span className="absolute right-0 top-0 h-full w-16 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.25),transparent)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" aria-hidden />
            </>
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {product.isNew && <Badge className="border-0 bg-white text-black"><Snowflake className="mr-1 h-3 w-3" />Novidade</Badge>}
        {product.featured && <Badge className="border-0 bg-gold text-black"><Flame className="mr-1 h-3 w-3" />Destaque</Badge>}
        <Badge variant="outline" className="border-white/15 text-neutral-300"><Truck className="mr-1 h-3 w-3 text-gold" />Envio Brasil</Badge>
        <Badge variant="outline" className={cn('border-white/15', product.stock > 0 ? 'text-neutral-300' : 'text-red-400')}>
          {product.stock > 0 ? `Estoque: ${product.stock} ${product.unit.toLowerCase()}` : 'Esgotado'}
        </Badge>
      </div>
    </div>
  )
}
