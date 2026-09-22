// Idempotent seeder — populates Neon/PostgreSQL with the curated catalog
// Run: npx tsx scripts/seed/seed.ts   (requires DATABASE_URL postgresql://…)
import { PrismaClient } from '@prisma/client'
import { scryptSync, randomBytes } from 'crypto'
import fs from 'fs'
import path from 'path'
import { BLOG_SEEDS } from './blog-content'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function slugify(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90)
}

async function main() {
  const catPath = path.join(__dirname, 'catalog.json')
  const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8')) as {
    brands: { name: string; slug: string; tagline: string; description: string; featured: boolean; order: number }[]
    categories: { name: string; slug: string; subs: string[] }[]
    products: {
      code: string; name: string; slug: string; brand: string; category: string; subcategory: string | null
      price: number; oldPrice: number | null; stock: number; unit: string; images: string[]
      featured: boolean; isNew: boolean; onSale: boolean; description: string
    }[]
  }

  console.log('Seeding brands…')
  const brandIdBySlug = new Map<string, string>()
  for (const [i, b] of catalog.brands.entries()) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, tagline: b.tagline, description: b.description, featured: b.featured, order: b.order },
      create: { name: b.name, slug: b.slug, tagline: b.tagline, description: b.description, featured: b.featured, order: b.order },
    })
    brandIdBySlug.set(b.slug, brand.id)
  }

  console.log('Seeding categories & subcategories…')
  const catIdBySlug = new Map<string, string>()
  const subIdByKey = new Map<string, string>()
  for (const [i, c] of catalog.categories.entries()) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, order: i },
      create: { name: c.name, slug: c.slug, order: i, icon: '✦' },
    })
    catIdBySlug.set(c.slug, cat.id)
    for (const [j, subName] of c.subs.entries()) {
      const subSlug = slugify(subName)
      const sub = await prisma.subCategory.upsert({
        where: { categoryId_slug: { categoryId: cat.id, slug: subSlug } },
        update: { name: subName, order: j },
        create: { name: subName, slug: subSlug, categoryId: cat.id, order: j },
      })
      subIdByKey.set(`${c.slug}|${subSlug}`, sub.id)
    }
  }

  const existing = await prisma.product.count()
  if (existing >= catalog.products.length - 5) {
    console.log(`Products already seeded (${existing}). Skipping product bulk insert.`)
  } else {
    console.log(`Seeding ${catalog.products.length} products…`)
    // chunked createMany for products
    const rows = catalog.products.map((p, i) => ({
      name: p.name, slug: p.slug, code: p.code,
      brandId: brandIdBySlug.get(slugify(p.brand))!,
      categoryId: catIdBySlug.get(slugify(p.category)) ?? null,
      subCategoryId: p.subcategory ? (subIdByKey.get(`${slugify(p.category)}|${slugify(p.subcategory)}`) ?? null) : null,
      description: p.description, price: p.price, oldPrice: p.oldPrice,
      minQuantity: 1, stock: Math.max(0, Math.round(p.stock)), unit: p.unit,
      soldCount: 500 - (i % 480), featured: p.featured, isNew: p.isNew, onSale: p.onSale, active: true,
    }))
    for (let i = 0; i < rows.length; i += 200) {
      await prisma.product.createMany({ data: rows.slice(i, i + 200), skipDuplicates: true })
      process.stdout.write(`  products ${Math.min(i + 200, rows.length)}/${rows.length}\r`)
    }
    console.log('\nSeeding product images…')
    const dbProducts = await prisma.product.findMany({ select: { id: true, slug: true }, where: { slug: { in: catalog.products.map(p => p.slug) } } })
    const idBySlug = new Map(dbProducts.map(p => [p.slug, p.id]))
    const imgRows: { productId: string; url: string; order: number; alt: string }[] = []
    for (const p of catalog.products) {
      const pid = idBySlug.get(p.slug); if (!pid) continue
      p.images.slice(0, 6).forEach((url, k) => imgRows.push({ productId: pid, url, order: k, alt: p.name }))
    }
    for (let i = 0; i < imgRows.length; i += 400) {
      await prisma.productImage.createMany({ data: imgRows.slice(i, i + 400), skipDuplicates: false })
      process.stdout.write(`  images ${Math.min(i + 400, imgRows.length)}/${imgRows.length}\r`)
    }
    console.log('')
  }

  console.log('Seeding settings, banners, admin, blog…')
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  })

  const bannerCount = await prisma.banner.count()
  if (bannerCount === 0) {
    const pick = (catName: string) => catalog.products.find(p => p.category === catName && p.images.length > 0)
    const picks = [
      { cat: 'Narguilé', title: 'Narguilé Premium', subtitle: 'Vasos, stems e rosh das marcas que dominam o balcão', slug: 'narguile' },
      { cat: 'Headshop', title: 'Headshop Elite', subtitle: 'Vidro, metal e design: a categoria de maior margem', slug: 'headshop' },
      { cat: 'Fumo & Tabacos', title: 'Fumos & Tabacos', subtitle: 'Zomo, ZGY, Black Jack e os sabores que giram', slug: 'fumo-tabacos' },
    ]
    for (const [i, b] of picks.entries()) {
      const p = pick(b.cat)
      await prisma.banner.create({
        data: { title: b.title, subtitle: b.subtitle, imageUrl: p?.images[0], linkUrl: `/categoria/${b.slug}`, placement: 'HOME', order: i, active: true },
      })
    }
  }

  const admin = await prisma.user.findUnique({ where: { username: 'admin' } })
  if (!admin) {
    await prisma.user.create({
      data: { username: 'admin', passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'aladdin2026'), name: 'Administrador Aladdin', role: 'ADMIN' },
    })
    console.log('Admin created: admin / aladdin2026 (change after first login)')
  }

  for (const post of BLOG_SEEDS) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { title: post.title, excerpt: post.excerpt, content: post.content, keywords: post.keywords, readTime: post.readTime, category: post.category },
      create: {
        title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
        category: post.category, keywords: post.keywords, readTime: post.readTime, author: post.author,
        coverUrl: null, published: true,
      },
    })
  }

  const counts = {
    brands: await prisma.brand.count(),
    categories: await prisma.category.count(),
    subs: await prisma.subCategory.count(),
    products: await prisma.product.count(),
    images: await prisma.productImage.count(),
    posts: await prisma.blogPost.count(),
  }
  console.log('SEED DONE ✦', counts)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
