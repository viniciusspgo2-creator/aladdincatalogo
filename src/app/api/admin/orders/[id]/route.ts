import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const STATUS = ['GERADO', 'ENVIADO', 'CONCLUIDO', 'CANCELADO']

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const { status } = await req.json()
    if (!STATUS.includes(status)) return NextResponse.json({ error: 'status inválido' }, { status: 400 })
    await db.order.update({ where: { id }, data: { status } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('order status update', e)
    return NextResponse.json({ error: 'Falha ao atualizar' }, { status: 500 })
  }
}
