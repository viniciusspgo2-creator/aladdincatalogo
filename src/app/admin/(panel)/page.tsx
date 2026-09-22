'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Store, ClipboardList, TrendingUp, AlertTriangle, Layers, Plus, ArrowUpRight } from 'lucide-react'
import { brl, num, dateBR } from '@/lib/format'

interface Stats {
  brands: number; products: number; orders: number; subs: number; ordersOpen: number
  revenue: number; lowStock: number
  recent: { id: string; name: string; createdAt: string; brand: { name: string }; price: number }[]
}

export default function AdminDashboard() {
  const [s, setS] = useState<Stats | null>(null)
  useEffect(() => {
    fetch('/api/admin/stats').then((r) => (r.ok ? r.json() : null)).then(setS).catch(() => setS(null))
  }, [])

  const cards = [
    { label: 'Total de marcas', value: s ? String(s.brands) : '—', icon: Store, href: '/admin/marcas', gold: true },
    { label: 'Produtos cadastrados', value: s ? num(s.products) : '—', icon: Package, href: '/admin/produtos', gold: true },
    { label: 'Pedidos gerados', value: s ? num(s.orders) : '—', icon: ClipboardList, href: '/admin/pedidos' },
    { label: 'Receita estimada', value: s ? brl(s.revenue) : '—', icon: TrendingUp, href: '/admin/pedidos' },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">Painel administrativo</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-white">Dashboard</h1>
        </div>
        <Link href="/admin/produtos/novo" className="flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-light">
          <Plus className="h-4 w-4" /> Novo produto
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="group rounded-xl border border-white/8 bg-card p-6 transition-all hover:border-gold/40">
            <div className="flex items-center justify-between">
              <c.icon className={`h-6 w-6 ${c.gold ? 'text-gold' : 'text-neutral-400'}`} />
              <ArrowUpRight className="h-4 w-4 text-neutral-700 group-hover:text-gold" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-white">{c.value}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-neutral-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <p className="text-sm font-semibold text-amber-200">Estoque baixo (≤5)</p>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-white">{s ? num(s.lowStock) : '—'} produtos</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-card p-5">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-gold" />
            <p className="text-sm font-semibold text-neutral-200">Pedidos aguardando envio</p>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-white">{s ? num(s.ordersOpen) : '—'}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-card p-5">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-gold" />
            <p className="text-sm font-semibold text-neutral-200">Subcategorias ativas</p>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-white">{s ? num(s.subs) : '—'}</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-white/8 bg-card">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 className="font-display font-bold text-white">Produtos cadastrados recentemente</h2>
          <Link href="/admin/produtos" className="text-xs uppercase tracking-widest text-gold hover:text-gold-light">Ver todos</Link>
        </div>
        <ul className="divide-y divide-white/5">
          {(s?.recent || []).map((p) => (
            <li key={p.id} className="flex items-center justify-between px-6 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-neutral-200">{p.name}</p>
                <p className="text-xs text-neutral-500">{p.brand.name} • {dateBR(p.createdAt)}</p>
              </div>
              <span className="ml-4 shrink-0 font-display text-sm font-bold text-gold">{brl(p.price)}</span>
            </li>
          ))}
          {s && s.recent.length === 0 && <li className="px-6 py-8 text-center text-sm text-neutral-500">Nenhum produto ainda.</li>}
        </ul>
      </div>
    </div>
  )
}
