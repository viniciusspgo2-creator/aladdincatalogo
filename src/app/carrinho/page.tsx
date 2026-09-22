import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { buildMetadata, breadcrumbJsonLd, canonical } from '@/lib/seo'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { BagClient } from '@/components/bag-client'

export const metadata = buildMetadata({
  title: 'Sacola de pedidos — gere seu PDF e envie ao representante',
  description: 'Revise seu pedido B2B, ajuste quantidades, preencha seus dados e gere o PDF profissional do pedido para enviar ao seu representante Aladdin pelo WhatsApp.',
  path: '/carrinho',
  noIndex: true,
})

export default async function CarrinhoPage() {
  let settings: { brandName: string; repName: string; repEmail: string; repPhone: string; whatsapp: string } | null = null
  try {
    settings = await db.siteSettings.findFirst({
      select: { brandName: true, repName: true, repEmail: true, repPhone: true, whatsapp: true },
    })
  } catch { /* fallback in client */ }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Início', url: canonical('/') }, { name: 'Sacola', url: canonical('/carrinho') },
      ])) }} />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Sacola de pedidos' }]} />
        <p className="kicker mt-6">Pedido B2B</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
          Sua <span className="text-gold-gradient">sacola</span>
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Revise itens e quantidades, preencha os dados da sua loja e gere o PDF oficial do pedido para enviar ao representante.
        </p>
        <BagClient
          settings={settings || { brandName: 'Aladdin Distribuidora', repName: 'Equipe Comercial Aladdin', repEmail: 'contato@aladdindistribuidora.com.br', repPhone: '(62) 99546-0509', whatsapp: '5562995460509' }}
        />
      </div>
    </>
  )
}
