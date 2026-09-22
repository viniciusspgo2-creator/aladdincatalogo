import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  // 1. ZIGGY / ZGY brands
  const zBrands = await db.brand.findMany({ where: { OR: [{ name: { contains: 'ZIGGY' } }, { name: { contains: 'ZGY' } }] }, include: { _count: { select: { products: true } } } })
  console.log('Z brands:', JSON.stringify(zBrands.map(b => ({ id: b.id, name: b.name, slug: b.slug, count: b._count.products }))))

  // 2. categories + counts
  const cats = await db.category.findMany({ orderBy: { order: 'asc' }, select: { name: true, slug: true, _count: { select: { products: true } } } })
  console.log('\nCategories:', JSON.stringify(cats, null, 0))

  // 3. images per product stats
  const total = await db.product.count()
  const withImg = await db.product.count({ where: { images: { some: {} } } })
  const multiImg = await db.product.count({ where: { images: { some: {} }, NOT: { images: { none: {} } } } })
  const imgAgg = await db.productImage.groupBy({ by: ['productId'], _count: { _all: true } })
  const dist: Record<number, number> = {}
  for (const g of imgAgg) { dist[g._count._all] = (dist[g._count._all] || 0) + 1 }
  console.log(`\nProducts total=${total} withImg=${withImg} imgDistribution=${JSON.stringify(dist)}`)

  // 4. BLACK ERVA brand + products
  const be = await db.brand.findFirst({ where: { OR: [{ name: { contains: 'BLACK ERVA' } }, { name: { contains: 'BLACK' } }] }, include: { _count: { select: { products: true } } } })
  console.log('\nBLACK brand:', JSON.stringify(be ? { id: be.id, name: be.name, slug: be.slug, count: be._count.products } : null))

  // 5. Erva Mate category products w/ brand
  const ervaCat = await db.category.findFirst({ where: { slug: 'erva-mate-terere' }, include: { subs: true } })
  if (ervaCat) {
    const ervaProducts = await db.product.findMany({ where: { categoryId: ervaCat.id }, select: { name: true, brandId: true, subCategory: { select: { name: true } } }, take: 60 })
    const byBrand: Record<string, number> = {}
    for (const p of ervaProducts) { byBrand[p.brandId] = (byBrand[p.brandId] || 0) + 1 }
    console.log('\nErva Mate category products:', ervaProducts.length, 'brandIds:', JSON.stringify(byBrand))
    console.log('Erva subs:', JSON.stringify(ervaCat.subs.map(s => s.name)))
    console.log('Sample:', JSON.stringify(ervaProducts.slice(0, 25).map(p => ({ n: p.name, sub: p.subCategory?.name })), null, 0))
  }

  // 6. all brands list
  const brands = await db.brand.findMany({ orderBy: { name: 'asc' }, select: { name: true, slug: true, logoUrl: true, coverUrl: true, _count: { select: { products: true } } } })
  console.log('\nAll brands (' + brands.length + '):')
  for (const b of brands) console.log(`- ${b.name} | slug=${b.slug} | products=${b._count.products} | logo=${b.logoUrl ? 'Y' : 'N'} cover=${b.coverUrl ? 'Y' : 'N'}`)

  // 7. banners
  const banners = await db.banner.findMany()
  console.log('\nBanners:', JSON.stringify(banners.map(b => ({ id: b.id, title: b.title, placement: b.placement, img: b.imageUrl })), null, 0))
}

main().finally(() => db.$disconnect())
