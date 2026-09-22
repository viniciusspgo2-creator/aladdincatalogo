import Link from 'next/link'
import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical } from '@/lib/seo'
import { Breadcrumbs } from '@/components/breadcrumbs'

export const metadata = buildMetadata({
  title: 'Marcas — RAW, OCB, Squadafum, Zomo e +60 marcas no atacado',
  description:
    'Conheça todas as marcas oficiais do catálogo Aladdin: Squadafum, RAW, OCB, Zomo, Elements, Ziggy, Satya, Lion Rolling Circus e muito mais. Compre direto do distribuidor.',
  path: '/marcas',
})

export const revalidate = 600

export default async function MarcasPage() {
  let brands: { id: string; name: string; slug: string; tagline: string | null; featured: boolean; _count: { products: number } }[] = []
  try {
    brands = await db.brand.findMany({
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, tagline: true, featured: true, _count: { select: { products: { where: { active: true } } } } },
    })
  } catch (e) {
    console.error('marcas error', e)
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Início', url: canonical('/') }, { name: 'Marcas', url: canonical('/marcas') },
      ])) }} />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Marcas' }]} />
        <p className="kicker mt-6">Portfólio de marcas</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
          As <span className="text-gold-gradient">melhores marcas</span> do mundo, no seu estoque
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Todas as marcas do catálogo Aladdin com produtos originais, preço de distribuidor e reposição rápida.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/marca/${b.slug}`}
              className="card-3d card-shine group relative overflow-hidden rounded-lg border border-white/8 bg-card p-6"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(201,162,39,0.10),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100" />
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-neutral-200 transition-colors group-hover:text-gold">
                {b.name}
              </h2>
              {b.tagline && <p className="mt-1.5 line-clamp-2 text-xs text-neutral-500">{b.tagline}</p>}
              <p className="mt-3 text-[11px] uppercase tracking-widest text-gold/80">{b._count.products} produtos</p>
              {/* selo padrão — todos os cards iguais */}
              <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-gold/90 shadow-[0_0_8px_2px_rgba(201,162,39,0.55)]" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
