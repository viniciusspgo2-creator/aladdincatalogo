'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, LayoutGrid, Menu, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type LineItem = { id: string; name: string; slug: string; count: number }

type Props = {
  catSlug: string
  /** aria-label for the whole section, e.g. "Linhas de narguilé" */
  ariaLabel: string
  lines: LineItem[]
  /** how many chips stay visible in the quick strip (closed state) */
  quickCount?: number
}

const stripDiacritics = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/**
 * Compact "Compre por linha" menu:
 * - closed: title + ONE horizontal quick-chip strip (tiny footprint)
 * - open: hamburger-style glass panel with search + full grid of lines
 */
export function LineMenu({ catSlug, ariaLabel, lines, quickCount = 10 }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // close on Escape + autofocus search when opening
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => searchRef.current?.focus(), 260)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = stripDiacritics(query.trim())
    if (!q) return lines
    return lines.filter((l) => stripDiacritics(l.name).includes(q))
  }, [lines, query])

  const quick = lines.slice(0, quickCount)
  const panelId = `line-menu-${catSlug}`

  if (lines.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6" aria-label={ariaLabel}>
      {/* header row */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-white">
          Compre por <span className="text-gold-gradient">linha</span>
        </h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(
            'group inline-flex h-10 shrink-0 items-center gap-2 rounded-md border px-3.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300 sm:px-4',
            open
              ? 'border-gold/70 bg-gold/10 text-gold shadow-[0_0_18px_rgba(201,162,39,0.18)]'
              : 'border-white/12 bg-white/[0.03] text-neutral-300 hover:border-gold/50 hover:text-gold',
          )}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4 text-gold" />}
          <span className="hidden sm:inline">{open ? 'Fechar' : 'Todas as linhas'}</span>
          <span className="sm:hidden">{open ? 'Fechar' : 'Linhas'}</span>
          <span
            className={cn(
              'grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold transition-colors',
              open ? 'bg-gold text-black' : 'bg-gold/15 text-gold',
            )}
          >
            {lines.length}
          </span>
          <ChevronDown className={cn('hidden h-3.5 w-3.5 transition-transform duration-300 sm:block', open && 'rotate-180')} />
        </button>
      </div>

      {/* closed: single quick strip — one line only */}
      <AnimatePresence initial={false} mode="wait">
        {!open && (
          <motion.div
            key="strip"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="relative mt-4"
          >
            <QuickStrip catSlug={catSlug} quick={quick} onOpenAll={() => setOpen(true)} remaining={Math.max(lines.length - quickCount, 0)} total={lines.length} />
            {/* edge fades */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent sm:w-16" aria-hidden />
          </motion.div>
        )}

        {/* open: full menu panel */}
        {open && (
          <motion.div
            key="panel"
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="glass mt-4 rounded-2xl p-4 sm:p-6">
              {/* search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar linha… ex: sedas, filtros, trituradores"
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-10 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-gold/60 focus:bg-black/60"
                  aria-label="Buscar linha"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Limpar busca"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-gold"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* grid of lines */}
              <div className="mt-4 grid max-h-[46vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 chat-scroll">
                {filtered.map((l, i) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.025, 0.3) }}
                  >
                    <Link
                      href={`/catalogo?cat=${catSlug}&sub=${l.slug}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 transition-all duration-200 hover:border-gold/60 hover:bg-gold/[0.07]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-neutral-200 transition-colors group-hover:text-gold">
                          {l.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                          {l.count} {l.count === 1 ? 'produto' : 'produtos'}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-gold/12 px-2 py-0.5 text-[10px] font-bold text-gold">{l.count}</span>
                        <ArrowUpRight className="h-4 w-4 text-neutral-600 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <p className="col-span-full py-8 text-center text-sm text-neutral-500">
                    Nenhuma linha encontrada para <span className="text-gold">“{query}”</span>.
                  </p>
                )}
              </div>

              {/* footer */}
              <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  {filtered.length} de {lines.length} linhas
                </p>
                <Link
                  href={`/catalogo?cat=${catSlug}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-light"
                >
                  Ver tudo <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function QuickStrip({
  catSlug,
  quick,
  onOpenAll,
  remaining,
  total,
}: {
  catSlug: string
  quick: LineItem[]
  onOpenAll: () => void
  remaining: number
  total: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  // vertical wheel → horizontal scroll (desktop UX); page keeps scrolling at the ends
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const max = el.scrollWidth - el.clientWidth
      const going = (e.deltaY > 0 && el.scrollLeft < max) || (e.deltaY < 0 && el.scrollLeft > 0)
      if (going) {
        el.scrollLeft += e.deltaY
        e.preventDefault()
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div ref={ref} className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
      {quick.map((l) => (
        <Link
          key={l.id}
          href={`/catalogo?cat=${catSlug}&sub=${l.slug}`}
          className="group flex shrink-0 snap-start items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-neutral-300 transition-all hover:border-gold/60 hover:text-gold"
        >
          {l.name}
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">{l.count}</span>
        </Link>
      ))}
      {/* shortcut into the full menu */}
      <button
        type="button"
        onClick={onOpenAll}
        className="flex shrink-0 snap-start items-center gap-2 rounded-full border border-dashed border-gold/35 px-4 py-2 text-sm font-semibold text-gold/90 transition-all hover:border-gold hover:bg-gold/10"
        aria-label={`Ver todas as ${total} linhas`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        {remaining > 0 ? `+${remaining} linhas` : 'Menu completo'}
      </button>
    </div>
  )
}
