# Aladdin Distribuidora Premium — Catálogo B2B de Tabacaria & Headshop

Plataforma digital premium (Next.js 16 + PostgreSQL/Neon + Prisma) com catálogo B2B organizado por marca, busca inteligente, sacola de pedidos com PDF profissional e painel administrativo completo.

## Stack

- **Next.js 16 (App Router) + TypeScript** — frontend e backend
- **Tailwind CSS 4 + shadcn/ui** — identidade preto absoluto (#050505), branco premium e dourado (#C9A227)
- **Framer Motion + canvas particles** — hero cinematográfico com fumaça e partículas douradas
- **Prisma ORM + PostgreSQL** (Neon na Vercel) — schema pronto para milhares de produtos
- **jsPDF** — gerador de pedido PDF profissional
- **Zustand (persist)** — sacola B2B
- **React Hook Form + Zod** — formulários do painel
- **SEO Enterprise** — metadata por página, canonical, OG/Twitter, JSON-LD (Organization, WebSite, LocalBusiness, Breadcrumb, Product, Article, FAQ), sitemap.xml dinâmico, robots.txt, GA4/GTM

## Estrutura

```
src/app/
  page.tsx                    Home premium (hero, 2 carrosséis infinitos, banners, destaques)
  catalogo/                   Catálogo completo com filtros avançados
  marcas/ + marca/[slug]/     Índice de marcas + página exclusiva por marca
  categoria/[slug]/           Páginas de categoria (7 categorias, 75 subcategorias)
  produto/[slug]/             Página de produto com galeria e JSON-LD Product
  carrinho/                   Sacola B2B → gera PDF do pedido
  blog/ + blog/[slug]/        6 artigos estratégicos de SEO
  sobre/ contato/             Institucional (E-E-A-T) + SEO local
  admin/                      Painel: dashboard, produtos (CRUD+duplicar), marcas,
                              categorias, banners, pedidos, configurações
  api/                        Endpoints públicos + admin protegidos por sessão HMAC
  sitemap.ts robots.ts        SEO técnico
scripts/
  scrape-mercos.js            Scraper do catálogo original (meuspedidos/Mercos)
  transform-catalog.js        Curadoria → brands/categories/products
  seed/seed.ts                Seed idempotente (1.566 produtos, 61 marcas, blog)
  seed/catalog.json           Dataset curado (fonte de verdade)
```

## Deploy na Vercel + Neon

### 1. Variável de ambiente (a única obrigatória)

Na Vercel → **Settings → Environment Variables**, adicione:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | `postgresql://usuario:senha@host/banco?sslmode=require` |

No Neon: crie o projeto → copie a **connection string** (com `?sslmode=require`) → cole em `DATABASE_URL`.

Opcionais:
- `NEXT_PUBLIC_SITE_URL` — URL final do site (canonical/sitemap; a Vercel fornece `VERCEL_URL` automaticamente)
- `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GTM_ID` — Analytics (ou configure no painel em Configurações)
- `ADMIN_SESSION_SECRET` — segredo das sessões admin (troque em produção)
- `ADMIN_PASSWORD` — senha inicial do admin no seed (padrão `aladdin2026`)

### 2. Deploy automático

O `package.json` já está configurado:

```
build = prisma generate && prisma db push --accept-data-loss --skip-generate && next build
```

As tabelas são criadas automaticamente no banco a cada deploy — **nenhum comando manual de migração é necessário**. Todas as páginas que consultam o banco têm try/catch: se o banco estiver vazio no primeiro deploy, o build não quebra.

### 3. Passos manuais (após o primeiro deploy)

**Povoar o catálogo** — rode uma única vez, com a `DATABASE_URL` do Neon:

```bash
npm install
npx prisma db push            # (opcional; o build da Vercel já cria as tabelas)
npm run seed                  # insere marcas, categorias, 1.566 produtos, blog, banners
```

Alternativa sem baixar o projeto: configure a `DATABASE_URL` localmente em um `.env`, rode `npm run seed` apontando para o Neon e pronto.

**Acessar o painel**: `/admin` → usuário `admin` / senha `aladdin2026` (troque em Configurações ou redefina `ADMIN_PASSWORD` antes do seed).

### 4. Regras de projeto (não violar)

- `prisma/schema.prisma`: **somente** `provider = "postgresql"` — nunca sqlite/file
- `.gitignore` já bloqueia `.env`, `.env*.local`, `/node_modules`, `/.next`
- Não usar recursos de filesystem local (Vercel não persiste entre deploys) — imagens são URLs remotas (CDN)

## Desenvolvimento local

```bash
npm install
npm run db:push       # cria tabelas (DATABASE_URL no .env)
npm run seed          # popula o catálogo
npm run dev           # http://localhost:3000
```

## SEO — checklist entregue

- [x] Titles/descriptions únicos por página (pt-BR, com keywords do segmento)
- [x] H1 único por página; hierarquia H2/H3 semântica
- [x] Canonical absoluto automático (`alternates.canonical`)
- [x] Open Graph + Twitter Cards completos (inclusive og:image dinâmico)
- [x] robots.txt (bloqueia /admin, /api, /carrinho) + sitemap.xml dinâmico com produtos/marcas/categorias/blog
- [x] JSON-LD: Organization, WebSite+SearchAction, LocalBusiness (Goiânia, horários, geo), BreadcrumbList, Product (preço/estoque), Article, FAQPage
- [x] SEO local: endereço, telefone, horários, mapa, área atendida (pronto p/ Google Business Profile)
- [x] Core Web Vitals: next/image (AVIF/WebP, lazy, width/height fixos), fontes swap, hero sem imagem pesada (CSS/canvas), partículas a 30fps e `prefers-reduced-motion`
- [x] GA4 + GTM via variáveis de ambiente + eventos de conversão (add_to_bag, generate_order)
- [x] E-E-A-T: página Sobre, autores, compromisso com venda responsável, provas sociais
