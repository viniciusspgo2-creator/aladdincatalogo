'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CommandDialog, CommandInput, CommandList, CommandGroup, CommandEmpty, CommandItem } from '@/components/ui/command'
import { Search, Tag, Layers, Store, Loader2, ArrowRight } from 'lucide-react'

interface Suggestion {
  products: { slug: string; name: string; brand: string; image?: string | null }[]
  brands: { slug: string; name: string }[]
  categories: { slug: string; name: string; sub?: string | null }[]
}

const EMPTY: Suggestion = { products: [], brands: [], categories: [] }

export function SearchCommand({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState('')
  const [data, setData] = useState<Suggestion>(EMPTY)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    // debounce curto: resultados aparecem já nas primeiras letras (ex: "seda")
    const id = setTimeout(async () => {
      const term = q.trim()
      if (term.length < 2) { setData(EMPTY); setPending(false); return }
      setPending(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=10`)
        if (res.ok) setData(await res.json())
        else setData(EMPTY)
      } catch { /* mantém o que tem */ } finally {
        setPending(false)
      }
    }, 100)
    return () => clearTimeout(id)
  }, [q, open])

  // limpa ao fechar para a próxima abertura começar do zero
  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => { setQ(''); setData(EMPTY) }, 200)
      return () => clearTimeout(id)
    }
  }, [open])

  const go = (url: string) => { onOpenChange(false); router.push(url) }

  const total = data.products.length + data.brands.length + data.categories.length
  const term = q.trim()

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
      className="bg-coal border-gold/20 max-w-xl mx-auto"
    >
      <div className="flex items-center gap-2 px-4 pt-4">
        <Search className="h-4 w-4 text-gold" />
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Busca inteligente</p>
        {pending && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-gold/70" />}
      </div>
      <CommandInput
        placeholder="Busque por produto, marca ou categoria… ex: “seda”"
        value={q}
        onValueChange={setQ}
        className="text-base"
        autoFocus
      />
      <CommandList className="max-h-[55vh] pb-2">
        {/* com shouldFilter=false, o vazio só aparece quando a API não retornou nada */}
        {term.length >= 2 && !pending && total === 0 && (
          <CommandEmpty>Nada encontrado para “{term}”. Tente outro termo, ex: “seda”, “carvão”, “zomo”.</CommandEmpty>
        )}
        {term.length < 2 && (
          <p className="px-4 py-6 text-center text-sm text-neutral-500">
            Digite 2 letras e os resultados já aparecem — não precisa digitar o nome completo.
          </p>
        )}

        {data.products.length > 0 && (
          <CommandGroup heading="Produtos">
            {data.products.map((p) => (
              <CommandItem key={p.slug} value={`produto-${p.slug}`} onSelect={() => go(`/produto/${p.slug}`)} className="gap-3">
                {p.image ? (
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40">
                    <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-black/40">
                    <Tag className="h-4 w-4 text-gold" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{p.name}</span>
                  <span className="block text-xs text-gold/80">{p.brand}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {data.brands.length > 0 && (
          <CommandGroup heading="Marcas">
            {data.brands.map((b) => (
              <CommandItem key={b.slug} value={`marca-${b.slug}`} onSelect={() => go(`/marca/${b.slug}`)} className="gap-2">
                <Store className="h-4 w-4 text-gold" />
                <span className="font-semibold">{b.name}</span>
                <span className="text-xs text-neutral-500">ver linha completa</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {data.categories.length > 0 && (
          <CommandGroup heading="Categorias">
            {data.categories.map((c) => (
              <CommandItem
                key={`${c.slug}-${c.sub ?? 'raiz'}`}
                value={`cat-${c.slug}-${c.sub ?? 'raiz'}`}
                onSelect={() => go(`/catalogo?cat=${c.slug}${c.sub ? `&sub=${c.sub}` : ''}`)}
                className="gap-2"
              >
                <Layers className="h-4 w-4 text-gold" />
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {term.length >= 2 && total > 0 && (
          <div className="border-t border-white/5 px-4 py-3">
            <button
              onClick={() => go(`/catalogo?q=${encodeURIComponent(term)}`)}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gold/30 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold/10"
            >
              Ver tudo para “{term}” no catálogo <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  )
}
