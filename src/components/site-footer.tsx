'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { SITE } from '@/lib/seo'

const CATEGORY_LINKS = [
  { href: '/categoria/narguile', label: 'Narguilé' },
  { href: '/categoria/headshop', label: 'Headshop' },
  { href: '/categoria/fumo-tabacos', label: 'Fumo & Tabacos' },
  { href: '/categoria/essencias-vape', label: 'Essências & Vape' },
  { href: '/categoria/isqueiros-macaricos', label: 'Isqueiros & Maçaricos' },
  { href: '/categoria/incensos-aromas', label: 'Incensos & Aromas' },
  { href: '/categoria/erva-mate-terere', label: 'Erva Mate & Tereré' },
]

const TOP_BRANDS = [
  { href: '/marca/squadafum', label: 'Squadafum' },
  { href: '/marca/raw', label: 'RAW' },
  { href: '/marca/ocb', label: 'OCB' },
  { href: '/marca/zomo', label: 'Zomo' },
  { href: '/marca/elements', label: 'Elements' },
  { href: '/marca/zgy-brasil', label: 'ZGY Brasil' },
  { href: '/marca/satya', label: 'Satya' },
]

const ROUTES = {
  maps: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Av. Dr. Ismerino Soares de Carvalho, 292 - St. Aeroporto, Goiânia - GO, 74075-040'),
  waze: 'https://waze.com/ul?q=' + encodeURIComponent('Av. Dr. Ismerino Soares de Carvalho 292, St. Aeroporto, Goiânia, GO') + '&navigate=yes',
}

function WazeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.037 2.5c-4.31 0-7.805 3.494-7.805 7.803 0 .684.088 1.348.254 1.98a5.284 5.284 0 0 0-1.9 4.072 5.286 5.286 0 0 0 5.285 5.285c.8 0 1.558-.178 2.237-.497a7.78 7.78 0 0 0 1.93.243c4.31 0 7.804-3.494 7.804-7.803 0-.53-.053-1.049-.154-1.55a5.28 5.28 0 0 0 1.117-3.251 5.286 5.286 0 0 0-5.285-5.285c-.87 0-1.69.21-2.414.583a7.85 7.85 0 0 0-1.07-.08Zm0 1.812c.262 0 .52.013.775.038a5.286 5.286 0 0 0-1.028 3.132 5.286 5.286 0 0 0 5.285 5.285c.63 0 1.235-.11 1.796-.312.026.278.04.56.04.848 0 3.31-2.684 5.992-5.993 5.992a5.99 5.99 0 0 1-1.832-.285 3.472 3.472 0 0 1-1.545-2.892h1.81a1.406 1.406 0 1 0 0-2.812H7.883a1.406 1.406 0 0 0-.13.006c-1.94.13-3.472 1.744-3.472 3.716 0 .06.001.12.004.18a3.45 3.45 0 0 1-.942-2.371 3.47 3.47 0 0 1 1.42-2.8l.905-.66-.38-1.053a5.977 5.977 0 0 1-.331-1.965c0-3.31 2.683-5.992 5.992-5.992Zm-4.216 12.36h.001l-.002.01a5.99 5.99 0 0 1-.266.006l.267-.015Zm8.72-7.723a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14Zm3.578 0a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14Z" />
    </svg>
  )
}

function MapsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.19 6.27 11.72 6.54 12a1.3 1.3 0 0 0 1.92 0c.27-.28 6.54-6.81 6.54-12A7.5 7.5 0 0 0 12 2Zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" />
    </svg>
  )
}

export function SiteFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  return (
    <footer className="relative mt-auto border-t border-white/5 bg-coal">
      <div className="gold-line opacity-50" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-md brushed-metal border border-gold/40">
                <span className="font-display text-xl font-bold text-gold-gradient">A</span>
              </span>
              <span className="leading-none">
                <span className="block font-display font-bold tracking-[0.18em] text-white">ALADDIN</span>
                <span className="block text-[9px] uppercase tracking-[0.4em] text-gold/90">distribuidora</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Distribuidora premium de tabacaria, headshop e lifestyle. Marcas globais, curadoria de verdade e preço de atacado para o seu negócio crescer.
            </p>
            <div className="mt-5 flex gap-3">
              <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram da Aladdin Distribuidora" className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-neutral-400 hover:text-gold hover:border-gold/50 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp da Aladdin Distribuidora" className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-neutral-400 hover:text-gold hover:border-gold/50 transition-colors">
                <Phone className="h-4 w-4" />
              </a>
              <a href={`mailto:${SITE.email}`} aria-label="E-mail da Aladdin Distribuidora" className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-neutral-400 hover:text-gold hover:border-gold/50 transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <nav aria-label="Categorias do catálogo">
            <h3 className="kicker mb-4">Catálogo</h3>
            <ul className="space-y-2.5">
              {CATEGORY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-400 hover:text-gold transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Marcas em destaque">
            <h3 className="kicker mb-4">Marcas</h3>
            <ul className="space-y-2.5">
              {TOP_BRANDS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-400 hover:text-gold transition-colors">{l.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/marcas" className="text-sm text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">Ver todas as marcas →</Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="kicker mb-4">Contato</h3>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex gap-2.5"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold/70" /><span>{SITE.address.street}, {SITE.address.city} — {SITE.address.state}, {SITE.address.zip}</span></li>
              <li className="flex gap-2.5"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-gold/70" /><a href={`tel:${SITE.phone}`} className="hover:text-gold transition-colors">{SITE.phone.replace('-55-', '(62) ')}</a></li>
              <li className="flex gap-2.5"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-gold/70" /><a href={`mailto:${SITE.email}`} className="hover:text-gold transition-colors">{SITE.email}</a></li>
              <li className="flex gap-2.5"><Clock className="h-4 w-4 mt-0.5 shrink-0 text-gold/70" /><span>{SITE.hours}</span></li>
            </ul>
            <p className="mt-4 mb-2.5 text-[10px] uppercase tracking-[0.3em] text-neutral-500">Trace a rota até nós</p>
            <div className="flex gap-2.5">
              <a
                href={ROUTES.maps}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Traçar rota no Google Maps"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-neutral-200 transition-all hover:border-gold/50 hover:text-gold"
              >
                <MapsIcon className="h-4 w-4" /> Google Maps
              </a>
              <a
                href={ROUTES.waze}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Traçar rota no Waze"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-neutral-200 transition-all hover:border-gold/50 hover:text-gold"
              >
                <WazeIcon className="h-4 w-4" /> Waze
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} {SITE.legalName}. Todos os direitos reservados.
          </p>
          <p className="text-[11px] text-neutral-600 text-center sm:text-right">
            Venda proibida para menores de 18 anos. • Catálogo B2B exclusivo para lojistas.
          </p>
        </div>
      </div>
    </footer>
  )
}
