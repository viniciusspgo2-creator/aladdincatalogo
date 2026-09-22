import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { searchTokens } from '@/lib/search'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || ''
  const limit = Math.min(12, Number(req.nextUrl.searchParams.get('limit') || 8))
  if (q.length < 2) return NextResponse.json({ products: [], brands: [], categories: [] })

  try {
    // tokens sem acento/caixa: "maçarico" e "macarico" buscam igual
    const tokens = searchTokens(q)

    if (tokens.length === 0) return NextResponse.json({ products: [], brands: [], categories: [] })

    const productWhere = {
      active: true,
      AND: tokens.map((t) => ({ searchNorm: { contains: t } })),
    }
    const brandWhere = { OR: tokens.map((t) => ({ searchNorm: { contains: t } })) }
    const catWhere = { OR: tokens.map((t) => ({ searchNorm: { contains: t } })) }
    const [products, brands, categories, subcats] = await Promise.all([
      db.product.findMany({
        where: productWhere,
        select: { slug: true, name: true, brand: { select: { name: true } }, images: { orderBy: { order: 'asc' }, take: 1, select: { url: true } } },
        orderBy: [{ featured: 'desc' }, { soldCount: 'desc' }],
        take: limit,
      }),
      db.brand.findMany({ where: brandWhere, select: { slug: true, name: true }, take: 4 }),
      db.category.findMany({ where: catWhere, select: { slug: true, name: true }, take: 3 }),
      // subcategorias ajudam termos como "bomba", "rosh", "sedas"
      db.subCategory.findMany({
        where: catWhere,
        select: { slug: true, name: true, category: { select: { slug: true, name: true } } },
        take: 3,
      }),
    ])

    const categoryResults = subcats.length > 0
      ? subcats.map((s) => ({ slug: s.category.slug, name: `${s.name} · ${s.category.name}`, sub: s.slug }))
      : categories.map((c) => ({ slug: c.slug, name: c.name, sub: null }))

    return NextResponse.json({
      products: products.map((p) => ({ ...p, brand: p.brand.name, image: p.images[0]?.url ?? null })),
      brands,
      categories: categoryResults,
    })
  } catch (e) {
    console.error('search api', e)
    return NextResponse.json({ products: [], brands: [], categories: [] })
  }
}
