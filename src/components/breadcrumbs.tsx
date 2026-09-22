'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="mb-2">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {item.href ? (
              <Link href={item.href} className="hover:text-gold transition-colors">{item.name}</Link>
            ) : (
              <span aria-current="page" className="text-neutral-300">{item.name}</span>
            )}
            {i < items.length - 1 && <ChevronRight className="h-3 w-3 text-neutral-700" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  )
}
