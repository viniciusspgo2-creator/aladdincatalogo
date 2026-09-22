import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { SITE } from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url
  const statics: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: 'daily', priority: 0.95 },
    { url: `${base}/produtos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/narguile`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/headshop`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/marcas`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/sobre`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contato`, changeFrequency: 'monthly', priority: 0.7 },
  ]

  try {
    const [brands, categories, products, posts] = await Promise.all([
      db.brand.findMany({ select: { slug: true, updatedAt: true } }),
      db.category.findMany({ select: { slug: true, updatedAt: true } }),
      db.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true }, take: 5000 }),
      db.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    ])

    return [
      ...statics,
      ...brands.map((b) => ({ url: `${base}/marca/${b.slug}`, lastModified: b.updatedAt, changeFrequency: 'weekly' as const, priority: 0.85 })),
      ...categories.map((c) => ({ url: `${base}/categoria/${c.slug}`, lastModified: c.updatedAt, changeFrequency: 'weekly' as const, priority: 0.85 })),
      ...products.map((p) => ({ url: `${base}/produto/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'daily' as const, priority: 0.7 })),
      ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ]
  } catch (e) {
    // DB empty/unstable on first deploy — return statics so build never breaks
    console.error('sitemap db error', e)
    return statics
  }
}
