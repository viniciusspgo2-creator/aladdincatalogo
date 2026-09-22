import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical, SITE, faqJsonLd } from '@/lib/seo'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Phone, Mail, MapPin, Clock, Instagram, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = buildMetadata({
  title: 'Contato — fale com a distribuidora de tabacaria e headshop de Goiânia',
  description:
    'Fale com a Aladdin Distribuidora: WhatsApp (62) 99546-0509, contato@aladdindistribuidora.com.br. Goiânia — GO. Atendimento B2B Seg–Sex 08h–18h e Sáb 08h–12h.',
  path: '/contato',
})

export const revalidate = 3600

const FAQ = [
  { q: 'Como me tornar lojista parceiro da Aladdin?', a: 'Entre em contato pelo WhatsApp (62) 99546-0509 com seu CNPJ e dados da loja. Nossa equipe comercial libera seu acesso e condições de atacado no mesmo dia útil.' },
  { q: 'Quais os canais de atendimento?', a: 'WhatsApp, e-mail e telefone: Seg a Sex das 08h às 18h e Sábado das 08h às 12h. Você também pode gerar seu pedido pelo catálogo digital e enviar ao representante.' },
  { q: 'Vocês atendem fora de Goiás?', a: 'Sim, enviamos para todo o Brasil. A operação sai de Goiânia — GO com transportadoras e correios parceiros.' },
  { q: 'Qual o pedido mínimo?', a: 'Trabalhamos com pedido mínimo por item (indicado em cada produto) e condições progressivas por volume. Fale com o representante para condições especiais de kits e displays.' },
]

export default async function ContatoPage() {
  let settings: Record<string, string> = {}
  try {
    const s = await db.siteSettings.findFirst()
    if (s) settings = { phone: s.phone, whatsapp: s.whatsapp, email: s.email, address: s.address, hours: s.businessHours, repName: s.repName, repPhone: s.repPhone, repEmail: s.repEmail }
  } catch { /* fallback */ }

  const phone = settings.phone || SITE.phone
  const whatsapp = settings.whatsapp || SITE.whatsapp
  const email = settings.email || SITE.email
  const address = settings.address || `${SITE.address.street}, ${SITE.address.city} — ${SITE.address.state}, ${SITE.address.zip}`
  const hours = settings.hours || SITE.hours

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([
          faqJsonLd(FAQ),
          breadcrumbJsonLd([{ name: 'Início', url: canonical('/') }, { name: 'Contato', url: canonical('/contato') }]),
        ]) }}
      />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Contato' }]} />
        <p className="kicker mt-6">Fale com a gente</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
          Seu representante está a <span className="text-gold-gradient">uma mensagem</span> de distância
        </h1>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="card-3d card-shine flex items-center gap-5 rounded-xl border border-white/8 bg-card p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400"><MessageCircle className="h-6 w-6" /></span>
              <div><p className="text-xs uppercase tracking-widest text-neutral-500">WhatsApp comercial</p><p className="font-display text-lg font-bold text-white">{phone}</p></div>
            </a>
            <a href={`mailto:${email}`} className="card-3d card-shine flex items-center gap-5 rounded-xl border border-white/8 bg-card p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold"><Mail className="h-6 w-6" /></span>
              <div><p className="text-xs uppercase tracking-widest text-neutral-500">E-mail</p><p className="font-display text-lg font-bold text-white">{email}</p></div>
            </a>
            <div className="flex items-center gap-5 rounded-xl border border-white/8 bg-card p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white/5 text-neutral-300"><MapPin className="h-6 w-6" /></span>
              <div><p className="text-xs uppercase tracking-widest text-neutral-500">Endereço</p><p className="font-display text-lg font-bold text-white">{address}</p></div>
            </div>
            <div className="flex items-center gap-5 rounded-xl border border-white/8 bg-card p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white/5 text-neutral-300"><Clock className="h-6 w-6" /></span>
              <div><p className="text-xs uppercase tracking-widest text-neutral-500">Horário</p><p className="font-display text-lg font-bold text-white">{hours}</p></div>
            </div>
            <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noopener noreferrer" className="card-3d card-shine flex items-center gap-5 rounded-xl border border-white/8 bg-card p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white/5 text-neutral-300"><Instagram className="h-6 w-6" /></span>
              <div><p className="text-xs uppercase tracking-widest text-neutral-500">Instagram</p><p className="font-display text-lg font-bold text-white">@{SITE.instagram}</p></div>
            </a>
          </div>

          <div>
            <div className="glass rounded-xl p-7">
              <h2 className="font-display text-xl font-bold text-white">Representante comercial</h2>
              <p className="mt-2 text-sm text-neutral-400">
                {settings.repName || 'Vinícius — Representante Comercial'} atende Goiás e todo o Brasil.
                Gere seu pedido no catálogo e envie o PDF pelo WhatsApp para receber confirmação de estoque, frete e prazo.
              </p>
              <Link href="/catalogo" className="mt-5 inline-block rounded-md bg-gold px-7 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-light">
                Montar meu pedido
              </Link>
            </div>
            <div className="mt-6 overflow-hidden rounded-xl border border-white/8">
              <iframe
                title="Localização da Aladdin Distribuidora em Goiânia"
                src="https://www.google.com/maps?q=Av.+Dr.+Ismerino+Soares+de+Carvalho,+292,+Goi%C3%A2nia+GO&output=embed"
                width="100%" height="320" loading="lazy"
                className="grayscale-[60%] invert-[92%] hue-rotate-180 contrast-[90%]"
              />
            </div>
          </div>
        </div>

        <section className="mt-16" aria-label="Perguntas frequentes">
          <h2 className="font-display text-2xl font-bold text-white">Perguntas frequentes</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-lg border border-white/8 bg-card p-5">
                <summary className="cursor-pointer list-none font-display font-semibold text-neutral-100 group-open:text-gold">
                  <span className="mr-2 text-gold">✦</span>{f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
