import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical } from '@/lib/seo'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { AllProductsClient, type BrandBlock } from '@/components/all-products-client'

export const revalidate = 300

export const metadata = buildMetadata({
  title: 'Todos os produtos — catálogo completo organizado por marca | Aladdin',
  description:
    'Catálogo geral Aladdin: +1.500 produtos de tabacaria e headshop organizados por marca — Squadafum, Black Hookah, Papelito, Zomo, Satya, ZGY Brasil e mais, com preço de atacado para lojistas.',
  path: '/produtos',
})

export default async function ProdutosPage() {
  let brands: BrandBlock[] = []
  try {
    const raw = await db.brand.findMany({
      where: { products: { some: { active: true } } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, _count: { select: { products: { where: { active: true } } } } },
    })
    brands = raw.map((b) => ({ id: b.id, name: b.name, slug: b.slug, count: b._count.products }))
  } catch (e) {
    console.error('produtos page', e)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: 'Início', url: canonical('/') },
          { name: 'Produtos', url: canonical('/produtos') },
        ])) }}
      />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Produtos' }]} />
        <p className="kicker mt-6">Catálogo geral</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
          Tudo junto, <span className="text-gold-gradient">organizado por marca</span>
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          O catálogo inteiro em uma única página — cada marca em sua seção, com preços de atacado e adição direta à sacola.
          Prefere navegar com filtros? Use o <a href="/catalogo" className="text-gold underline underline-offset-4 hover:text-gold-light">catálogo completo</a>.
        </p>

        <div className="mt-10">
          <AllProductsClient brands={brands} />
        </div>
      </div>
    </>
  )
}
