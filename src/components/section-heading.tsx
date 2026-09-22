import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function SectionHeading({ kicker, title, link }: {
  kicker: string; title: string; link?: { href: string; label: string }
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="kicker">{kicker}</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h2>
      </div>
      {link && (
        <Link href={link.href} className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold hover:text-gold-light">
          {link.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}
