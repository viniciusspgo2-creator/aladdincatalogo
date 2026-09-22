import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'
import { normalizeSearch } from '@/lib/search'

export const dynamic = 'force-dynamic'

/** Monta o campo searchNorm (nome + marca + categoria + sub + descrição). */
export async function computeSearchNorm(data: { name: string; brandId?: string | null; categoryId?: string | null; subCategoryId?: string | null; description?: string | null }) {
  const [brand, cat, sub] = await Promise.all([
    data.brandId ? db.brand.findUnique({ where: { id: data.brandId }, select: { name: true } }) : null,
    data.categoryId ? db.category.findUnique({ where: { id: data.categoryId }, select: { name: true } }) : null,
    data.subCategoryId ? db.subCategory.findUnique({ where: { id: data.subCategoryId }, select: { name: true } }) : null,
  ])
  return normalizeSearch([data.name, brand?.name, cat?.name, sub?.name, data.description].filter(Boolean).join(' '))
}

export const productSchema = z.object({
  name: z.string().min(2, 'Nome do produto obrigatório'),
  slug: z.string().optional(),
  code: z.string().optional().nullable(),
  brandId: z.string().min(1, 'Selecione a marca'),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().min(0),
  oldPrice: z.number().min(0).optional().nullable(),
  minQuantity: z.number().int().min(1).default(1),
  stock: z.number().int().min(0).default(0),
  unit: z.string().default('UN'),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  onSale: z.boolean().default(false),
  active: z.boolean().default(true),
  images: z.array(z.string()).default([]),
})

export function slugify(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90)
}

export async function GET(req: NextRequest) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const sp = req.nextUrl.searchParams
  const q = sp.get('q')?.trim() || undefined
  const brandId = sp.get('brandId') || undefined
  const page = Math.max(1, Number(sp.get('page') || 1))
  const pageSize = 20
  try {
    const where: Record<string, unknown> = {}
    if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }]
    if (brandId) where.brandId = brandId
    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        include: { brand: { select: { name: true } }, category: { select: { name: true } }, images: { take: 1, orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    return NextResponse.json({ products, total, page, pageSize })
  } catch (e) {
    console.error('admin products list', e)
    return NextResponse.json({ error: 'database' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    const d = parsed.data
    const slug = d.slug?.trim() || slugify(d.name) + '-' + Date.now().toString(36)
    const searchNorm = await computeSearchNorm(d)
    const product = await db.product.create({
      data: {
        name: d.name, slug, code: d.code || null, brandId: d.brandId,
        categoryId: d.categoryId || null, subCategoryId: d.subCategoryId || null,
        description: d.description || null, price: d.price, oldPrice: d.oldPrice ?? null,
        minQuantity: d.minQuantity, stock: d.stock, unit: d.unit,
        featured: d.featured, isNew: d.isNew, onSale: d.onSale, active: d.active,
        searchNorm,
        images: { create: d.images.slice(0, 12).map((url, i) => ({ url, order: i, alt: d.name })) },
      },
    })
    return NextResponse.json({ ok: true, product })
  } catch (e) {
    console.error('admin product create', e)
    return NextResponse.json({ error: 'Falha ao criar produto (verifique slug duplicado)' }, { status: 500 })
  }
}
