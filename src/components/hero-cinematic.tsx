'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, MousePointer2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ParticleField } from '@/components/particle-field'

const EASE = [0.22, 0.61, 0.36, 1] as const

export function HeroCinematic({ stats }: { stats: { brands: number; products: number } }) {
  return (
    <section className="relative overflow-hidden noise" aria-label="Apresentação da Aladdin Distribuidora">
      {/* layered cinematic background — arte visível, texto sempre legível */}
      <div className="absolute inset-0" aria-hidden>
        {/* flagship art em quase opacidade total: a imagem precisa ser vista */}
        <Image
          src="/artes/hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-[0.95]"
        />
        {/* vinheta suave apenas atrás do bloco de texto (centro) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_64%_at_50%_44%,rgba(5,5,5,0.86)_0%,rgba(5,5,5,0.5)_46%,transparent_74%)]" />
        {/* brilho de marca discreto na base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_118%,rgba(20,16,5,0.6)_0%,transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/90 to-transparent" />
        <div className="smoke-blob absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.13),transparent_65%)]" />
        <div className="smoke-blob smoke-blob-2 absolute right-[-10%] top-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="smoke-blob smoke-blob-3 absolute left-1/3 bottom-[-30%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.09),transparent_60%)]" />
        <ParticleField />
        {/* spotlight cone */}
        <div className="absolute left-1/2 top-[-20%] h-[130%] w-[70%] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_40%,rgba(201,162,39,0.06)_50%,transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-7xl flex-col items-center justify-center px-4 pb-20 pt-32 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="glass-gold mb-7 inline-flex items-center gap-2.5 rounded-full px-4 py-1.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold-light">
            Atacado B2B • +{Math.max(1800, stats.products).toLocaleString('pt-BR')} itens
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
          className="max-w-5xl font-display text-[clamp(2rem,5.6vw,4.35rem)] font-bold uppercase leading-[1.02] tracking-tight text-white"
        >
          Abasteça sua loja com as <span className="text-gold-gradient shimmer">melhores marcas</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="mt-4 font-display text-lg font-semibold text-white/95 sm:text-2xl"
        >
          Tabacaria e Headshop <span className="text-gold-gradient">em um só lugar</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.28, ease: EASE }}
          className="mt-5 max-w-2xl text-balance text-sm leading-relaxed text-neutral-300 sm:text-base"
        >
          Mais de 1.800 produtos para lojistas, tabacarias, headshops e lojas lifestyle. Encontre as principais
          marcas, monte seu pedido e compre no atacado com a Aladdin Distribuidora.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="btn-gold-premium group h-14 min-w-64 px-10 text-base font-bold uppercase tracking-widest text-black"
          >
            <Link href="/catalogo" id="cta-acessar-catalogo">
              Acessar catálogo
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-16 grid w-full max-w-2xl grid-cols-3 divide-x divide-white/10"
        >
          {[
            { v: `${stats.brands}+`, l: 'Marcas globais' },
            { v: `${Math.max(1800, stats.products).toLocaleString('pt-BR')}+`, l: 'Produtos em catálogo' },
            { v: '48h', l: 'Reposição expressa' },
          ].map((s) => (
            <div key={s.l} className="px-4">
              <p className="font-display text-3xl font-bold text-gold-gradient sm:text-4xl">{s.v}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-neutral-500">{s.l}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { delay: 1.2, duration: 1 }, y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } }}
          className="absolute bottom-6 flex items-center gap-2 text-neutral-600"
          aria-hidden
        >
          <MousePointer2 className="h-4 w-4" />
          <span className="text-[10px] uppercase tracking-[0.3em]">Explore</span>
        </motion.div>
      </div>
    </section>
  )
}
