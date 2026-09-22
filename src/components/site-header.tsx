'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { Search, ShoppingBag, Menu, X } from 'lucide-react'
import { useBag } from '@/lib/bag-store'
import { Button } from '@/components/ui/button'
import { SearchCommand } from '@/components/search-command'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Início' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/produtos', label: 'Produtos' },
  { href: '/marcas', label: 'Marcas' },
  { href: '/narguile', label: 'Narguilé' },
  { href: '/headshop', label: 'Headshop' },
  { href: '/blog', label: 'Blog' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-500',
          scrolled ? 'glass shadow-[0_10px_40px_-15px_rgba(0,0,0,0.9)]' : 'bg-transparent',
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Aladdin Distribuidora — início">
              <span className="relative grid h-9 w-9 place-items-center rounded-md brushed-metal border border-gold/40 group-hover:border-gold transition-colors">
                <span className="font-display text-lg font-bold text-gold-gradient shimmer">A</span>
              </span>
              <span className="hidden sm:block leading-none">
                <span className="block font-display font-bold tracking-[0.18em] text-sm text-white">ALADDIN</span>
                <span className="block text-[9px] uppercase tracking-[0.4em] text-gold/90">distribuidora</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação principal">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-2.5 py-2 text-[13px] uppercase tracking-wider transition-colors rounded-sm hover:text-gold xl:px-3',
                    pathname === item.href ? 'text-gold' : 'text-neutral-300',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Buscar produtos"
                className="text-neutral-300 hover:text-gold"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir sacola de pedidos"
                className="relative text-neutral-300 hover:text-gold"
                onClick={() => (window.location.href = '/carrinho')}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                <BagBadge />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-neutral-200"
                aria-label={open ? 'Fechar menu' : 'Abrir menu'}
                onClick={() => setOpen(!open)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
        <div className="gold-line opacity-40" />
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-ink/95 backdrop-blur-xl pt-20 lg:hidden">
          <nav className="flex flex-col px-8 gap-1" aria-label="Menu mobile">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3.5 font-display text-2xl font-bold uppercase tracking-wide text-neutral-200 border-b border-white/5 hover:text-gold transition-colors rise"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}

function BagBadge() {
  const count = useBag((s) => s.items.length)
  // avoid hydration mismatch: badge only renders after mount (client store state)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  if (!mounted || count === 0) return null
  return (
    <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-bold text-black">
      {count}
    </span>
  )
}
