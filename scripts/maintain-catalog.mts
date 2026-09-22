/**
 * Manutenção do catálogo pós-re-scrape:
 * 1. searchNorm de products/brands/categories/subcategories
 * 2. Todas as imagens por produto (imagens_completas.json)
 * 3. Fusão Ziggy → ZGY Brasil (mesma marca)
 * 4. Marca BLACK ERVA (ervas + acessórios da categoria 4532730)
 * 5. SiteSettings global (sem nome de representante pessoal)
 * 6. Banners HOME com as artes oficiais
 */
import { PrismaClient } from '@prisma/client'
import { normalizeSearch } from '../src/lib/search.ts'

const db = new PrismaClient()

async function main() {
  const fs = await import('fs')

  // ---------- 1. searchNorm ----------
  console.log('== searchNorm: products')
  const prods = await db.product.findMany({
    select: { id: true, name: true, description: true, brand: { select: { name: true } }, category: { select: { name: true } }, subCategory: { select: { name: true } } },
  })
  for (const p of prods) {
    const norm = normalizeSearch([p.name, p.brand?.name, p.category?.name, p.subCategory?.name, p.description].filter(Boolean).join(' '))
    await db.product.update({ where: { id: p.id }, data: { searchNorm: norm } })
  }
  console.log('products updated:', prods.length)

  for (const m of [db.brand, db.category, db.subCategory]) {
    const rows = await m.findMany()
    for (const r of rows) {
      await m.update({ where: { id: r.id }, data: { searchNorm: normalizeSearch(r.name) } })
    }
    console.log('searchNorm:', rows.length, 'of', m.constructor.name)
  }

  // ---------- 2. imagens completas ----------
  console.log('== imagens completas')
  const raw = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/scraped/imagens_completas.json', 'utf8')) as Record<string, string[] | null>
  const slugs = await db.product.findMany({ select: { id: true, slug: true } })
  const idByMercos = new Map<number, string>()
  for (const p of slugs) {
    const m = p.slug.match(/-(\d+)$/)
    if (m) idByMercos.set(Number(m[1]), p.id)
  }
  let updated = 0, skipped = 0, multi = 0
  for (const [mercosId, urls] of Object.entries(raw)) {
    const pid = idByMercos.get(Number(mercosId))
    if (!pid) { skipped++; continue }
    const list = (urls || []).filter(Boolean)
    if (list.length === 0) { skipped++; continue }
    await db.productImage.deleteMany({ where: { productId: pid } })
    await db.productImage.createMany({ data: list.map((url, i) => ({ productId: pid, url, order: i, alt: null })) })
    updated++
    if (list.length > 1) multi++
  }
  console.log(`imagens: updated=${updated} multi=${multi} skipped=${skipped}`)

  // ---------- 3. fusão Ziggy → ZGY Brasil ----------
  console.log('== merge Ziggy -> ZGY Brasil')
  const ziggy = await db.brand.findUnique({ where: { slug: 'ziggy' } })
  const zgy = await db.brand.findUnique({ where: { slug: 'zgy-brasil' } })
  if (ziggy && zgy) {
    const moved = await db.product.updateMany({ where: { brandId: ziggy.id }, data: { brandId: zgy.id } })
    // recalcular searchNorm dos produtos movidos (marca mudou)
    const movedProds = await db.product.findMany({ where: { brandId: zgy.id }, select: { id: true, name: true, description: true, category: { select: { name: true } }, subCategory: { select: { name: true } } } })
    for (const p of movedProds) {
      const norm = normalizeSearch([p.name, 'ZGY Brasil', 'Ziggy', p.category?.name, p.subCategory?.name, p.description].filter(Boolean).join(' '))
      await db.product.update({ where: { id: p.id }, data: { searchNorm: norm } })
    }
    await db.brand.delete({ where: { id: ziggy.id } })
    await db.brand.update({
      where: { id: zgy.id },
      data: {
        name: 'ZGY Brasil',
        tagline: 'Carvão de coco performance — a linha Ziggy',
        description: zgy.description?.includes('Ziggy') ? zgy.description : `${zgy.description || ''} A ZGY Brasil é a casa da linha Ziggy: carvão de coco prensado de queima longa e baixa cinza, o preferido de quem puxa sessão longa. Carvão de coco performance para narguilé, com ash mínimo e calor estável do primeiro puxão ao último.`,
      },
    })
    console.log('Ziggy merged. moved products:', moved.count)
  } else {
    console.log('ziggy already merged?', { ziggy: !!ziggy, zgy: !!zgy })
  }

  // ---------- 4. BLACK ERVA ----------
  console.log('== BLACK ERVA brand')
  const blackRaw = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/scraped/black_erva_raw.json', 'utf8')) as { produto_id: number; nome: string; categoria_id: number }[]
  const ERVAS_SUBTREE = new Set([4532735, 4532736, 4532738])

  let brand = await db.brand.findUnique({ where: { slug: 'black-erva' } })
  if (!brand) {
    brand = await db.brand.create({
      data: {
        name: 'BLACK ERVA',
        slug: 'black-erva',
        tagline: 'Ervas mate premium & acessórios de chimarrão',
        description: 'A BLACK ERVA é a linha completa para o balcão de chimarrão e tereré: ervas mate selecionadas com moagem ideal, além de bombas inox, cuias, copos, garrafas térmicas e kits prontos. Qualidade que fideliza o mateiro e gira o estoque o ano inteiro.',
        featured: true,
        coverUrl: '/artes/ervas-premium.jpg',
        order: 26,
      },
    })
    console.log('brand BLACK ERVA created')
  }

  const catErva = await db.category.findUnique({ where: { slug: 'erva-mate-terere' } })
  const subErvas = catErva ? await db.subCategory.findFirst({ where: { categoryId: catErva.id, slug: 'ervas' } }) : null
  const subsOfCat = catErva ? await db.subCategory.findMany({ where: { categoryId: catErva.id } }) : []
  const subByName = new Map(subsOfCat.map((s) => [s.name.toUpperCase(), s]))

  const beNameById = new Map<number, string>([
    [4534908, 'Acessórios Chimarrão'], [4533897, 'Acessórios Chimarrão'], [4533896, 'Acessórios Chimarrão'],
    [4534008, 'Acessórios Chimarrão'], [4534915, 'Acessórios Chimarrão'], [4534913, 'Acessórios Chimarrão'],
    [4534911, 'Acessórios Chimarrão'], [4534912, 'Acessórios Chimarrão'], [4534914, 'Acessórios Chimarrão'],
    [4534742, 'Garrafa Térmica'], [4534916, 'Garrafa Térmica'], [4534745, 'Garrafa Térmica'], [4534888, 'Garrafa Térmica'],
  ])

  let assigned = 0, missing: string[] = [], ervasCount = 0
  for (const item of blackRaw) {
    const pid = idByMercos.get(Number(item.produto_id))
    if (!pid) { missing.push(`${item.produto_id} ${item.nome}`); continue }
    const isErvas = ERVAS_SUBTREE.has(Number(item.categoria_id))
    const subName = isErvas ? 'Ervas' : beNameById.get(Number(item.categoria_id))
    const subId = isErvas ? subErvas?.id : (subName ? subByName.get(subName.toUpperCase())?.id : undefined)
    await db.product.update({
      where: { id: pid },
      data: { brandId: brand.id, categoryId: catErva?.id, subCategoryId: subId ?? undefined },
    })
    assigned++
    if (isErvas) ervasCount++
  }
  console.log(`BLACK ERVA: assigned=${assigned} ervas=${ervasCount} missing=${missing.length}`)
  if (missing.length > 0) console.log('missing sample:', missing.slice(0, 10).join(' | '))

  // ---------- 5. SiteSettings global ----------
  console.log('== SiteSettings')
  await db.siteSettings.upsert({
    where: { id: 'singleton' },
    update: { repName: 'Equipe Comercial Aladdin', repEmail: 'contato@aladdindistribuidora.com.br' },
    create: { id: 'singleton' },
  })
  console.log('settings ok')

  // ---------- 6. Banners ----------
  console.log('== banners')
  const bannerData = [
    { title: 'Narguilé Premium', subtitle: 'Vasos, stems e rosh das marcas que dominam o balcão', imageUrl: '/artes/colecao-narguile.jpg', linkUrl: '/narguile' },
    { title: 'Headshop Elite', subtitle: 'Vidro, metal e design: a categoria de maior margem', imageUrl: '/artes/colecao-headshop.jpg', linkUrl: '/headshop' },
    { title: 'Fumos & Tabacos', subtitle: 'Zomo, ZGY, Black Jack e os sabores que giram', imageUrl: '/artes/colecao-fumos.jpg', linkUrl: '/catalogo?cat=fumo-tabacos' },
  ]
  const banners = await db.banner.findMany({ where: { placement: 'HOME' }, orderBy: { order: 'asc' } })
  for (let i = 0; i < bannerData.length; i++) {
    if (banners[i]) await db.banner.update({ where: { id: banners[i].id }, data: bannerData[i] })
    else await db.banner.create({ data: { ...bannerData[i], placement: 'HOME', order: i, active: true } })
  }
  console.log('banners ok:', banners.length)

  console.log('== ALL DONE ==')
}

main().finally(() => db.$disconnect())
