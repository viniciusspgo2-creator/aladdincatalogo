import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight, Sparkles, Truck, ShieldCheck, Clock3 } from 'lucide-react'
import { db } from '@/lib/db'
import { buildMetadata } from '@/lib/seo'
import { HeroCinematic } from '@/components/hero-cinematic'
import { BrandMarquee } from '@/components/brand-marquee'
import { ProductGrid } from '@/components/product-grid'
import { Reveal } from '@/components/reveal'
import { HowToOrder } from '@/components/how-to-order'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { faqJsonLd } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Aladdin Distribuidora — Atacado Premium de Tabacaria & Headshop',
  description:
    'Abasteça sua loja com as melhores marcas. Tabacaria e Headshop em um só lugar: mais de 1.800 produtos para lojistas, tabacarias, headshops e lojas lifestyle. Monte seu pedido e compre no atacado com a Aladdin Distribuidora — Goiânia/GO, envio Brasil.',
  path: '/',
})

export const revalidate = 300

async function getHomeData() {
  try {
    const [brands, products, featured, banners, posts, brandTotal] = await Promise.all([
      db.brand.findMany({ where: { featured: true }, orderBy: { order: 'asc' }, take: 22 }),
      db.product.count({ where: { active: true } }),
      db.product.findMany({
        where: { active: true, OR: [{ featured: true }, { isNew: true }] },
        include: { brand: true, category: true, subCategory: true, images: { orderBy: { order: 'asc' }, take: 1 } },
        orderBy: [{ featured: 'desc' }, { soldCount: 'desc' }],
        take: 4,
      }),
      db.banner.findMany({ where: { active: true, placement: 'HOME' }, orderBy: { order: 'asc' } }),
      db.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' }, take: 3 }),
      db.brand.count(),
    ])
    return { brands, products, featured, banners, posts, brandTotal, ok: true }
  } catch (e) {
    console.error('home data error', e)
    return { brands: [], products: 0, featured: [], banners: [], posts: [], brandTotal: 0, ok: false }
  }
}

const HOME_FAQ = [
  { q: 'Como comprar no atacado na Aladdin Distribuidora?', a: 'Basta navegar pelo catálogo digital, adicionar os produtos à sacola de pedidos e gerar o PDF do pedido. Envie o arquivo para o seu representante pelo WhatsApp e receba a confirmação com prazo e frete.' },
  { q: 'Quais marcas de tabacaria e headshop a Aladdin trabalha?', a: 'Trabalhamos com mais de 60 marcas: RAW, OCB, Elements, Zomo, Squadafum, ZGY Brasil, Satya, Lion Rolling Circus, Zengaz, Smoking e muitas outras, todas com procedência original.' },
  { q: 'A Aladdin envia para todo o Brasil?', a: 'Sim. Estamos sediados em Goiânia — GO e distribuímos para lojistas de todo o Brasil com reposição rápida e condições progressivas de atacado.' },
  { q: 'O catálogo é aberto para consumidores finais?', a: 'O catálogo é B2B, voltado para donos de tabacarias, headshops e lojas lifestyle. Consumidor final deve comprar nos estabelecimentos que revendem nossas marcas.' },
]

// Fallback das artes oficiais caso os banners do banco estejam vazios
const FALLBACK_BANNERS = [
  { id: 'fb-narguile', title: 'Narguilé Premium', subtitle: 'Vasos, stems e rosh das marcas que dominam o balcão', imageUrl: '/artes/colecao-narguile.jpg', linkUrl: '/narguile' },
  { id: 'fb-headshop', title: 'Headshop Elite', subtitle: 'Vidro, metal e design: a categoria de maior margem', imageUrl: '/artes/colecao-headshop.jpg', linkUrl: '/headshop' },
  { id: 'fb-fumos', title: 'Fumos & Tabacos', subtitle: 'Zomo, ZGY, Black Jack e os sabores que giram', imageUrl: '/artes/colecao-fumos.jpg', linkUrl: '/catalogo?cat=fumo-tabacos' },
]

export default async function HomePage() {
  const { brands, products, banners, posts, brandTotal } = await getHomeData()
  const bannersFinal = banners.length > 0 ? banners : FALLBACK_BANNERS

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(HOME_FAQ)) }} />
      <HeroCinematic stats={{ brands: brandTotal || brands.length || 61, products: products || 1566 }} />
      <BrandMarquee brands={brands.map((b) => ({ name: b.name, slug: b.slug }))} />

      {/* Coleções — Universos que faturam */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-label="Coleções em destaque">
        <SectionHeading kicker="Coleções" title="Universos que faturam" link={{ href: '/catalogo', label: 'Ver catálogo completo' }} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {bannersFinal.map((b, i) => (
            <Reveal key={b.id} delay={i * 100}>
              <Link
                href={b.linkUrl || '/catalogo'}
                className="group relative block h-64 overflow-hidden rounded-xl border border-white/8 sm:h-72"
              >
                {b.imageUrl && (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl font-bold text-white">{b.title}</h3>
                  {b.subtitle && <p className="mt-1 text-sm text-neutral-300">{b.subtitle}</p>}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold">
                    Explorar <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Navegue por categoria — logo abaixo de Universos que faturam */}
      <CategoriesSection />

      {/* Destaques — apenas 4 itens */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-label="Produtos em destaque">
        <SectionHeading
          kicker="Seleção da casa"
          title="Destaques do catálogo"
          link={{ href: '/produtos', label: 'Ver catálogo completo' }}
        />
        <Suspense>
          <ProductGrid query={{ ordem: 'mais-vendidos' }} perPage={4} />
        </Suspense>
        <Reveal className="mt-6 text-center lg:hidden">
          <Button asChild variant="outline" className="h-11 border-gold/40 px-8 text-xs font-bold uppercase tracking-[0.25em] text-gold hover:bg-gold/10">
            <Link href="/produtos">
              Ver todos os produtos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </section>

      {/* Como montar o pedido */}
      <HowToOrder />

      {/* Trust bar */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-label="Diferenciais">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: '100% original', d: 'Marcas oficiais, direto de fábrica — zero falsificação.' },
            { icon: Truck, t: 'Envio Brasil', d: 'Logística rápida a partir de Goiânia para todo o país.' },
            { icon: Clock3, t: 'Reposição 48h', d: 'Os itens de giro nunca ficam de fora da sua vitrine.' },
            { icon: Sparkles, t: 'Curadoria premium', d: 'Só entra no catálogo o que gira e entrega margem.' },
          ].map((f, i) => (
            <Reveal key={f.t} delay={i * 80}>
              <div className="glass h-full rounded-lg p-6 transition-colors hover:border-gold/30">
                <f.icon className="h-6 w-6 text-gold" aria-hidden />
                <h3 className="mt-3 font-display font-bold text-white">{f.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Blog teaser */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-label="Blog — conteúdo para lojistas">
          <SectionHeading kicker="Aladdin Journal" title="Conteúdo para crescer no segmento" link={{ href: '/blog', label: 'Ver blog' }} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <Link href={`/blog/${p.slug}`} className="card-3d card-shine group block h-full rounded-lg border border-white/8 bg-card p-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{p.category}</p>
                  <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white group-hover:text-gold transition-colors">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{p.excerpt}</p>
                  <p className="mt-4 text-xs text-neutral-500">{p.readTime} min de leitura</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6" aria-label="Criar pedido">
        <Reveal>
          <div className="glass-gold relative overflow-hidden rounded-2xl px-6 py-16 text-center sm:px-16">
            <div className="smoke-blob absolute right-0 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.2),transparent_60%)]" aria-hidden />
            <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">
              Monte seu pedido <span className="text-gold-gradient">em minutos</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-300">
              Adicione produtos à sacola, gere o PDF profissional do pedido e envie direto para o seu representante no WhatsApp.
            </p>
            <Button asChild size="lg" className="btn-gold-premium mt-8 h-14 px-10 text-sm font-bold uppercase tracking-[0.2em] text-black">
              <Link href="/catalogo">Começar agora</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  )
}

async function CategoriesSection() {
  let cats: { id: string; name: string; slug: string; _count: { products: number } }[] = []
  try {
    cats = await db.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true, slug: true, _count: { select: { products: { where: { active: true } } } } },
    })
  } catch { /* fallback */ }
  if (cats.length === 0) return null

  const icons: Record<string, string> = {
    'narguile': '💨', 'headshop': '🔮', 'fumo-tabacos': '🍂', 'essencias-vape': '⚡',
    'isqueiros-macaricos': '🔥', 'incensos-aromas': '🕯️', 'erva-mate-terere': '🧉',
  }
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-label="Categorias do catálogo">
      <SectionHeading
        kicker="Navegue por categoria"
        title="Tudo que o seu balcão precisa"
        link={{ href: '/produtos', label: 'Ver catálogo completo' }}
      />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cats.map((c, i) => (
          <Reveal key={c.id} delay={i * 60}>
            <Link
              href={`/categoria/${c.slug}`}
              className="group relative flex h-full min-h-[7.25rem] flex-col justify-between rounded-xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-transparent p-4 transition-all duration-300 hover:border-gold/50 hover:shadow-[0_0_40px_-12px_rgba(201,162,39,0.35)] sm:min-h-[8.5rem] sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-xl transition-colors group-hover:border-gold/40 sm:h-11 sm:w-11 sm:text-2xl"
                  aria-hidden
                >
                  {icons[c.slug] || '✦'}
                </span>
                <span className="whitespace-nowrap rounded-full border border-white/8 bg-black/30 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400 sm:text-[10px]">
                  {c._count.products.toLocaleString('pt-BR')} {c._count.products === 1 ? 'produto' : 'produtos'}
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <h3 className="font-display text-sm font-bold leading-tight text-white transition-colors group-hover:text-gold sm:text-base">
                  {c.name}
                </h3>
                <ArrowRight
                  className="mb-0.5 h-4 w-4 shrink-0 text-neutral-600 transition-all group-hover:translate-x-1 group-hover:text-gold"
                  aria-hidden
                />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
