import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  accentColor: z.string().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
})

export function slugify(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90)
}

export async function GET() {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const brands = await db.brand.findMany({
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  })
  return NextResponse.json({ brands })
}

export async function POST(req: NextRequest) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const parsed = brandSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    const d = parsed.data
    const brand = await db.brand.create({
      data: { ...d, slug: d.slug?.trim() || slugify(d.name), logoUrl: d.logoUrl || null, coverUrl: d.coverUrl || null, tagline: d.tagline || null, description: d.description || null },
    })
    return NextResponse.json({ ok: true, brand })
  } catch (e) {
    console.error('brand create', e)
    return NextResponse.json({ error: 'Falha ao criar marca (slug duplicado?)' }, { status: 500 })
  }
}
