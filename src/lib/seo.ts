import type { Metadata } from 'next'

export const SITE = {
  name: 'Aladdin Distribuidora',
  legalName: 'Aladdin Distribuidora Goiás LTDA',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://aladdin-distribuidora.vercel.app',
  tagline: 'A nova geração da tabacaria começa aqui',
  description:
    'Distribuidora premium de tabacaria e headshop: sedas RAW e OCB, fumo Zomo, vidro Squadafum, carvão Ziggy, incensos Satya e mais de 1.500 produtos com preço de atacado para lojistas. Goiânia — GO, envio para todo o Brasil.',
  shortDescription:
    'Catálogo B2B premium de tabacaria e headshop — marcas globais, preço de atacado e reposição rápida.',
  locale: 'pt_BR',
  address: {
    street: 'Av. Dr. Ismerino Soares de Carvalho, 292 — St. Aeroporto',
    city: 'Goiânia',
    state: 'GO',
    zip: '74075-040',
    country: 'BR',
  },
  phone: '+55-62-99546-0509',
  whatsapp: '5562995460509',
  email: 'contato@aladdindistribuidora.com.br',
  instagram: 'aladdin.distribuidora',
  hours: 'Seg–Sex 08h–18h, Sáb 08h–12h',
  geo: { lat: -16.6799, lng: -49.255 },
  keywords: [
    'distribuidora de tabacaria',
    'atacado tabacaria',
    'headshop atacado',
    'fumo de narguilé atacado',
    'sedas para revenda',
    'carvão de coco atacado',
    'distribuidora headshop goiânia',
    'fornecedor de tabacaria',
    'essência vape atacado',
    'produtos para tabacaria',
  ],
}

export function canonical(path?: string) {
  return path ? `${SITE.url}${path}` : SITE.url
}

interface SeoInput {
  title: string
  description?: string
  path?: string
  images?: string[]
  noIndex?: boolean
  type?: 'website' | 'article' | 'product'
}

export function buildMetadata({ title, description, path, images, noIndex, type = 'website' }: SeoInput): Metadata {
  const desc = description || SITE.description
  const url = canonical(path)
  const ogImages = images?.length ? images : [`${SITE.url}/opengraph-image`]
  const ogType = type === 'article' ? 'article' : 'website'
  return {
    title,
    description: desc,
    keywords: SITE.keywords,
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.legalName,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        },
    openGraph: {
      type: ogType,
      url,
      title: `${title} | ${SITE.name}`,
      description: desc,
      siteName: SITE.name,
      locale: SITE.locale,
      images: ogImages.map((i) => ({ url: i })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE.name}`,
      description: desc,
      images: ogImages,
    },
  }
}

/* ── JSON-LD builders ── */
export const orgJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.legalName,
  alternateName: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/icon-512.png`,
  description: SITE.shortDescription,
  email: SITE.email,
  telephone: SITE.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.state,
    postalCode: SITE.address.zip,
    addressCountry: SITE.address.country,
  },
  sameAs: [`https://instagram.com/${SITE.instagram}`],
})

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.name,
  description: SITE.shortDescription,
  publisher: { '@id': `${SITE.url}/#organization` },
  inLanguage: 'pt-BR',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/catalogo?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
})

export const localBusinessJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE.url}/#localbusiness`,
  name: SITE.legalName,
  image: `${SITE.url}/opengraph-image`,
  url: SITE.url,
  telephone: SITE.phone,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.state,
    postalCode: SITE.address.zip,
    addressCountry: SITE.address.country,
  },
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:00', closes: '12:00' },
  ],
  areaServed: { '@type': 'Country', name: 'Brasil' },
})

export const breadcrumbJsonLd = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: it.url,
  })),
})

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
})
