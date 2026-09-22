import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical, SITE } from '@/lib/seo'
import { dateBR } from '@/lib/format'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 600

export async function generateStaticParams() {
  try {
    const posts = await db.blogPost.findMany({ where: { published: true }, select: { slug: true } })
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const post = await db.blogPost.findUnique({ where: { slug } })
    if (!post) return buildMetadata({ title: 'Artigo não encontrado', noIndex: true })
    return buildMetadata({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      type: 'article',
    })
  } catch {
    return buildMetadata({ title: 'Blog', noIndex: true })
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await db.blogPost.findUnique({ where: { slug } })
  if (!post || !post.published) notFound()

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { '@type': 'Organization', name: post.author, url: SITE.url },
    publisher: { '@type': 'Organization', name: SITE.legalName, url: SITE.url },
    mainEntityOfPage: canonical(`/blog/${post.slug}`),
    inLanguage: 'pt-BR',
    articleSection: post.category,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Início', url: canonical('/') }, { name: 'Blog', url: canonical('/blog') }, { name: post.title, url: canonical(`/blog/${post.slug}`) },
      ])) }} />
      <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Blog', href: '/blog' }, { name: post.title }]} />
        <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
          <span className="text-gold">{post.category}</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-500">{post.readTime} min de leitura</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-500">{dateBR(post.publishedAt)}</span>
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-400">{post.excerpt}</p>

        <div className="mt-4 flex items-center gap-3 border-b border-white/8 pb-8">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 font-display font-bold text-gold">A</span>
          <div>
            <p className="text-sm font-semibold text-neutral-200">{post.author}</p>
            <p className="text-xs text-neutral-500">{SITE.legalName} — distribuidora premium de tabacaria & headshop</p>
          </div>
        </div>

        <div className="prose-gold mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.keywords && (
          <p className="mt-10 text-xs text-neutral-600">
            <span className="text-neutral-500">Palavras-chave:</span> {post.keywords}
          </p>
        )}

        <div className="glass-gold mt-12 rounded-xl p-7 text-center">
          <p className="font-display text-xl font-bold text-white">Pronto para repor seu estoque?</p>
          <p className="mt-2 text-sm text-neutral-300">Acesse o catálogo com +1.500 produtos de tabacaria e headshop com preço de atacado.</p>
          <Link href="/catalogo" className="mt-4 inline-block rounded-md bg-gold px-8 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-light">
            Abrir catálogo B2B
          </Link>
        </div>

        <Link href="/blog" className="mt-10 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Voltar ao blog
        </Link>
      </article>
    </>
  )
}
