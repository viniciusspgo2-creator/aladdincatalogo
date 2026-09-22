'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, LogIn, ArrowLeft } from 'lucide-react'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha no login')
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink px-4 noise">
      <div className="smoke-blob absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.14),transparent_65%)]" aria-hidden />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-gold">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao catálogo
        </Link>
        <div className="glass rounded-2xl p-8">
          <div className="mb-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl brushed-metal border border-gold/40">
              <span className="font-display text-2xl font-bold text-gold-gradient">A</span>
            </span>
            <h1 className="mt-4 font-display text-xl font-bold tracking-[0.2em] text-white">ALADDIN ADMIN</h1>
            <p className="mt-1 text-xs text-neutral-500">Área restrita · representante & gestão</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Usuário</label>
              <input
                id="username" type="text" required autoComplete="username" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 w-full rounded-md border border-white/12 bg-white/5 px-4 text-white outline-none transition-colors focus:border-gold"
                placeholder="admin"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Senha</label>
              <input
                id="password" type="password" required autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-md border border-white/12 bg-white/5 px-4 text-white outline-none transition-colors focus:border-gold"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-gold text-sm font-bold uppercase tracking-widest text-black transition-all hover:bg-gold-light glow-gold disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
