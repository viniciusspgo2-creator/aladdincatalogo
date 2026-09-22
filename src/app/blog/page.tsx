import Link from 'next/link'
import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical } from '@/lib/seo'
import { dateBR } from '@/lib/format'
import { Breadcrumbs } from '@/components/breadcrumbs'

export const metadata = buildMetadata({
  title: 'Blog Aladdin — guias, tendências e gestão para tabacarias e headshops',
  description:
    'Conteúdo de referência para lojistas: como abrir uma tabacaria, mix de produtos que vende, fumo de narguilé, sedas premium, headshop e mais. Direto da distribuidora que atende o segmento.',
  path: '/blog',
})

export const revalidate = 600

export default async function BlogPage() {
  let posts: { id: string; slug: string; title: string; excerpt: string; category: string; readTime: number; publishedAt: Date }[] = []
  try {
    posts = await db.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' } })
  } catch { /* fallback */ }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Início', url: canonical('/') }, { name: 'Blog', url: canonical('/blog') },
      ])) }} />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Blog' }]} />
        <p className="kicker mt-6">Aladdin Journal</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
          Conteúdo para <span className="text-gold-gradient">vender mais</span>
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Guias práticos, análise de produtos e tendências do segmento de tabacaria e headshop — escritos por quem distribui para centenas de lojas.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="card-3d card-shine group flex flex-col rounded-xl border border-white/8 bg-card p-7">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em]">
                <span className="text-gold">{p.category}</span>
                <span className="text-neutral-600">{p.readTime} min</span>
              </div>
              <h2 className="mt-4 font-display text-xl font-bold leading-snug text-white transition-colors group-hover:text-gold">{p.title}</h2>
              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-400">{p.excerpt}</p>
              <p className="mt-5 text-xs text-neutral-600">{dateBR(p.publishedAt)}</p>
            </Link>
          ))}
          {posts.length === 0 && <p className="text-neutral-500">Artigos em preparação…</p>}
        </div>
      </div>
    </>
  )
}
