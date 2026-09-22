import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { searchTokens, tokenizeQuery } from '@/lib/search'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const BUSINESS_INFO = `
INFORMAÇÕES DO NEGÓCIO — ALADDIN DISTRIBUIDORA:
- Distribuidora atacadista B2B de tabacaria, headshop e lifestyle em Goiânia — GO, com envio para todo o Brasil.
- Endereço: ${SITE.address.street}, ${SITE.address.city} — ${SITE.address.state}, CEP ${SITE.address.zip}.
- WhatsApp: ${SITE.whatsapp} | E-mail: ${SITE.email} | Instagram: @${SITE.instagram}.
- Horário: ${SITE.hours}.
- Catálogo digital B2B exclusivo para lojistas (tabacarias, headshops, lojas lifestyle). Venda proibida para menores de 18 anos.
- +60 marcas globais: RAW, OCB, Elements, Zomo, Squadafum, ZGY Brasil, Satya, Lion Rolling Circus, Zengaz, Smoking, Black Hookah, Papelito, Trust Liquid, entre outras.
- Categorias: Narguilé (vasos, rosh, abafador, piteiras), Headshop (bongs, bocais, moedores, bandejas, puffs), Fumo & Tabacos, Essências & Vape, Isqueiros & Maçaricos, Incensos & Aromas, Erva Mate & Tereré (BLACK ERVA: ervas mate premium e acessórios de chimarrão/tereré como bombas, cuias, garrafas térmicas).
- Como comprar (fluxo do pedido B2B): 1) navegue pelo catálogo e toque em "Adicionar pedido"; 2) abra a sacola e ajuste quantidades; 3) clique em "GERAR PEDIDO PDF"; 4) salve o PDF e envie para o seu representante pelo WhatsApp. Preços de atacado; alguns itens têm pedido mínimo por item.
- Páginas do site: /catalogo (catálogo com filtros), /produtos (todos os produtos organizados por marca), /marcas (lista de marcas), /marca/[marca] (página da marca), /narguile e /headshop (mundos especiais), /blog (conteúdo), /contato (fale conosco), /carrinho (sacola de pedidos).
- Não vendemos para consumidor final; o catálogo serve para revenda.
`.trim()

async function searchCatalog(query: string) {
  const tokens = searchTokens(query)
  const result: { products: { name: string; brand: string; slug: string; price: number; stock: number }[]; brands: string[]; categories: string[] } = {
    products: [], brands: [], categories: [],
  }
  try {
    if (tokens.length > 0) {
      // 1ª tentativa: TODOS os termos (precisão). 2ª tentativa: QUALQUER termo (recall).
      let products = await db.product.findMany({
        where: { active: true, AND: tokens.map((t) => ({ searchNorm: { contains: t } })) },
        select: { name: true, slug: true, price: true, stock: true, brand: { select: { name: true } } },
        orderBy: [{ featured: 'desc' }, { soldCount: 'desc' }],
        take: 12,
      })
      if (products.length === 0 && tokens.length > 1) {
        products = await db.product.findMany({
          where: { active: true, OR: tokens.map((t) => ({ searchNorm: { contains: t } })) },
          select: { name: true, slug: true, price: true, stock: true, brand: { select: { name: true } } },
          orderBy: [{ featured: 'desc' }, { soldCount: 'desc' }],
          take: 12,
        })
      }
      const [brands] = await Promise.all([
        db.brand.findMany({ where: { OR: tokens.map((t) => ({ searchNorm: { contains: t } })) }, select: { name: true, slug: true }, take: 5 }),
      ])
      result.products = products.map((p) => ({
        name: p.name, brand: p.brand.name, slug: p.slug,
        price: p.price, stock: p.stock,
      }))
      result.brands = brands.map((b) => `${b.name} (/marca/${b.slug})`)
    }
    // sugestões de contexto: categorias mais relevantes para o site
    const cats = await db.category.findMany({
      orderBy: { order: 'asc' },
      select: { name: true, slug: true, _count: { select: { products: true } } },
    })
    const lower = query.toLowerCase()
    result.categories = cats
      .filter((c) => lower.includes(c.slug.split('-')[0]) || tokenizeQuery(c.name).some((t) => lower.includes(t)))
      .map((c) => `${c.name} (/catalogo?cat=${c.slug}, ${c._count.products} itens)`)
  } catch (e) {
    console.error('chat catalog search', e)
  }
  return result
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages.slice(-8) : []
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser || !lastUser.content?.trim()) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })
    }

    const catalog = await searchCatalog(lastUser.content)

    const catalogContext = `
RESULTADOS DA BUSCA NO CATÁLOGO para "${lastUser.content}":
${catalog.products.length > 0
    ? catalog.products.map((p) => `- ${p.name} | marca: ${p.brand} | R$ ${p.price.toFixed(2)} | ${p.stock > 0 ? `estoque: ${p.stock}` : 'sem estoque'} | link: /produto/${p.slug}`).join('\n')
    : '(nenhum produto com correspondência direta)'}
${catalog.brands.length > 0 ? `MARCAS relacionadas: ${catalog.brands.join(', ')}` : ''}
${catalog.categories.length > 0 ? `CATEGORIAS relacionadas: ${catalog.categories.join(', ')}` : ''}
`.trim()

    const zai = await ZAI.create()

    const systemPrompt = `
Você é o "Gênio da Aladdin" — assistente virtual oficial da Aladdin Distribuidora, especialista no catálogo B2B de tabacaria e headshop. Responda SEMPRE em português brasileiro, de forma amigável, objetiva e profissional (máx. ~150 palavras por resposta). Você conhece todo o catálogo.

REGRAS:
- Use as INFORMAÇÕES DO NEGÓCIO abaixo como fonte da verdade (endereço, contato, fluxo de pedido, políticas).
- Se houver RESULTADOS DA BUSCA NO CATÁLOGO relevantes, recomende os produtos citando nome, marca, preço e o LINK do produto (use o caminho relativo mostrado). Liste no máximo 5 itens.
- Se a pessoa buscar algo que não existe, diga com educação que não encontrou no catálogo e sugira categorias próximas ou diga para tentar outro termo.
- Você NÃO aceita pedidos, NÃO fecha vendas, NÃO processa pagamento: o pedido é feito montando a sacola e gerando o PDF (explique o fluxo quando pedirem).
- Nunca invente produtos, marcas, preços ou estoque que não estejam nos resultados.
- Se perguntarem de entrega/frete/prazos: explique que o representante confirma prazo e frete após o PDF do pedido.
- Venda proibida para menores de 18 anos; recuse educadamente qualquer coisa envolvendo menores.
- Formato: textos curtos; quando listar produtos, use linhas com "• Nome — R$ preço — link".

${BUSINESS_INFO}

${catalogContext}
`.trim()

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      temperature: 0.4,
      max_tokens: 500,
    })

    const reply = completion.choices[0]?.message?.content || 'Desculpe, não consegui responder agora. Tente novamente.'

    return NextResponse.json({ reply })
  } catch (e) {
    console.error('chat api', e)
    return NextResponse.json(
      { error: 'Não foi possível responder agora. Tente novamente em instantes.' },
      { status: 500 },
    )
  }
}
