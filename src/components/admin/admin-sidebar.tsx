'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Package, Store, Layers, Image as ImageIcon, ClipboardList, Settings, LogOut, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/marcas', label: 'Marcas', icon: Store },
  { href: '/admin/categorias', label: 'Categorias', icon: Layers },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/admin/config', label: 'Configurações', icon: Settings },
]

export function AdminSidebar({ user }: { user: { name: string; role: string } }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-md brushed-metal border border-gold/40">
          <span className="font-display text-lg font-bold text-gold-gradient">A</span>
        </span>
        <div>
          <p className="font-display text-sm font-bold tracking-[0.15em] text-white">ALADDIN</p>
          <p className="text-[9px] uppercase tracking-[0.3em] text-gold/80">painel admin</p>
        </div>
      </div>
      <div className="flex-1 space-y-1 p-4">
        {LINKS.map((l) => {
          const active = l.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors',
                active ? 'bg-gold/15 text-gold font-semibold' : 'text-neutral-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          )
        })}
      </div>
      <div className="border-t border-white/8 p-4">
        <p className="px-2 text-sm font-medium text-white">{user.name}</p>
        <p className="px-2 text-xs text-neutral-500">{user.role}</p>
        <div className="mt-3 flex gap-2">
          <Link href="/" target="_blank" className="flex-1 rounded-md border border-white/10 px-3 py-2 text-center text-xs text-neutral-300 hover:border-gold/50 hover:text-gold">
            Ver site
          </Link>
          <button onClick={logout} className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:border-red-500/50 hover:text-red-400">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </div>
    </nav>
  )

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/8 bg-coal px-4 py-3 lg:hidden">
        <span className="font-display text-sm font-bold tracking-[0.15em] text-white">ALADDIN <span className="text-gold">ADMIN</span></span>
        <button onClick={() => setOpen(!open)} aria-label="Menu admin" className="text-neutral-300">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink lg:hidden">
          <div className="h-full w-72 border-r border-white/8 bg-coal pt-12">{nav}</div>
        </div>
      )}
      <aside className="fixed left-0 top-0 z-40 hidden h-dvh w-64 border-r border-white/8 bg-coal lg:block" aria-label="Navegação do painel">
        {nav}
      </aside>
      <div className="h-12 lg:hidden" />
    </>
  )
}
