'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface BrandOpt { slug: string; name: string }
export interface CatOpt { slug: string; name: string; subs: { slug: string; name: string }[] }

const SORTS = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'novidades', label: 'Novidades' },
  { value: 'mais-vendidos', label: 'Mais vendidos' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
]

export function FilterBar({ brands, categories }: { brands: BrandOpt[]; categories: CatOpt[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)

  const setParam = useCallback(
    (key: string, value?: string) => {
      const sp = new URLSearchParams(params.toString())
      if (!value) sp.delete(key)
      else sp.set(key, value)
      sp.delete('page')
      router.push(`${pathname}?${sp.toString()}`, { scroll: false })
    },
    [params, pathname, router],
  )

  const current = (key: string) => params.get(key) || ''
  const activeCount = ['marca', 'cat', 'sub', 'min', 'max', 'disp', 'novidades', 'mais-vendidos'].filter((k) => params.get(k)).length
  const activeCat = categories.find((c) => c.slug === current('cat'))
  const [brandFilter, setBrandFilter] = useState('')

  const content = (
    <div className="space-y-7">
      <div>
        <h3 className="kicker mb-3">Ordenar por</h3>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setParam('ordem', s.value === 'relevancia' ? undefined : s.value)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs transition-all',
                (current('ordem') || 'relevancia') === s.value
                  ? 'border-gold bg-gold/15 text-gold'
                  : 'border-white/10 text-neutral-400 hover:border-gold/40 hover:text-gold',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="kicker mb-3">Disponibilidade</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setParam('disp', current('disp') ? undefined : '1')}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs transition-all',
              current('disp') ? 'border-gold bg-gold/15 text-gold' : 'border-white/10 text-neutral-400 hover:border-gold/40',
            )}
          >
            Só disponíveis
          </button>
          <button
            onClick={() => setParam('novidades', current('novidades') ? undefined : '1')}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs transition-all',
              current('novidades') ? 'border-gold bg-gold/15 text-gold' : 'border-white/10 text-neutral-400 hover:border-gold/40',
            )}
          >
            Novidades
          </button>
          <button
            onClick={() => setParam('mais-vendidos', current('mais-vendidos') ? undefined : '1')}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs transition-all',
              current('mais-vendidos') ? 'border-gold bg-gold/15 text-gold' : 'border-white/10 text-neutral-400 hover:border-gold/40',
            )}
          >
            Mais vendidos
          </button>
        </div>
      </div>

      <div>
        <h3 className="kicker mb-3">Marca</h3>
        {brands.length > 12 && (
          <Input
            placeholder="Filtrar marcas…"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="mb-2 h-9 border-white/10 bg-white/5 text-sm"
          />
        )}
        <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
          {brands
            .filter((b) => !brandFilter || b.name.toLowerCase().includes(brandFilter.toLowerCase()))
            .map((b) => (
              <button
                key={b.slug}
                onClick={() => setParam('marca', current('marca') === b.slug ? undefined : b.slug)}
                className={cn(
                  'block w-full rounded px-2.5 py-1.5 text-left text-sm transition-colors',
                  current('marca') === b.slug ? 'bg-gold/15 text-gold font-semibold' : 'text-neutral-400 hover:bg-white/5 hover:text-white',
                )}
              >
                {b.name}
              </button>
            ))}
        </div>
      </div>

      <div>
        <h3 className="kicker mb-3">Categoria</h3>
        <div className="space-y-1">
          {categories.map((c) => (
            <div key={c.slug}>
              <button
                onClick={() => setParam('cat', current('cat') === c.slug ? undefined : c.slug)}
                className={cn(
                  'block w-full rounded px-2.5 py-1.5 text-left text-sm transition-colors',
                  current('cat') === c.slug ? 'bg-gold/15 text-gold font-semibold' : 'text-neutral-400 hover:bg-white/5 hover:text-white',
                )}
              >
                {c.name}
              </button>
              {current('cat') === c.slug && c.subs.length > 0 && (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-gold/20 pl-3">
                  {c.subs.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => setParam('sub', current('sub') === s.slug ? undefined : s.slug)}
                      className={cn(
                        'block w-full rounded px-2 py-1 text-left text-xs transition-colors',
                        current('sub') === s.slug ? 'text-gold font-semibold' : 'text-neutral-500 hover:text-white',
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="kicker mb-3">Preço (R$)</h3>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} placeholder="mín" defaultValue={current('min')} onBlur={(e) => setParam('min', e.target.value || undefined)} className="h-9 border-white/10 bg-white/5 text-sm" />
          <span className="text-neutral-600">—</span>
          <Input type="number" min={0} placeholder="máx" defaultValue={current('max')} onBlur={(e) => setParam('max', e.target.value || undefined)} className="h-9 border-white/10 bg-white/5 text-sm" />
        </div>
      </div>

      {activeCount > 0 && (
        <Button variant="outline" onClick={() => router.push(pathname, { scroll: false })} className="w-full border-white/15 text-neutral-300 hover:text-gold">
          <X className="mr-1.5 h-4 w-4" /> Limpar filtros ({activeCount})
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* mobile sheet — CTA objetivo: “FILTRAR PEDIDOS” bem visível */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Abrir filtros do catálogo"
              className="filter-cta-mobile flex w-full items-center justify-between rounded-lg px-4 py-3.5 text-left transition-transform active:scale-[0.99]"
            >
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-gold text-black">
                  <SlidersHorizontal className="h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="block font-display text-sm font-bold uppercase tracking-[0.15em] text-white">
                    Filtrar e ordenar
                    {activeCount > 0 && <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-black">{activeCount} ativos</span>}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-gold/90">Toque aqui para abrir o menu de filtros</span>
                </span>
              </span>
              <span className="rounded-md border border-gold/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gold">Abrir</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto bg-coal border-white/10 p-6">
            <SheetTitle className="font-display text-lg text-white mb-6">Filtros</SheetTitle>
            {content}
          </SheetContent>
        </Sheet>
      </div>

      {/* desktop sidebar */}
      <aside className="hidden lg:block" aria-label="Filtros do catálogo">{content}</aside>
    </>
  )
}
