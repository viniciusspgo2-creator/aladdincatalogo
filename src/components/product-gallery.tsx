'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const list = images.length > 0 ? images : []

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-white/8 bg-card">
        {list[active] ? (
          <Image src={list[active]} alt={name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-neutral-700">Sem imagem</div>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(201,162,39,0.08),transparent_55%)] pointer-events-none" />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagem ${i + 1} de ${name}`}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                i === active ? 'border-gold shadow-[0_0_16px_-4px_rgba(201,162,39,0.6)]' : 'border-white/10 opacity-60 hover:opacity-100',
              )}
            >
              <Image src={img} alt={`${name} — imagem ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
