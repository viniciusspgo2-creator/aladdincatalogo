'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { brl, num, dateBR } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Item { id: string; name: string; quantity: number; unitPrice: number; subtotal: number; brandName: string | null }
interface OrderRow { id: string; code: string; customerName: string; contact: string | null; notes: string | null; total: number; itemCount: number; status: string; createdAt: string; items: Item[] }

const STATUS_STYLE: Record<string, string> = {
  GERADO: 'bg-amber-500/15 text-amber-300',
  ENVIADO: 'bg-sky-500/15 text-sky-300',
  CONCLUIDO: 'bg-emerald-500/15 text-emerald-300',
  CANCELADO: 'bg-red-500/15 text-red-300',
}

export default function AdminPedidosPage() {
  const [data, setData] = useState<{ orders: OrderRow[]; total: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/orders')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t) }, [load])

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  return (
    <div>
      <div>
        <p className="kicker">Vendas</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-white">Pedidos gerados</h1>
        <p className="mt-2 text-sm text-neutral-500">Pedidos criados pelos lojistas no catálogo digital (PDF enviado pelo WhatsApp).</p>
      </div>

      <div className="mt-6 space-y-3">
        {data?.orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-white/8 bg-card">
            <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left">
              <div className="min-w-32">
                <p className="font-display font-bold text-gold">{o.code}</p>
                <p className="text-xs text-neutral-500">{dateBR(o.createdAt)}</p>
              </div>
              <div className="min-w-40 flex-1">
                <p className="text-sm font-medium text-white">{o.customerName}</p>
                <p className="text-xs text-neutral-500">{o.contact}</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-white">{brl(o.total)}</p>
                <p className="text-xs text-neutral-500">{o.itemCount} itens</p>
              </div>
              <select
                value={o.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setStatus(o.id, e.target.value)}
                className={cn('rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none', STATUS_STYLE[o.status] || 'bg-white/10')}
              >
                {['GERADO', 'ENVIADO', 'CONCLUIDO', 'CANCELADO'].map((s) => <option key={s} value={s} className="bg-coal text-white">{s}</option>)}
              </select>
            </button>
            {expanded === o.id && (
              <div className="border-t border-white/8 px-5 py-4">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-neutral-500"><tr><th className="pb-2">Produto</th><th className="pb-2">Marca</th><th className="pb-2">Qtd</th><th className="pb-2 text-right">Subtotal</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {o.items.map((i) => (
                      <tr key={i.id}>
                        <td className="py-2 pr-3 text-neutral-200">{i.name}</td>
                        <td className="py-2 pr-3 text-neutral-500">{i.brandName}</td>
                        <td className="py-2 pr-3 text-neutral-300">{i.quantity}</td>
                        <td className="py-2 text-right font-display font-bold text-gold">{brl(i.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {o.notes && <p className="mt-3 rounded border border-white/8 bg-white/5 px-3 py-2 text-xs text-neutral-300"><strong>Obs:</strong> {o.notes}</p>}
              </div>
            )}
          </div>
        ))}
        {data && data.orders.length === 0 && !loading && (
          <p className="py-12 text-center text-sm text-neutral-500">Nenhum pedido gerado ainda.</p>
        )}
      </div>
      {loading && <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>}
      {data && <p className="mt-4 text-xs text-neutral-600">{num(data.total)} pedidos no total</p>}
    </div>
  )
}
