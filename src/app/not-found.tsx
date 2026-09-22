import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="relative mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-4 pt-24 text-center">
      <div>
        <p className="font-display text-[120px] font-bold leading-none text-gold-gradient">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">Esta página virou fumaça</h1>
        <p className="mt-3 text-neutral-400">
          O link que você acessou não existe ou o produto saiu do catálogo. Volte ao início ou explore o catálogo completo.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild className="bg-gold font-bold uppercase tracking-widest text-black hover:bg-gold-light">
            <Link href="/">Voltar ao início</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/20 text-white hover:border-gold hover:text-gold">
            <Link href="/catalogo">Ver catálogo</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
