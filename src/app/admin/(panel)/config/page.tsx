'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Settings {
  brandName: string; heroTitle: string; heroSubtitle: string; address: string; phone: string
  whatsapp: string; email: string; instagram: string; repName: string; repEmail: string
  repPhone: string; cnpj: string; businessHours: string; gaId: string | null; gtmId: string | null
}

export default function AdminConfigPage() {
  const [s, setS] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/admin/settings').then((r) => r.json()).then((j) => setS(j.settings)).catch(() => setS(null))
  }, [])

  const save = async () => {
    if (!s) return
    setSaving(true)
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
    setSaving(false)
    if (!res.ok) return toast({ title: 'Erro ao salvar', variant: 'destructive' })
    toast({ title: 'Configurações salvas ✦' })
  }

  if (!s) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>

  const F = 'border-white/10 bg-white/5'
  const upd = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value })

  return (
    <div className="max-w-3xl">
      <div>
        <p className="kicker">Sistema</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-white">Configurações</h1>
      </div>

      <section className="mt-8 rounded-xl border border-white/8 bg-card p-6">
        <h2 className="kicker mb-4">Identidade & Home</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Nome da distribuidora</label>
            <Input value={s.brandName} onChange={upd('brandName')} className={F} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Título do hero</label>
            <Input value={s.heroTitle} onChange={upd('heroTitle')} className={F} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Subtítulo do hero</label>
            <Textarea value={s.heroSubtitle} onChange={upd('heroSubtitle')} rows={2} className={F} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-white/8 bg-card p-6">
        <h2 className="kicker mb-4">Contato & SEO Local</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Telefone</label><Input value={s.phone} onChange={upd('phone')} className={F} /></div>
          <div><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">WhatsApp (só números)</label><Input value={s.whatsapp} onChange={upd('whatsapp')} className={F} /></div>
          <div><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">E-mail</label><Input value={s.email} onChange={upd('email')} className={F} /></div>
          <div><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Instagram</label><Input value={s.instagram} onChange={upd('instagram')} className={F} /></div>
          <div className="sm:col-span-2"><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Endereço</label><Input value={s.address} onChange={upd('address')} className={F} /></div>
          <div><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">CNPJ</label><Input value={s.cnpj} onChange={upd('cnpj')} className={F} /></div>
          <div><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Horário</label><Input value={s.businessHours} onChange={upd('businessHours')} className={F} /></div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-white/8 bg-card p-6">
        <h2 className="kicker mb-4">Representante (PDF do pedido)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Nome</label><Input value={s.repName} onChange={upd('repName')} className={F} /></div>
          <div><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Telefone</label><Input value={s.repPhone} onChange={upd('repPhone')} className={F} /></div>
          <div className="sm:col-span-2"><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">E-mail</label><Input value={s.repEmail} onChange={upd('repEmail')} className={F} /></div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-white/8 bg-card p-6">
        <h2 className="kicker mb-4">Analytics (GA4 / GTM)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">Google Analytics ID</label><Input value={s.gaId || ''} onChange={upd('gaId')} placeholder="G-XXXXXXXXXX" className={F} /></div>
          <div><label className="mb-1.5 block text-xs uppercase tracking-widest text-neutral-400">GTM ID</label><Input value={s.gtmId || ''} onChange={upd('gtmId')} placeholder="GTM-XXXXXXX" className={F} /></div>
        </div>
        <p className="mt-2 text-xs text-neutral-600">Também é possível definir via variáveis de ambiente NEXT_PUBLIC_GA_ID e NEXT_PUBLIC_GTM_ID (recomendado na Vercel).</p>
      </section>

      <button onClick={save} disabled={saving} className="mt-6 flex h-12 items-center justify-center gap-2 rounded-md bg-gold px-8 text-sm font-bold uppercase tracking-widest text-black hover:bg-gold-light glow-gold disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'Salvando…' : 'Salvar configurações'}
      </button>
    </div>
  )
}
