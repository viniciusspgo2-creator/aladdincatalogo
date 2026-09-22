import Link from 'next/link'
import { ShoppingBag, ClipboardList, FileDown, Send } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    icon: ShoppingBag,
    n: '01',
    t: 'Monte sua sacola',
    d: 'Navegue pelo catálogo, use a busca inteligente e toque em “Adicionar pedido” nos itens que o seu balcão precisa.',
  },
  {
    icon: ClipboardList,
    n: '02',
    t: 'Ajuste quantidades',
    d: 'Na sacola, revise itens, aumente quantidades por atacado e preencha os dados da sua loja em segundos.',
  },
  {
    icon: FileDown,
    n: '03',
    t: 'Gere o PDF do pedido',
    d: 'Com um toque, o sistema monta um PDF profissional com todos os produtos, valores e observações do pedido.',
  },
  {
    icon: Send,
    n: '04',
    t: 'Envie ao representante',
    d: 'Salve o PDF e envie para o seu representante Aladdin pelo WhatsApp. Pedido confirmado, é só aguardar a entrega.',
  },
]

export function HowToOrder() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-label="Como montar seu pedido">
      <Reveal>
        <div className="text-center">
          <p className="kicker">Como montar o pedido</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Da sacola ao PDF em <span className="text-gold-gradient">4 passos</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400 sm:text-base">
            Sem cadastro complicado, sem carrinho frustrante: você monta o pedido pelo catálogo e envia direto para o seu representante.
          </p>
        </div>
      </Reveal>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 90} as="li">
            <div className="group relative h-full overflow-hidden rounded-xl border border-white/8 bg-card p-6 transition-all duration-300 hover:border-gold/40 hover:shadow-[0_0_44px_-12px_rgba(201,162,39,0.4)]">
              <span className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-7xl font-bold text-white/[0.04] transition-colors group-hover:text-gold/10" aria-hidden>
                {s.n}
              </span>
              <span className="relative grid h-12 w-12 place-items-center rounded-lg brushed-metal border border-gold/30 transition-colors group-hover:border-gold/70">
                <s.icon className="h-5 w-5 text-gold" aria-hidden />
              </span>
              <h3 className="relative mt-4 font-display text-lg font-bold text-white">
                <span className="mr-2 text-xs font-bold tracking-[0.2em] text-gold">{s.n}</span>
                {s.t}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-neutral-400">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mt-8 text-center">
        <Button
          asChild
          size="lg"
          className="btn-gold-premium h-12 px-10 text-sm font-bold uppercase tracking-widest text-black"
        >
          <Link href="/catalogo">Começar a montar meu pedido</Link>
        </Button>
      </Reveal>
    </section>
  )
}
