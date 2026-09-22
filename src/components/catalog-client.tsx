'use client'

import { useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/product-grid'

export function CatalogClient() {
  const params = useSearchParams()
  const query: Record<string, string | undefined> = {
    q: params.get('q') || undefined,
    marca: params.get('marca') || undefined,
    cat: params.get('cat') || undefined,
    sub: params.get('sub') || undefined,
    min: params.get('min') || undefined,
    max: params.get('max') || undefined,
    disp: params.get('disp') || undefined,
    novidades: params.get('novidades') || undefined,
    'mais-vendidos': params.get('mais-vendidos') || undefined,
    ordem: params.get('ordem') || undefined,
    destaque: params.get('destaque') || undefined,
  }
  const key = JSON.stringify(query)
  return <ProductGrid key={key} query={query} perPage={24} loadMore />
}
