'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { num } from '@/lib/format'

interface Sub { id: string; name: string; slug: string }
interface CatRow { id: string; name: string; slug: string; subs: Sub[]; _count: { products: number } }

export default function AdminCategoriasPage() {
  const [cats, setCats] = useState<CatRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [subsText, setSubsText] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    if (res.ok) { const j = await res.json(); setCats(j.categories) }
    setLoading(false)
  }, [])

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t) }, [load])

  const create = async () => {
    if (!name.trim()) return toast({ title: 'Informe o nome da categoria', variant: 'destructive' })
    setSaving(true)
    const res = await fetch('/api/admin/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subs: subsText.split('\n').map((s) => s.trim()).filter(Boolean).map((s) => ({ name: s })) }),
    })
    const j = await res.json()
    setSaving(false)
    if (!res.ok) return toast({ title: 'Erro', description: j.error, variant: 'destructive' })
    toast({ title: 'Categoria criada ✦' })
    setName(''); setSubsText(''); setOpen(false)
    load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">Organização</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-white">Categorias</h1>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gold font-bold uppercase tracking-widest text-black hover:bg-gold-light">
          <Plus className="mr-2 h-4 w-4" /> Nova categoria
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cats.map((c) => (
          <div key={c.id} className="rounded-xl border border-white/8 bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-white">{c.name}</h2>
              <span className="text-[11px] uppercase tracking-widest text-gold/80">{num(c._count.products)} produtos</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.subs.map((s) => (
                <span key={s.id} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-neutral-400">{s.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {loading && <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-coal">
          <DialogHeader><DialogTitle className="text-white">Nova categoria</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome da categoria *" value={name} onChange={(e) => setName(e.target.value)} className="border-white/10 bg-white/5" />
            <div>
              <p className="mb-1.5 text-xs uppercase tracking-widest text-neutral-400">Subcategorias (uma por linha)</p>
              <textarea
                rows={4} value={subsText} onChange={(e) => setSubsText(e.target.value)}
                placeholder={'Sedas\nFiltros\nTrituradores'}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-gold"
              />
            </div>
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
