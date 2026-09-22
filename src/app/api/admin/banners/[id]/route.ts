import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const schema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    const { subtitle, imageUrl, linkUrl, ...rest } = parsed.data
    await db.banner.update({
      where: { id },
      data: { ...rest, subtitle: subtitle ?? undefined, imageUrl: imageUrl ?? null, linkUrl: linkUrl ?? null },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('banner update', e)
    return NextResponse.json({ error: 'Falha ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await db.banner.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('banner delete', e)
    return NextResponse.json({ error: 'Falha ao excluir' }, { status: 500 })
  }
}
