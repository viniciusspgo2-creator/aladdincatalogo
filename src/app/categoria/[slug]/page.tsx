import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical } from '@/lib/seo'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProductGrid } from '@/components/product-grid'
import Link from 'next/link'

export const revalidate = 300

export async function generateStaticParams() {
  try {
    const cats = await db.category.findMany({ select: { slug: true } })
    return cats.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const c = await db.category.findUnique({ where: { slug } })
    if (!c) return buildMetadata({ title: 'Categoria não encontrada', noIndex: true })
    return buildMetadata({
      title: `${c.name} no atacado — catálogo para lojistas | Aladdin`,
      description: `Compre ${c.name} no atacado para sua tabacaria ou headshop: marcas oficiais, preço de distribuidor, estoque real e reposição rápida. Monte seu pedido PDF em minutos.`,
      path: `/categoria/${c.slug}`,
    })
  } catch {
    return buildMetadata({ title: 'Categoria', noIndex: true })
  }
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = await db.category.findUnique({
    where: { slug },
    include: { subs: { orderBy: { order: 'asc' } } },
  })
  if (!cat) notFound()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Início', url: canonical('/') },
        { name: 'Catálogo', url: canonical('/catalogo') },
        { name: cat.name, url: canonical(`/categoria/${cat.slug}`) },
      ])) }} />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Catálogo', href: '/catalogo' }, { name: cat.name }]} />
        <p className="kicker mt-6">Categoria</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
          <span className="text-gold-gradient">{cat.name}</span> no atacado
        </h1>
        {cat.subs.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {cat.subs.map((s) => (
              <Link key={s.id} href={`/catalogo?cat=${cat.slug}&sub=${s.slug}`} className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-neutral-300 transition-all hover:border-gold/60 hover:text-gold">
                {s.name}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-10">
          <Suspense>
            <ProductGrid query={{ cat: cat.slug }} perPage={1000} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
