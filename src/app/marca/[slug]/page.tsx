import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical } from '@/lib/seo'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProductGrid } from '@/components/product-grid'
import { Suspense } from 'react'

export const revalidate = 300

export async function generateStaticParams() {
  try {
    const brands = await db.brand.findMany({ select: { slug: true }, take: 100 })
    return brands.map((b) => ({ slug: b.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const brand = await db.brand.findUnique({ where: { slug } })
    if (!brand) return buildMetadata({ title: 'Marca não encontrada', noIndex: true })
    return buildMetadata({
      title: `${brand.name} no atacado — catálogo oficial na Aladdin Distribuidora`,
      description: `${brand.tagline || ''} Compre ${brand.name} no atacado para sua tabacaria ou headshop: ${brand.description?.slice(0, 140) || 'produtos originais com preço de distribuidor'}.`.slice(0, 300),
      path: `/marca/${brand.slug}`,
    })
  } catch {
    return buildMetadata({ title: 'Marca', noIndex: true })
  }
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brand = await db.brand.findUnique({
    where: { slug },
    include: {
      products: { where: { active: true }, take: 1, orderBy: { soldCount: 'desc' }, include: { images: { take: 1, orderBy: { order: 'asc' } } } },
      videos: { orderBy: { order: 'asc' } },
    },
  })
  if (!brand) notFound()

  const categories = await db.product.groupBy({
    by: ['categoryId'], where: { brandId: brand.id, active: true, categoryId: { not: null } },
  })
  const catDetails = categories.length > 0
    ? await db.category.findMany({ where: { id: { in: categories.map((c) => c.categoryId!) } }, select: { slug: true, name: true } })
    : []
  const total = await db.product.count({ where: { brandId: brand.id, active: true } })
  const heroImg = brand.coverUrl || brand.products[0]?.images[0]?.url || undefined

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Início', url: canonical('/') },
        { name: 'Marcas', url: canonical('/marcas') },
        { name: brand.name, url: canonical(`/marca/${brand.slug}`) },
      ])) }} />

      {/* Brand banner */}
      <section className="relative overflow-hidden noise">
        <div className="relative h-[46vh] min-h-72 w-full">
          {heroImg && (
            <Image src={heroImg} alt={`Linha ${brand.name}`} fill priority sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="smoke-blob absolute right-[10%] top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.16),transparent_65%)]" aria-hidden />
        </div>
        <div className="mx-auto -mt-32 max-w-7xl px-4 sm:px-6">
          <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Marcas', href: '/marcas' }, { name: brand.name }]} />
          <div className="glass relative z-10 rounded-2xl p-8 sm:p-12">
            <p className="kicker">Marca exclusiva no catálogo</p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-wide text-gold-gradient sm:text-7xl">{brand.name}</h1>
            {brand.tagline && <p className="mt-3 text-lg text-neutral-300">{brand.tagline}</p>}
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-neutral-400">
              <span><strong className="font-display text-xl text-gold">{total}</strong> produtos disponíveis</span>
              {catDetails.length > 0 && <span><strong className="font-display text-xl text-gold">{catDetails.length}</strong> categorias atendidas</span>}
              <span className="uppercase tracking-widest text-gold">Envio Brasil</span>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      {brand.description && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-label={`Sobre a marca ${brand.name}`}>
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">A história da <span className="text-gold-gradient">{brand.name}</span></h2>
              <p className="mt-4 leading-relaxed text-neutral-300">{brand.description}</p>
            </div>
            <div className="glass h-fit rounded-xl p-6">
              <h3 className="kicker mb-3">Por que revender</h3>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex gap-2"><span className="text-gold">✦</span> Produto original com nota fiscal</li>
                <li className="flex gap-2"><span className="text-gold">✦</span> Preço progressivo por volume</li>
                <li className="flex gap-2"><span className="text-gold">✦</span> Reposição rápida de giro</li>
                <li className="flex gap-2"><span className="text-gold">✦</span> Displays oficiais quando disponíveis</li>
              </ul>
              <Link href={`/catalogo?marca=${brand.slug}`} className="mt-5 block rounded-md bg-gold py-2.5 text-center text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-gold-light">
                Ver só {brand.name} no catálogo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories chips */}
      {catDetails.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-label="Categorias da marca">
          <div className="flex flex-wrap gap-2">
            {catDetails.map((c) => (
              <Link key={c.slug} href={`/catalogo?marca=${brand.slug}&cat=${c.slug}`} className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-neutral-300 transition-all hover:border-gold/60 hover:text-gold">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Videos */}
      {brand.videos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-label="Vídeos da marca">
          <h2 className="font-display text-2xl font-bold text-white">Vídeos <span className="text-gold-gradient">{brand.name}</span></h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {brand.videos.map((v) => (
              <div key={v.id} className="aspect-video overflow-hidden rounded-xl border border-white/8">
                <iframe
                  src={`https://www.youtube.com/embed/${v.youtubeUrl.replace(/^.*(?:youtu\.be\/|v=|embed\/)([\w-]+).*$/, '$1')}`}
                  title={v.title}
                  allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-label={`Produtos ${brand.name}`}>
        {brand.slug === 'black-erva' ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold text-white">
                Ervas Mate <span className="text-gold-gradient">em destaque</span>
              </h2>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Linha premium</span>
            </div>
            <p className="mb-8 max-w-2xl text-sm text-neutral-400">
              A linha de ervas da BLACK ERVA primeiro — depois os acessórios de chimarrão e tereré que completam o balcão.
            </p>
            <Suspense>
              <ProductGrid query={{ marca: brand.slug, grupo: 'ervas' }} perPage={1000} />
            </Suspense>
            <h2 className="mb-6 mt-14 font-display text-2xl font-bold text-white">
              Acessórios <span className="text-gold-gradient">de chimarrão & tereré</span>
            </h2>
            <Suspense>
              <ProductGrid query={{ marca: brand.slug, grupo: 'acessorios' }} perPage={1000} />
            </Suspense>
          </>
        ) : (
          <>
            <h2 className="mb-8 font-display text-2xl font-bold text-white">Produtos <span className="text-gold-gradient">{brand.name}</span></h2>
            <Suspense>
              <ProductGrid query={{ marca: brand.slug }} perPage={1000} />
            </Suspense>
          </>
        )}
      </section>
    </>
  )
}
