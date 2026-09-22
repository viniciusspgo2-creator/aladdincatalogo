import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'
import { computeSearchNorm } from '../route'

export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().optional().nullable(),
  brandId: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  oldPrice: z.number().min(0).optional().nullable(),
  minQuantity: z.number().int().min(1).optional(),
  stock: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  onSale: z.boolean().optional(),
  active: z.boolean().optional(),
  images: z.array(z.string()).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const product = await db.product.findUnique({ where: { id }, include: { images: { orderBy: { order: 'asc' } } } })
  if (!product) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ product: { ...product, images: product.images.map((i) => i.url) } })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    const d = parsed.data
    const { images, ...data } = d
    // recomputa searchNorm com os valores finais do produto
    const current = await db.product.findUnique({ where: { id }, select: { name: true, brandId: true, categoryId: true, subCategoryId: true, description: true } })
    if (!current) return NextResponse.json({ error: 'not found' }, { status: 404 })
    const merged = {
      name: d.name ?? current.name,
      brandId: d.brandId ?? current.brandId,
      categoryId: d.categoryId ?? current.categoryId,
      subCategoryId: d.subCategoryId ?? current.subCategoryId,
      description: d.description ?? current.description,
    }
    const searchNorm = await computeSearchNorm(merged)
    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...data,
          code: d.code ?? undefined,
          description: d.description ?? undefined,
          categoryId: d.categoryId ?? null,
          subCategoryId: d.subCategoryId ?? null,
          searchNorm,
        },
      })
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } })
        if (images.length) {
          await tx.productImage.createMany({ data: images.slice(0, 12).map((url, i) => ({ productId: id, url, order: i })) })
        }
      }
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('admin product update', e)
    return NextResponse.json({ error: 'Falha ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await db.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('admin product delete', e)
    return NextResponse.json({ error: 'Falha ao excluir' }, { status: 500 })
  }
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // duplicate product
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const original = await db.product.findUnique({ where: { id }, include: { images: true } })
    if (!original) return NextResponse.json({ error: 'not found' }, { status: 404 })
    const copy = await db.product.create({
      data: {
        name: `${original.name} (CÓPIA)`,
        slug: `${original.slug}-copia-${Date.now().toString(36)}`.slice(0, 95),
        code: original.code, brandId: original.brandId, categoryId: original.categoryId,
        subCategoryId: original.subCategoryId, description: original.description,
        price: original.price, oldPrice: original.oldPrice, minQuantity: original.minQuantity,
        stock: original.stock, unit: original.unit, soldCount: 0,
        featured: original.featured, isNew: original.isNew, onSale: original.onSale, active: false,
        searchNorm: original.searchNorm,
        images: { create: original.images.slice(0, 12).map((img, i) => ({ url: img.url, order: i, alt: img.alt })) },
      },
    })
    return NextResponse.json({ ok: true, product: copy })
  } catch (e) {
    console.error('admin product duplicate', e)
    return NextResponse.json({ error: 'Falha ao duplicar' }, { status: 500 })
  }
}
