'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { num } from '@/lib/format'

interface BrandRow { id: string; name: string; slug: string; tagline: string | null; featured: boolean; _count: { products: number } }

export default function AdminMarcasPage() {
  const [brands, setBrands] = useState<BrandRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', tagline: '', description: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/brands')
    if (res.ok) { const j = await res.json(); setBrands(j.brands) }
    setLoading(false)
  }, [])

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t) }, [load])

  const create = async () => {
    if (!form.name.trim()) return toast({ title: 'Informe o nome da marca', variant: 'destructive' })
    setSaving(true)
    const res = await fetch('/api/admin/brands', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, tagline: form.tagline || null, description: form.description || null }),
    })
    const j = await res.json()
    setSaving(false)
    if (!res.ok) return toast({ title: 'Erro', description: j.error, variant: 'destructive' })
    toast({ title: 'Marca criada ✦' })
    setForm({ name: '', tagline: '', description: '' })
    setOpen(false)
    load()
  }

  const toggleFeatured = async (b: BrandRow) => {
    await fetch(`/api/admin/brands/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: !b.featured }) })
    load()
  }

  const del = async (b: BrandRow) => {
    const res = await fetch(`/api/admin/brands/${b.id}`, { method: 'DELETE' })
    const j = await res.json()
    if (!res.ok) return toast({ title: 'Erro', description: j.error, variant: 'destructive' })
    toast({ title: 'Marca excluída' })
    load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">Organização</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-white">Marcas</h1>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gold font-bold uppercase tracking-widest text-black hover:bg-gold-light">
          <Plus className="mr-2 h-4 w-4" /> Nova marca
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <div key={b.id} className="rounded-xl border border-white/8 bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display font-bold text-white">{b.name}</h2>
                <p className="mt-0.5 text-xs text-neutral-500">/{b.slug}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleFeatured(b)} aria-label="Alternar destaque" className={b.featured ? 'text-gold' : 'text-neutral-600 hover:text-gold'}><Star className="h-4 w-4" fill={b.featured ? 'currentColor' : 'none'} /></button>
                <button onClick={() => del(b)} aria-label={`Excluir ${b.name}`} className="text-neutral-600 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {b.tagline && <p className="mt-2 line-clamp-1 text-xs text-neutral-400">{b.tagline}</p>}
            <p className="mt-3 text-[11px] uppercase tracking-widest text-gold/80">{num(b._count.products)} produtos</p>
          </div>
        ))}
      </div>
      {loading && <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-coal">
          <DialogHeader><DialogTitle className="text-white">Nova marca</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome da marca *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Tagline (ex: The natural way to roll)" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="border-white/10 bg-white/5" />
            <Textarea placeholder="História/descrição da marca…" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-white/10 bg-white/5" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-white/15 text-neutral-300">Cancelar</Button>
            <Button onClick={create} disabled={saving} className="bg-gold text-black hover:bg-gold-light">{saving ? 'Salvando…' : 'Criar marca'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
