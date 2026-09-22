'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { X, SendHorizonal, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const QUICK = [
  'Como faço meu pedido?',
  'Tem papel king size?',
  'Quais marcas de carvão?',
  'Onde vocês ficam?',
]

function renderMsg(text: string) {
  // transforma links relativos em <Link>
  const parts: { type: 'text' | 'link'; value: string }[] = []
  const regex = /\/(produto|marca|catalogo|categoria|produtos|narguile|headshop)\/?([a-z0-9-]*)/gi
  let last = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', value: text.slice(last, m.index) })
    parts.push({ type: 'link', value: m[0] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) })
  return parts.map((p, i) =>
    p.type === 'link' ? (
      <Link key={i} href={p.value} className="font-semibold text-gold underline underline-offset-2 hover:text-gold-light">
        {p.value}
      </Link>
    ) : (
      <span key={i}>{p.value}</span>
    ),
  )
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'Olá! Eu sou o Gênio da Aladdin ✦ Conheço todo o catálogo: produtos, marcas, preços e estoque. O que você procura para o seu balcão?',
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [msgs, pending, open])

  async function send(text: string) {
    const content = text.trim()
    if (!content || pending) return
    const next: Msg[] = [...msgs, { role: 'user', content }]
    setMsgs(next)
    setInput('')
    setPending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-8) }),
      })
      const j = await res.json()
      setMsgs((m) => [...m, { role: 'assistant', content: j.reply || j.error || 'Ops, tente novamente.' }])
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: 'Ops, sem conexão com o Gênio agora. Tente novamente.' }])
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fechar assistente virtual' : 'Abrir assistente virtual Gênio da Aladdin'}
        className="fixed bottom-5 right-5 z-[90] grid h-16 w-16 place-items-center rounded-full"
      >
        <span className="chat-fab-ring absolute inset-0 rounded-full" aria-hidden />
        <span
          className={cn(
            'chat-fab relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border-2 border-gold-light/80 brushed-metal',
            open && 'ring-2 ring-gold/50',
          )}
        >
          <motion.span
            animate={open ? {} : { y: [0, -3, 0], rotate: [0, -2, 2, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
            className="grid place-items-center"
          >
            <Image
              src="/artes/genie-icon.png"
              alt=""
              width={30}
              height={50}
              className="h-[38px] w-auto drop-shadow-[0_0_10px_rgba(232,199,102,0.95)] drop-shadow-[0_0_22px_rgba(201,162,39,0.55)] transition-transform duration-300 hover:scale-110"
              priority
            />
          </motion.span>
        </span>
        {!open && (
          <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-[9px] font-bold text-black shadow-lg">
            1
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-[90] flex h-[540px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gold/25 bg-coal shadow-[0_24px_80px_-12px_rgba(0,0,0,0.9)] sm:right-5"
            role="dialog"
            aria-label="Chat com o Gênio da Aladdin"
          >
            {/* header */}
            <div className="relative flex items-center gap-3 border-b border-white/8 bg-gradient-to-r from-[#141005] to-coal px-4 py-3.5">
              <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-gold/50 bg-black">
                <Image src="/artes/genie-icon.png" alt="" width={20} height={34} className="h-7 w-auto drop-shadow-[0_0_8px_rgba(232,199,102,0.9)]" />
                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-coal bg-emerald-400" />
              </span>
              <div className="flex-1">
                <p className="font-display text-sm font-bold text-white">Gênio da Aladdin</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold/80">Online • conhece todo o catálogo</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar chat"
                className="grid h-8 w-8 place-items-center rounded-md text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={cn('msg-in flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                      m.role === 'user'
                        ? 'rounded-br-sm bg-gold text-black'
                        : 'rounded-bl-sm border border-white/8 bg-white/[0.05] text-neutral-200',
                    )}
                  >
                    {renderMsg(m.content)}
                  </div>
                </div>
              ))}
              {pending && (
                <div className="msg-in flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-xl rounded-bl-sm border border-white/8 bg-white/[0.05] px-4 py-3">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gold" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gold" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gold" />
                  </div>
                </div>
              )}
            </div>

            {/* quick replies */}
            {msgs.length <= 1 && !pending && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[11px] text-gold-light transition-colors hover:bg-gold/20"
                  >
                    <Sparkles className="h-3 w-3" /> {q}
                  </button>
                ))}
              </div>
            )}

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2 border-t border-white/8 bg-black/30 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre produtos, marcas, pedido…"
                aria-label="Mensagem para o assistente"
                className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-white placeholder:text-neutral-500 focus:border-gold/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Enviar mensagem"
                className="btn-gold-premium grid h-10 w-10 place-items-center rounded-lg text-black disabled:opacity-40"
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
