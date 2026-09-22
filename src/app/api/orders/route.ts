import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Informe seu nome'),
    shopName: z.string().optional(),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    phone: z.string().min(8, 'Informe um telefone válido'),
    city: z.string().optional(),
    state: z.string().optional(),
  }),
  notes: z.string().max(2000).optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
  })).min(1, 'Sacola vazia'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Dados inválidos' }, { status: 400 })
    }
    const { customer, notes, items } = parsed.data

    const products = await db.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
      include: { brand: { select: { name: true } } },
    })
    if (products.length === 0) return NextResponse.json({ error: 'Produtos não encontrados' }, { status: 400 })

    const rows = items
      .map((i) => {
        const p = products.find((p) => p.id === i.productId)
        if (!p) return null
        return {
          productId: p.id,
          name: p.name,
          code: p.code,
          brandName: p.brand.name,
          quantity: i.quantity,
          unitPrice: p.price,
          subtotal: +(p.price * i.quantity).toFixed(2),
        }
      })
      .filter(Boolean) as { productId: string; name: string; code: string | null; brandName: string; quantity: number; unitPrice: number; subtotal: number }[]

    const total = +rows.reduce((acc, r) => acc + r.subtotal, 0).toFixed(2)
    const code = `ALD-${Date.now().toString(36).toUpperCase()}`

    // find-or-create customer by phone
    let customerId: string | null = null
    const existing = await db.customer.findFirst({ where: { phone: customer.phone } })
    if (existing) {
      customerId = existing.id
      await db.customer.update({ where: { id: existing.id }, data: { name: customer.name, shopName: customer.shopName, city: customer.city, state: customer.state, email: customer.email || undefined } })
    } else {
      const c = await db.customer.create({ data: { name: customer.name, shopName: customer.shopName, email: customer.email || undefined, phone: customer.phone, city: customer.city, state: customer.state } })
      customerId = c.id
    }

    const order = await db.order.create({
      data: {
        code,
        customerId,
        customerName: customer.shopName || customer.name,
        contact: customer.phone,
        notes: notes || undefined,
        total,
        itemCount: rows.length,
        status: 'GERADO',
        items: { create: rows },
      },
    })

    return NextResponse.json({ ok: true, code: order.code, total })
  } catch (e) {
    console.error('orders api', e)
    return NextResponse.json({ error: 'Falha ao registrar pedido. Tente novamente.' }, { status: 500 })
  }
}
