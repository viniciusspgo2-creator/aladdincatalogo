import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || 1))
  try {
    const [total, orders] = await Promise.all([
      db.order.count(),
      db.order.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * 20,
        take: 20,
        include: { items: true },
      }),
    ])
    return NextResponse.json({ orders, total, page, pageSize: 20 })
  } catch (e) {
    console.error('admin orders', e)
    return NextResponse.json({ error: 'database' }, { status: 500 })
  }
}
