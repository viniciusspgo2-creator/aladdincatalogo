'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Informe o nome do produto'),
  code: z.string().optional(),
  brandId: z.string().min(1, 'Selecione a marca'),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Preço inválido'),
  oldPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  minQuantity: z.coerce.number().int().min(1),
  stock: z.coerce.number().int().min(0),
  unit: z.string().min(1),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  onSale: z.boolean().default(false),
  active: z.boolean().default(true),
  images: z.array(z.string()).default([]),
})
type FormData = z.infer<typeof schema>

interface Opt { id: string; name: string; subs?: { id: string; name: string }[] }

export function ProductForm({ productId }: { productId?: string }) {
  const [brands, setBrands] = useState<Opt[]>([])
  const [cats, setCats] = useState<Opt[]>([])
  const [imgInput, setImgInput] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', brandId: '', categoryId: '', subCategoryId: '', description: '', price: 0, oldPrice: undefined, minQuantity: 1, stock: 0, unit: 'UN', featured: false, isNew: false, onSale: false, active: true, images: [] },
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/brands').then((r) => r.json()).catch(() => ({ brands: [] })),
      fetch('/api/admin/categories').then((r) => r.json()).catch(() => ({ categories: [] })),
    ]).then(([b, c]) => {
      setBrands(b.brands || [])
      setCats(c.categories || [])
    })
    if (productId) {
      fetch(`/api/admin/products/${productId}`).then((r) => r.json()).then((j) => {
        if (j.product) reset({ ...j.product, categoryId: j.product.categoryId || '', subCategoryId: j.product.subCategoryId || '', images: j.product.images || [] })
      })
    }
  }, [productId, reset])

  const images = watch('images') || []
  const brandId = watch('brandId')
  const categoryId = watch('categoryId')
  const selCat = cats.find((c) => c.id === categoryId)

  const onSubmit = async (d: FormData) => {
    setSaving(true)
    try {
      const res = await fetch(productId ? `/api/admin/products/${productId}` : '/api/admin/products', {
        method: productId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, images: d.images, oldPrice: d.oldPrice === '' ? null : d.oldPrice, code: d.code || null }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao salvar')
      toast({ title: productId ? 'Produto atualizado ✦' : 'Produto criado ✦' })
      router.push('/admin/produtos')
      router.refresh()
    } catch (e) {
      toast({ title: 'Erro', description: e instanceof Error ? e.message : 'Falha ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const addImage = () => {
    const url = imgInput.trim()
    if (!url) return
    if (!/^https?:\/\//.test(url)) return toast({ title: 'Use uma URL https:// de imagem', variant: 'destructive' })
    if (images.length >= 12) return toast({ title: 'Máximo de 12 imagens', variant: 'destructive' })
    setValue('images', [...images, url])
    setImgInput('')
  }

  const field = 'border-white/10 bg-white/5'
  const toggles: { key: 'featured' | 'isNew' | 'onSale' | 'active'; label: string }[] = [
    { key: 'active', label: 'Ativo na loja' },
    { key: 'featured', label: 'Destaque na home' },
    { key: 'isNew', label: 'Selo Novidade' },
    { key: 'onSale', label: 'Em promoção' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <section className="rounded-xl border border-white/8 bg-card p-6">
          <h2 className="kicker mb-4">Informações</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Nome do produto *</label>
              <Input {...register('name')} placeholder="Ex: SEDA RAW CLASSIC KING SIZE SLIM" className={field} />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Código interno</label>
                <Input {...register('code')} placeholder="Ex: 10119" className={field} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Unidade</label>
                <Input {...register('unit')} placeholder="UN / DSPL / CX" className={field} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Descrição</label>
              <Textarea {...register('description')} rows={4} placeholder="Descreva o produto, embalagem e diferenciais…" className={field} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/8 bg-card p-6">
          <h2 className="kicker mb-4">Organização</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Marca *</label>
              <select {...register('brandId')} className={cn('h-10 w-full rounded-md border px-3 text-sm text-white outline-none', field, !brandId && 'text-neutral-500')}>
                <option value="">Selecione…</option>
                {brands.map((b) => <option key={b.id} value={b.id} className="bg-coal">{b.name}</option>)}
              </select>
              {errors.brandId && <p className="mt-1 text-xs text-red-400">{errors.brandId.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Categoria</label>
              <select {...register('categoryId')} className={cn('h-10 w-full rounded-md border px-3 text-sm text-white outline-none', field)}>
                <option value="">Selecione…</option>
                {cats.map((c) => <option key={c.id} value={c.id} className="bg-coal">{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Subcategoria</label>
              <select {...register('subCategoryId')} className={cn('h-10 w-full rounded-md border px-3 text-sm text-white outline-none', field)}>
                <option value="">Selecione…</option>
                {(selCat?.subs || []).map((s) => <option key={s.id} value={s.id} className="bg-coal">{s.name}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/8 bg-card p-6">
          <h2 className="kicker mb-4">Imagens (até 12)</h2>
          <div className="flex gap-2">
            <Input value={imgInput} onChange={(e) => setImgInput(e.target.value)} placeholder="https://…/imagem.jpg" className={field} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }} />
            <button type="button" onClick={addImage} className="rounded-md border border-gold/50 px-4 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-black">Adicionar</button>
          </div>
          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-md border border-white/10">
                  <img src={img} alt={`Imagem ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setValue('images', images.filter((_, k) => k !== i))} aria-label="Remover imagem" className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="h-5 w-5 text-white" />
                  </button>
                  {i === 0 && <span className="absolute bottom-0 inset-x-0 bg-gold py-0.5 text-center text-[8px] font-bold uppercase tracking-widest text-black">Principal</span>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="space-y-5">
        <section className="rounded-xl border border-white/8 bg-card p-6">
          <h2 className="kicker mb-4">Comercial</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Preço (R$) *</label>
              <Input type="number" step="0.01" {...register('price')} className={field} />
              {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Preço anterior (promoção)</label>
              <Input type="number" step="0.01" {...register('oldPrice')} className={field} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Qtd. mínima</label>
                <Input type="number" {...register('minQuantity')} className={field} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Estoque</label>
                <Input type="number" {...register('stock')} className={field} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/8 bg-card p-6">
          <h2 className="kicker mb-4">Status</h2>
          <div className="space-y-4">
            {toggles.map((t) => (
              <div key={t.key} className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">{t.label}</span>
                <Switch checked={!!watch(t.key)} onCheckedChange={(v) => setValue(t.key, v)} />
              </div>
            ))}
          </div>
        </section>

        <button type="submit" disabled={saving} className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-gold text-sm font-bold uppercase tracking-widest text-black hover:bg-gold-light glow-gold disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Salvando…' : 'Salvar produto'}
        </button>
      </div>
    </form>
  )
}
