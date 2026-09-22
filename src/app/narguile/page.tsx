import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical } from '@/lib/seo'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProductGrid } from '@/components/product-grid'
import { LineMenu } from '@/components/line-menu'
import { ArrowRight } from 'lucide-react'

export const revalidate = 300

export const metadata = buildMetadata({
  title: 'Narguilé no atacado — vasos, stems, rosh e abafadores | Aladdin',
  description:
    'Mundo Narguilé Aladdin: vasos, stems, vitihas, abafadores, piteiras e acessórios das marcas que dominam o balcão — Squadafum, Black Hookah, Zeus, Kaloud e mais com preço de distribuidor.',
  path: '/narguile',
})

export default async function NarguilePage() {
  let subs: { id: string; name: string; slug: string; _count: { products: number } }[] = []
  let total = 0
  try {
    const cat = await db.category.findUnique({ where: { slug: 'narguile' }, include: { subs: true } })
    if (cat) {
      total = await db.product.count({ where: { active: true, categoryId: cat.id } })
      const withCount = await Promise.all(
        cat.subs.map(async (s) => ({
          id: s.id, name: s.name, slug: s.slug,
          _count: { products: await db.product.count({ where: { active: true, subCategoryId: s.id } }) },
        })),
      )
      subs = withCount.filter((s) => s._count.products > 0).sort((a, b) => b._count.products - a._count.products)
    }
  } catch (e) {
    console.error('narguile page', e)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: 'Início', url: canonical('/') },
          { name: 'Narguilé', url: canonical('/narguile') },
        ])) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden noise" aria-label="Mundo Narguilé">
        <div className="relative h-[52vh] min-h-80 w-full">
          <Image src="/artes/colecao-narguile.jpg" alt="Narguilé premium com detalhes em dourado" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25" />
          <div className="smoke-blob absolute right-[12%] top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.22),transparent_65%)]" aria-hidden />
        </div>
        <div className="mx-auto -mt-36 max-w-7xl px-4 sm:px-6">
          <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Narguilé' }]} />
          <div className="glass relative z-10 rounded-2xl p-8 sm:p-12">
            <p className="kicker">Mundo Narguilé</p>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase text-gold-gradient sm:text-6xl">Narguilé</h1>
            <p className="mt-3 max-w-2xl text-neutral-300">
              Vasos, stems, abafadores, vitihas e toda a mecânica das marcas que dominam o balcão.
              De {total.toLocaleString('pt-BR')} itens com preço de distribuidor e reposição rápida.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/catalogo?cat=narguile" className="btn-gold-premium inline-flex h-11 items-center rounded-md px-6 text-xs font-bold uppercase tracking-[0.2em] text-black">
                Ver tudo em filtros <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/headshop" className="inline-flex h-11 items-center rounded-md border border-white/15 px-6 text-xs font-bold uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:border-gold/50 hover:text-gold">
                Conhecer Headshop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategorias — menu compacto */}
      <LineMenu
        catSlug="narguile"
        ariaLabel="Linhas de narguilé"
        lines={subs.map((s) => ({ id: s.id, name: s.name, slug: s.slug, count: s._count.products }))}
      />

      {/* Produtos */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-label="Produtos de narguilé">
        <h2 className="mb-8 font-display text-2xl font-bold text-white">
          Os <span className="text-gold-gradient">queridinhos</span> do narguilé
        </h2>
        <Suspense>
          <ProductGrid query={{ cat: 'narguile' }} perPage={1000} />
        </Suspense>
      </section>
    </>
  )
}
