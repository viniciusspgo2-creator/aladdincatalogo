'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldAlert, ShoppingBag, FileDown, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

const emptySubscribe = () => () => {}

/**
 * Age gate — exibido TODA vez que alguém entra no site (sem persistência),
 * conforme solicitação: aviso +18, produtos sensíveis e catálogo B2B.
 */
export function AgeGate() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const [open, setOpen] = useState(true)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (mounted && open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mounted, open])

  if (!mounted) return null

  const deny = () => {
    setAccepted(false)
    setOpen(false)
    window.location.href = 'https://www.google.com'
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="age-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Aviso de conteúdo — maiores de 18 anos"
        >
          {/* smoke ambience */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="smoke-blob absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.16),transparent_65%)]" />
            <div className="smoke-blob smoke-blob-2 absolute -right-16 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_60%)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1], delay: 0.08 }}
            className="glass-gold relative w-full max-w-lg overflow-hidden rounded-2xl p-7 text-center sm:p-10"
          >
            <div className="gold-line absolute inset-x-0 top-0" />

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl brushed-metal border border-gold/40 glow-gold">
              <ShieldAlert className="h-8 w-8 text-gold" aria-hidden />
            </div>

            <p className="kicker mt-6">Aviso de conteúdo sensível</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              Este site é para <span className="text-gold-gradient">maiores de 18 anos</span>
            </h2>

            <div className="mt-4 space-y-2.5 text-left text-[13px] leading-relaxed text-neutral-300">
              <p className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                <span>Contém produtos para <strong className="text-white">tabacaria e headshop</strong> — venda proibida para menores de 18 anos (Lei nº 10.674/2003 e ECA).</span>
              </p>
              <p className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                <span>Catálogo <strong className="text-white">B2B</strong>: preços de atacado exclusivos para lojistas, revendedores e CNPJ.</span>
              </p>
              <p className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                <span>Ao entrar, você declara ter <strong className="text-white">18 anos ou mais</strong> e concorda com o uso responsável das informações.</span>
              </p>
            </div>

            {/* botões sempre empilhados e com quebra de linha — nunca cortados em tela pequena */}
            <div className="mt-7 grid gap-3">
              <Button
                size="lg"
                className="btn-gold-premium h-auto min-h-12 whitespace-normal px-4 py-2.5 text-[13px] font-bold uppercase leading-snug tracking-wider text-black"
                onClick={() => {
                  setAccepted(true)
                  setOpen(false)
                }}
              >
                Tenho 18 anos ou mais — acessar o catálogo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 whitespace-normal border-white/15 bg-transparent px-4 text-sm font-semibold uppercase tracking-widest text-neutral-300 hover:border-red-400/60 hover:text-red-300"
                onClick={deny}
              >
                Sou menor de idade
              </Button>
            </div>

            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              <span className="inline-flex items-center gap-1.5"><ShoppingBag className="h-3 w-3 text-gold/70" /> Varejo B2B</span>
              <span className="inline-flex items-center gap-1.5"><FileDown className="h-3 w-3 text-gold/70" /> Pedido em PDF</span>
              <span className="inline-flex items-center gap-1.5"><Send className="h-3 w-3 text-gold/70" /> Envio Brasil</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
