import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const [brands, products, orders, recent, subs] = await Promise.all([
      db.brand.count(),
      db.product.count(),
      db.order.count(),
      db.product.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { brand: { select: { name: true } } } }),
      db.subCategory.count(),
    ])
    const [ordersOpen, revenue, lowStock] = await Promise.all([
      db.order.count({ where: { status: 'GERADO' } }),
      db.order.aggregate({ _sum: { total: true } }),
      db.product.count({ where: { stock: { lte: 5 } } }),
    ])
    return NextResponse.json({ brands, products, orders, subs, ordersOpen, revenue: revenue._sum.total || 0, lowStock, recent })
  } catch (e) {
    console.error('stats api', e)
    return NextResponse.json({ error: 'database' }, { status: 500 })
  }
}
