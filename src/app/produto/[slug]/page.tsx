import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical } from '@/lib/seo'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProductGallery } from '@/components/product-gallery'
import { AddToBag } from '@/components/add-to-bag'
import { ProductGrid } from '@/components/product-grid'
import { Link2 } from 'lucide-react'

export const revalidate = 120

export async function generateStaticParams() {
  try {
    const products = await db.product.findMany({ where: { active: true }, select: { slug: true }, take: 300, orderBy: { soldCount: 'desc' } })
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const p = await db.product.findUnique({ where: { slug }, include: { brand: true, images: { take: 1, orderBy: { order: 'asc' } } } })
    if (!p) return buildMetadata({ title: 'Produto não encontrado', noIndex: true })
    return buildMetadata({
      title: `${p.name} — ${p.brand.name} | Atacado`,
      description: `${p.name} de ${p.brand.name} por ${p.price ? `R$ ${p.price.toFixed(2).replace('.', ',')}` : 'consulta'} no atacado. ${p.description?.slice(0, 150) || 'Produto original com preço de distribuidor para lojistas.'}`,
      path: `/produto/${p.slug}`,
      images: p.images[0]?.url ? [p.images[0].url] : undefined,
      type: 'product',
    })
  } catch {
    return buildMetadata({ title: 'Produto', noIndex: true })
  }
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await db.product.findUnique({
    where: { slug },
    include: { brand: true, category: true, subCategory: true, images: { orderBy: { order: 'asc' } } },
  })
  if (!p || !p.active) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: p.images.map((i) => i.url),
    description: p.description || p.name,
    sku: p.code || p.id,
    brand: { '@type': 'Brand', name: p.brand.name },
    offers: {
      '@type': 'Offer',
      url: canonical(`/produto/${p.slug}`),
      priceCurrency: 'BRL',
      price: p.price.toFixed(2),
      availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Aladdin Distribuidora Goiás LTDA' },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Início', url: canonical('/') },
        ...(p.category ? [{ name: p.category.name, url: canonical(`/categoria/${p.category.slug}`) }] : []),
        { name: p.name, url: canonical(`/produto/${p.slug}`) },
      ])) }} />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        <Breadcrumbs items={[
          { name: 'Início', href: '/' },
          { name: 'Catálogo', href: '/catalogo' },
          ...(p.category ? [{ name: p.category.name, href: `/categoria/${p.category.slug}` }] : []),
          { name: p.brand.name, href: `/marca/${p.brand.slug}` },
          { name: p.name },
        ]} />

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <ProductGallery images={p.images.map((i) => i.url)} name={p.name} />
          <div>
            <Link href={`/marca/${p.brand.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold hover:text-gold-light">
              {p.brand.name} <Link2 className="h-3.5 w-3.5" />
            </Link>
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-4xl">{p.name}</h1>
            {p.subCategory && <p className="mt-2 text-sm text-neutral-500">{p.category?.name} • {p.subCategory.name}{p.code ? ` • Cód. ${p.code}` : ''}</p>}

            <AddToBag
              product={{
                id: p.id, slug: p.slug, name: p.name, brand: p.brand.name, image: p.images[0]?.url ?? null,
                price: p.price, oldPrice: p.oldPrice, stock: p.stock, unit: p.unit, minQuantity: p.minQuantity,
                isNew: p.isNew, featured: p.featured,
              }}
            />

            {p.description && (
              <div className="mt-8 border-t border-white/8 pt-6">
                <h2 className="kicker mb-3">Sobre o produto</h2>
                <p className="leading-relaxed text-neutral-300">{p.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* related */}
        <section className="mt-20" aria-label="Produtos relacionados">
          <h2 className="mb-8 font-display text-2xl font-bold text-white">Quem viu, <span className="text-gold-gradient">também levou</span></h2>
          <Suspense>
            <ProductGrid query={{ marca: p.brand.slug }} perPage={8} />
          </Suspense>
        </section>
      </div>
    </>
  )
}
