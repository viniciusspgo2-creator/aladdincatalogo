import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { searchTokens } from '@/lib/search'

export const dynamic = 'force-dynamic'

const include = {
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  subCategory: { select: { name: true, slug: true } },
  images: { orderBy: { order: 'asc' as const }, take: 2, select: { url: true } },
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const q = sp.get('q')?.trim() || undefined
  const marca = sp.get('marca') || undefined
  const cat = sp.get('cat') || undefined
  const sub = sp.get('sub') || undefined
  const parseNum = (v: string | null): number | undefined => {
    if (v === null || v.trim() === '') return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  const min = parseNum(sp.get('min'))
  const max = parseNum(sp.get('max'))
  const disp = sp.get('disp') === '1'
  const novidades = sp.get('novidades') === '1'
  const maisVendidos = sp.get('mais-vendidos') === '1' || sp.get('ordem') === 'mais-vendidos'
  const ordem = sp.get('ordem') || undefined
  const page = Math.max(1, Number(sp.get('page') || 1))
  const pageSize = Math.min(1000, Math.max(4, Number(sp.get('pageSize') || 24)))

  try {
    const where: Record<string, unknown> = { active: true }
    if (marca) where.brand = { slug: marca }
    if (cat) where.category = { slug: cat }
    if (sub) where.subCategory = { slug: sub }
    if (min !== undefined || max !== undefined) {
      where.price = { ...(min !== undefined && { gte: min }), ...(max !== undefined && { lte: max }) }
    } else {
      delete where.price
    }
    if (disp) where.stock = { gt: 0 }
    if (novidades) where.isNew = true
    if (sp.get('destaque') === '1') where.featured = true

    if (q) {
      // busca inteligente sem acento/caixa: tokens devem aparecer no texto normalizado
      const tokens = searchTokens(q)
      if (tokens.length > 0) {
        where.AND = tokens.map((t) => ({ searchNorm: { contains: t } }))
      }
    }

    // agrupamento especial BLACK ERVA: ervas primeiro, acessórios depois
    const grupoErvas = sp.get('grupo') === 'ervas'
    const grupoAcessorios = sp.get('grupo') === 'acessorios'
    if (grupoErvas) where.subCategory = { name: { contains: 'erva', mode: 'insensitive' as const } }
    if (grupoAcessorios) {
      where.AND = [
        ...(where.AND as unknown[] ?? []),
        { subCategory: { name: { not: { contains: 'erva', mode: 'insensitive' as const } } } },
      ]
    }

    const orderBy =
      ordem === 'novidades' ? [{ isNew: 'desc' as const }, { createdAt: 'desc' as const }]
      : ordem === 'menor-preco' ? { price: 'asc' as const }
      : ordem === 'maior-preco' ? { price: 'desc' as const }
      : maisVendidos ? [{ soldCount: 'desc' as const }, { featured: 'desc' as const }]
      : [{ featured: 'desc' as const }, { soldCount: 'desc' as const }]

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where, include, orderBy,
        skip: (page - 1) * pageSize, take: pageSize,
      }),
    ])

    return NextResponse.json({ products, total, page, pageSize })
  } catch (e) {
    console.error('products api', e)
    return NextResponse.json({ products: [], total: 0, page, pageSize }, { status: 200 })
  }
}
