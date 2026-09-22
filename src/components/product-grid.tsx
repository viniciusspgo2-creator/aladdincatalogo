'use client'

import { useEffect, useState } from 'react'
import { Loader2, PackageOpen } from 'lucide-react'
import { ProductCard, type CardProduct } from '@/components/product-card'

interface ApiResp {
  products: CardProduct[]
  total: number
  page: number
  pageSize: number
}

/**
 * Grid de produtos com carregamento incremental.
 * - "Carregar mais" APENAS quando `loadMore` é true (usado só na página /catalogo).
 * - Novas páginas são ADICIONADAS ABAIXO das existentes (sem substituir nada),
 *   exatamente como o cliente pediu: os produtos descem, aparecem para baixo.
 */
export function ProductGrid({
  query,
  perPage = 24,
  loadMore = false,
}: {
  query: Record<string, string | undefined>
  perPage?: number
  loadMore?: boolean
}) {
  const [items, setItems] = useState<CardProduct[]>([])
  const [meta, setMeta] = useState<{ total: number; page: number; pageSize: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const cleanEntries = Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '') as [string, string][]
  const qs = new URLSearchParams([...cleanEntries, ['page', String(page)], ['pageSize', String(perPage)]]).toString()

  useEffect(() => {
    let alive = true
    const isAppend = page > 1
    const t = setTimeout(() => {
      if (isAppend) setLoadingMore(true)
      else setLoading(true)
      fetch(`/api/products?${qs}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('fail'))))
        .then((j: ApiResp) => {
          if (!alive) return
          setMeta({ total: j.total, page: j.page, pageSize: j.pageSize })
          setItems((prev) => {
            if (j.page > 1) {
              const seen = new Set(prev.map((p) => p.id))
              return [...prev, ...j.products.filter((p) => !seen.has(p.id))]
            }
            return j.products
          })
        })
        .catch(() => {
          if (!alive) return
          if (!isAppend) {
            setItems([])
            setMeta({ total: 0, page: 1, pageSize: perPage })
          }
        })
        .finally(() => {
          if (!alive) return
          setLoading(false)
          setLoadingMore(false)
        })
    }, 0)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [qs, perPage, page])

  const total = meta?.total ?? 0
  const shown = items.length
  const hasMore = meta ? shown < total : false

  if (loading && !meta) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-white/5 bg-card">
            <div className="aspect-square bg-white/[0.03]" />
            <div className="space-y-2 p-4"><div className="h-3 w-1/3 bg-white/10 rounded" /><div className="h-4 w-full bg-white/5 rounded" /><div className="h-4 w-1/2 bg-white/5 rounded" /></div>
          </div>
        ))}
      </div>
    )
  }

  if (!meta || items.length === 0) {
    return (
      <div className="grid place-items-center rounded-lg border border-dashed border-white/10 py-24 text-center">
        <PackageOpen className="mb-4 h-12 w-12 text-neutral-700" />
        <p className="font-display text-xl text-neutral-300">Nenhum produto encontrado</p>
        <p className="mt-2 text-sm text-neutral-500">Ajuste os filtros ou tente outro termo de busca.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        {loadMore && total > perPage ? (
          <p className="text-sm text-neutral-500">
            <span className="font-semibold text-gold">{shown.toLocaleString('pt-BR')}</span> de{' '}
            {total.toLocaleString('pt-BR')} produtos
            {loadingMore && <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-gold" />}
          </p>
        ) : (
          <p className="text-sm text-neutral-500">
            <span className="font-semibold text-gold">{total.toLocaleString('pt-BR')}</span> produtos
            {loadingMore && <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-gold" />}
          </p>
        )}
        {loadMore && hasMore && <p className="text-xs text-neutral-600">Role para conferir e carregue mais ao final</p>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4 && page === 1} />)}
      </div>
      {loadMore && total > perPage && (
        <div className="mt-10 flex justify-center">
          {hasMore ? (
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loadingMore}
              className="rounded-md border border-gold/40 px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-gold transition-all hover:bg-gold hover:text-black hover:shadow-[0_0_30px_-6px_rgba(201,162,39,0.5)] disabled:opacity-50"
            >
              {loadingMore ? 'Carregando…' : 'Carregar mais produtos'}
            </button>
          ) : (
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">Fim do catálogo ✦</p>
          )}
        </div>
      )}
    </div>
  )
}
