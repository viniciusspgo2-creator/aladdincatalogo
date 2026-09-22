import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().min(1).optional(),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  accentColor: z.string().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    const { tagline, description, logoUrl, coverUrl, ...rest } = parsed.data
    await db.brand.update({
      where: { id },
      data: { ...rest, tagline: tagline ?? undefined, description: description ?? undefined, logoUrl: logoUrl ?? null, coverUrl: coverUrl ?? null },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('brand update', e)
    return NextResponse.json({ error: 'Falha ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const count = await db.product.count({ where: { brandId: id } })
    if (count > 0) return NextResponse.json({ error: `Marca possui ${count} produtos. Reatribua antes de excluir.` }, { status: 400 })
    await db.brand.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('brand delete', e)
    return NextResponse.json({ error: 'Falha ao excluir' }, { status: 500 })
  }
}
