import Image from 'next/image'
import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical, SITE } from '@/lib/seo'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { SectionHeading } from '@/components/section-heading'

export const metadata = buildMetadata({
  title: 'Sobre a Aladdin — distribuidora premium de tabacaria & headshop em Goiânia',
  description:
    'Conheça a Aladdin Distribuidora: mais de 9 anos conectando lojistas às melhores marcas de tabacaria e headshop do mundo, com curadoria premium e preço de atacado.',
  path: '/sobre',
})

export const revalidate = 3600

export default async function SobrePage() {
  let stats = { products: 0, brands: 0 }
  try {
    ;[stats.products, stats.brands] = await Promise.all([
      db.product.count({ where: { active: true } }),
      db.brand.count(),
    ])
  } catch { /* fallback */ }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Início', url: canonical('/') }, { name: 'Sobre', url: canonical('/sobre') },
      ])) }} />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Sobre' }]} />
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <p className="kicker">Quem somos</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            A ponte entre as <span className="text-gold-gradient">melhores marcas</span> e a sua loja
          </h1>
          <p className="mt-5 leading-relaxed text-neutral-400">
            A {SITE.legalName} nasceu em Goiânia com uma missão simples: dar ao lojista de tabacaria e headshop
            o mesmo padrão de distribuição das grandes indústrias. Curadoria rigorosa, marcas originais,
            estoque real e atendimento que entende de balcão — não de planilha.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { v: '+9', l: 'Anos de experiência no varejo especializado' },
            { v: `${stats.products.toLocaleString('pt-BR')}+`, l: 'Produtos em catálogo com estoque real' },
            { v: `${stats.brands}`, l: 'Marcas oficiais com preço de distribuidor' },
          ].map((s) => (
            <div key={s.l} className="glass rounded-xl p-8 text-center">
              <p className="font-display text-4xl font-bold text-gold-gradient">{s.v}</p>
              <p className="mt-2 text-sm text-neutral-400">{s.l}</p>
            </div>
          ))}
        </div>

        <section className="mt-16" aria-label="Nossa operação">
          <SectionHeading kicker="Como trabalhamos" title="Um padrão acima do atacado comum" />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[
              { t: 'Curadoria de verdade', d: 'Cada produto entra no catálogo depois de passar por três filtros: procedência original, giro comprovado de balcão e margem saudável para o lojista. Nada de catálogo inflado com item parado.' },
              { t: 'Tecnologia no pedido', d: 'Nosso catálogo digital funciona como uma flagship store: navegação por marca, busca inteligente, sacola B2B e geração de pedido em PDF. Você monta a reposição em minutos, de qualquer dispositivo.' },
              { t: 'Relação de longo prazo', d: 'Mais de 9 anos atendendo tabacarias, headshops e lojas lifestyle em Goiás e no Brasil. Nosso time comercial conhece o segmento porque vive o segmento — do balcão à prateleira.' },
              { t: 'Logística pensada no giro', d: 'Operação a partir de Goiânia — GO com envio para todo o Brasil e reposição expressa dos itens de giro. O que vende sempre, nunca pode faltar na sua vitrine.' },
            ].map((c) => (
              <article key={c.t} className="rounded-xl border border-white/8 bg-card p-7">
                <h2 className="font-display text-lg font-bold text-white">{c.t}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-neutral-400">{c.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-gold mt-16 rounded-2xl p-10 text-center" aria-label="Compromisso com o segmento">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Venda responsável é compromisso</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-300">
            A Aladdin Distribuidora apoia a venda exclusiva para maiores de 18 anos, repudia falsificações
            e trabalha apenas com marcas e fabricantes oficiais. Lojista parceiro é parceiro de marca —
            e protege o segmento inteiro.
          </p>
        </section>
      </div>
    </>
  )
}
