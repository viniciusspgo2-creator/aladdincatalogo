'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Copy, Trash2, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { brl, num } from '@/lib/format'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

interface Row {
  id: string; slug: string; name: string; code: string | null; price: number; stock: number
  active: boolean; featured: boolean; brand: { name: string }; category: { name: string } | null
  images: { url: string }[]
}

export default function AdminProdutosPage() {
  const [data, setData] = useState<{ products: Row[]; total: number; page: number; pageSize: number } | null>(null)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<Row | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}&page=${page}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [q, page])

  useEffect(() => { load() }, [load])

  const del = async () => {
    if (!deleting) return
    await fetch(`/api/admin/products/${deleting.id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  const duplicate = async (row: Row) => {
    await fetch(`/api/admin/products/${row.id}`, { method: 'POST' })
    load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">Catálogo</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-white">Produtos</h1>
        </div>
        <Button asChild className="bg-gold font-bold uppercase tracking-widest text-black hover:bg-gold-light">
          <Link href="/admin/produtos/novo"><Plus className="mr-2 h-4 w-4" /> Novo produto</Link>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Buscar por nome ou código…" className="border-white/10 bg-white/5 pl-9" />
        </div>
        <span className="text-xs text-neutral-500">{data ? `${num(data.total)} itens` : ''}</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/8 bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/8 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-5 py-3.5">Produto</th>
              <th className="hidden px-4 py-3.5 md:table-cell">Marca</th>
              <th className="hidden px-4 py-3.5 sm:table-cell">Preço</th>
              <th className="hidden px-4 py-3.5 sm:table-cell">Estoque</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.products.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-white/5">
                      {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-xs truncate font-medium text-neutral-100">{p.name}</p>
                      <p className="text-xs text-neutral-500">{p.code ? `Cód. ${p.code}` : p.slug.slice(0, 32)}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-neutral-400 md:table-cell">{p.brand.name}</td>
                <td className="hidden px-4 py-3 font-display font-bold text-gold sm:table-cell">{brl(p.price)}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className={p.stock <= 5 ? 'text-amber-400' : 'text-neutral-300'}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge className={p.active ? 'border-0 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20' : 'border-0 bg-red-500/20 text-red-300 hover:bg-red-500/20'}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {p.featured && <Badge className="border-0 bg-gold/20 text-gold hover:bg-gold/20">Destaque</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/admin/produtos/${p.id}`} aria-label={`Editar ${p.name}`} className="grid h-8 w-8 place-items-center rounded text-neutral-400 hover:bg-white/10 hover:text-gold"><Pencil className="h-4 w-4" /></Link>
                    <button onClick={() => duplicate(p)} aria-label={`Duplicar ${p.name}`} className="grid h-8 w-8 place-items-center rounded text-neutral-400 hover:bg-white/10 hover:text-gold"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => setDeleting(p)} aria-label={`Excluir ${p.name}`} className="grid h-8 w-8 place-items-center rounded text-neutral-400 hover:bg-white/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>}
        {data && data.products.length === 0 && !loading && (
          <p className="py-12 text-center text-sm text-neutral-500">Nenhum produto encontrado.</p>
        )}
        {data && data.total > data.pageSize && !loading && (
          <div className="flex items-center justify-between border-t border-white/8 px-5 py-3">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="text-neutral-400">← Anterior</Button>
            <span className="text-xs text-neutral-500">Página {data.page} de {Math.ceil(data.total / data.pageSize)}</span>
            <Button variant="ghost" size="sm" disabled={page * data.pageSize >= data.total} onClick={() => setPage(page + 1)} className="text-neutral-400">Próxima →</Button>
          </div>
        )}
      </div>

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent className="border-white/10 bg-coal">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir produto</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Tem certeza que deseja excluir <strong className="text-white">{deleting?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} className="border-white/15 text-neutral-300">Cancelar</Button>
            <Button onClick={del} className="bg-red-600 text-white hover:bg-red-500">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
