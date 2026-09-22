import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const bannerSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  placement: z.string().default('HOME'),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
})

export async function GET() {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const banners = await db.banner.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ banners })
}

export async function POST(req: NextRequest) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const parsed = bannerSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    const banner = await db.banner.create({ data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null, linkUrl: parsed.data.linkUrl || null, subtitle: parsed.data.subtitle || null } })
    return NextResponse.json({ ok: true, banner })
  } catch (e) {
    console.error('banner create', e)
    return NextResponse.json({ error: 'Falha ao criar banner' }, { status: 500 })
  }
}
