/** Define coverUrl (hero) das marcas: imagens reais baixadas + artes premium temáticas para o resto. */
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const REAL: Record<string, string> = {
  'raw': '/artes/marcas/raw.jpg',
  'ocb': '/artes/marcas/ocb.jpg',
  'zomo': '/artes/marcas/zomo.jpg',
  'squadafum': '/artes/marcas/squadafum.jpg',
  'elements': '/artes/marcas/elements.jpg',
  'satya': '/artes/marcas/satya.jpg',
  'kaloud': '/artes/marcas/kaloud.jpg',
  'zengaz': '/artes/marcas/zengaz.jpg',
  'trust-liquid': '/artes/marcas/trust-liquid.jpg',
  'black-hookah': '/artes/marcas/black-hookah.jpg',
  'zgy-brasil': '/artes/marcas/zgy-brasil.jpg',
  'black-erva': '/artes/marcas/black-erva.jpg',
}

// artes temáticas por perfil de catálogo (fallback premium — nada feio/deslocado)
const THEMES: Record<string, string> = {
  narguile: '/artes/colecao-narguile.jpg',
  headshop: '/artes/colecao-headshop.jpg',
  'fumo-tabacos': '/artes/fumo-essencia.jpg',
  'erva-mate-terere': '/artes/ervas-premium.jpg',
  'essencias-vape': '/artes/fumo-essencia.jpg',
  'isqueiros-macaricos': '/artes/flagship.jpg',
  'incensos-aromas': '/artes/lifestyle-dark.jpg',
}

async function main() {
  const brands = await db.brand.findMany({ include: { _count: { select: { products: true } } } })
  const catRows = await db.category.findMany({ select: { id: true, slug: true } })
  const catSlugById = new Map(catRows.map((c) => [c.id, c.slug]))

  for (const b of brands) {
    let cover = REAL[b.slug]
    if (!cover) {
      // categoria dominante da marca
      const top = await db.product.groupBy({
        by: ['categoryId'],
        where: { brandId: b.id, active: true, categoryId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 1,
      })
      const slug = top[0] ? catSlugById.get(top[0].categoryId!) : undefined
      cover = THEMES[slug || ''] || '/artes/acessorios-premium.jpg'
    }
    await db.brand.update({ where: { id: b.id }, data: { coverUrl: cover } })
  }
  console.log('covers updated:', brands.length)
}

main().finally(() => db.$disconnect())
