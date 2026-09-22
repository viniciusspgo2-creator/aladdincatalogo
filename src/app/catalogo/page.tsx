import { Suspense } from 'react'
import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical } from '@/lib/seo'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { FilterBar } from '@/components/filter-bar'
import { CatalogClient } from '@/components/catalog-client'

export const metadata = buildMetadata({
  title: 'Catálogo B2B — +1.500 produtos de tabacaria e headshop no atacado',
  description:
    'Catálogo completo para lojistas: sedas, fumos, narguilés, vidro, carvão, incensos, isqueiros e mais. Filtre por marca, categoria, preço e disponibilidade. Preço de atacado em tempo real.',
  path: '/catalogo',
})

export const revalidate = 300

export default async function CatalogoPage() {
  let brands: { slug: string; name: string }[] = []
  let cats: { slug: string; name: string; subs: { slug: string; name: string }[] }[] = []
  try {
    ;[brands, cats] = await Promise.all([
      db.brand.findMany({ orderBy: { name: 'asc' }, select: { slug: true, name: true } }),
      db.category.findMany({ orderBy: { order: 'asc' }, select: { slug: true, name: true, subs: { orderBy: { order: 'asc' }, select: { slug: true, name: true } } } }),
    ])
  } catch (e) {
    console.error('catalogo filters error', e)
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Início', url: canonical('/') },
        { name: 'Catálogo', url: canonical('/catalogo') },
      ])) }} />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Catálogo' }]} />
        <p className="kicker mt-6">Catálogo B2B completo</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
          Tudo em <span className="text-gold-gradient">tabacaria & headshop</span>
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Filtre por marca, categoria, preço e disponibilidade. Adicione à sacola e gere seu pedido PDF em segundos.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          <Suspense fallback={<div className="hidden lg:block w-60" />}>
            <FilterBar brands={brands} categories={cats} />
          </Suspense>
          <Suspense fallback={<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="aspect-square animate-pulse rounded-lg bg-white/[0.03]" />)}</div>}>
            <CatalogClient />
          </Suspense>
        </div>
      </div>
    </>
  )
}
