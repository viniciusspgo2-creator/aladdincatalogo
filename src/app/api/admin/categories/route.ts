import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const catSchema = z.object({
  name: z.string().min(1),
  subs: z.array(z.object({ name: z.string().min(1) })).optional(),
})

export function slugify(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90)
}

export async function GET() {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const categories = await db.category.findMany({
    orderBy: { order: 'asc' },
    include: { subs: { orderBy: { order: 'asc' } }, _count: { select: { products: true } } },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const parsed = catSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    const { name, subs } = parsed.data
    const order = await db.category.count()
    const cat = await db.category.create({
      data: {
        name,
        slug: slugify(name),
        order,
        subs: { create: (subs || []).map((s, i) => ({ name: s.name, slug: slugify(s.name), order: i })) },
      },
      include: { subs: true },
    })
    return NextResponse.json({ ok: true, category: cat })
  } catch (e) {
    console.error('category create', e)
    return NextResponse.json({ error: 'Falha ao criar categoria (slug duplicado?)' }, { status: 500 })
  }
}
