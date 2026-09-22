'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface BannerRow { id: string; title: string; subtitle: string | null; imageUrl: string | null; linkUrl: string | null; active: boolean; order: number }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/banners')
    if (res.ok) { const j = await res.json(); setBanners(j.banners) }
    setLoading(false)
  }, [])

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t) }, [load])

  const create = async () => {
    if (!form.title.trim()) return toast({ title: 'Informe o título', variant: 'destructive' })
    setSaving(true)
    const res = await fetch('/api/admin/banners', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, subtitle: form.subtitle || null, imageUrl: form.imageUrl || null, linkUrl: form.linkUrl || null }),
    })
    const j = await res.json()
    setSaving(false)
    if (!res.ok) return toast({ title: 'Erro', description: j.error, variant: 'destructive' })
    toast({ title: 'Banner criado ✦' })
    setForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '' })
    setOpen(false)
    load()
  }

  const toggle = async (b: BannerRow) => {
    await fetch(`/api/admin/banners/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !b.active }) })
    load()
  }

  const del = async (b: BannerRow) => {
    await fetch(`/api/admin/banners/${b.id}`, { method: 'DELETE' })
    toast({ title: 'Banner excluído' })
    load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">Home</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-white">Banners</h1>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gold font-bold uppercase tracking-widest text-black hover:bg-gold-light">
          <Plus className="mr-2 h-4 w-4" /> Novo banner
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {banners.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-xl border border-white/8 bg-card">
            <div className="relative h-36 bg-white/5">
              {b.imageUrl && <Image src={b.imageUrl} alt={b.title} fill sizes="33vw" className="object-cover" />}
            </div>
            <div className="p-4">
              <h2 className="font-display font-bold text-white">{b.title}</h2>
              {b.subtitle && <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{b.subtitle}</p>}
              <div className="mt-3 flex items-center justify-between">
                <Switch checked={b.active} onCheckedChange={() => toggle(b)} aria-label="Alternar ativo" />
                <button onClick={() => del(b)} aria-label={`Excluir ${b.title}`} className="text-neutral-600 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && !loading && <p className="text-sm text-neutral-500">Nenhum banner. Crie o primeiro para a home.</p>}
      </div>
      {loading && <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-coal">
          <DialogHeader><DialogTitle className="text-white">Novo banner</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Subtítulo" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="URL da imagem (https://…)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Link (ex: /categoria/narguile)" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className="border-white/10 bg-white/5" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-white/15 text-neutral-300">Cancelar</Button>
            <Button onClick={create} disabled={saving} className="bg-gold text-black hover:bg-gold-light">{saving ? 'Salvando…' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
