'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Minus, Plus, Trash2, FileText, Loader2, MessageCircle, CheckCircle2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useBag } from '@/lib/bag-store'
import { brl } from '@/lib/format'
import { trackEvent } from '@/components/analytics'

interface Settings { brandName: string; repName: string; repEmail: string; repPhone: string; whatsapp: string }

export function BagClient({ settings }: { settings: Settings }) {
  const { items, setQty, remove, clear } = useBag()
  const [customer, setCustomer] = useState({ name: '', shopName: '', phone: '', email: '', city: '', state: '' })
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderCode, setOrderCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  const submit = async () => {
    setError(null)
    if (items.length === 0) return setError('Adicione produtos antes de gerar o pedido.')
    if (!customer.name || customer.name.length < 2) return setError('Informe seu nome completo.')
    if (!customer.phone || customer.phone.length < 8) return setError('Informe um telefone/WhatsApp válido.')
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, notes, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao gerar pedido')
      trackEvent('generate_order', { value: total, items: items.length, order_code: json.code })
      await generatePdf(json.code)
      setOrderCode(json.code)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar pedido')
    } finally {
      setLoading(false)
    }
  }

  const generatePdf = async (code: string) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210
    const M = 18

    // header band
    doc.setFillColor(5, 5, 5)
    doc.rect(0, 0, W, 38, 'F')
    doc.setFillColor(201, 162, 39)
    doc.rect(0, 38, W, 1.2, 'F')
    // logo monogram
    doc.setDrawColor(201, 162, 39)
    doc.setLineWidth(0.6)
    doc.roundedRect(M, 9, 20, 20, 2, 2, 'S')
    doc.setTextColor(201, 162, 39)
    doc.setFont('helvetica', 'bold').setFontSize(14)
    doc.text('A', M + 7.2, 23)
    doc.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(13)
    doc.text(settings.brandName.toUpperCase(), M + 26, 17)
    doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(180, 180, 180)
    doc.text('CATÁLOGO DIGITAL B2B — TABACARIA & HEADSHOP', M + 26, 23)
    doc.setTextColor(201, 162, 39).setFont('helvetica', 'bold').setFontSize(9)
    doc.text(`PEDIDO ${code}`, W - M, 16, { align: 'right' })
    doc.setFont('helvetica', 'normal').setTextColor(140, 140, 140).setFontSize(8)
    doc.text(new Date().toLocaleString('pt-BR'), W - M, 23, { align: 'right' })

    // customer data
    let y = 52
    doc.setTextColor(20, 20, 20).setFont('helvetica', 'bold').setFontSize(10.5)
    doc.text('DADOS DO CLIENTE', M, y)
    doc.setDrawColor(201, 162, 39).setLineWidth(0.3).line(M, y + 2, W - M, y + 2)
    y += 9
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(60, 60, 60)
    const rows: [string, string][] = [
      ['Nome', customer.name],
      ['Loja', customer.shopName || '—'],
      ['Telefone', customer.phone],
      ['E-mail', customer.email || '—'],
      ['Cidade / UF', [customer.city, customer.state].filter(Boolean).join(' — ') || '—'],
    ]
    rows.forEach(([k, v], i) => {
      const x = i % 2 === 0 ? M : M + 90
      const yy = y + Math.floor(i / 2) * 7
      doc.setFont('helvetica', 'bold').setTextColor(20, 20, 20).text(`${k}:`, x, yy)
      doc.setFont('helvetica', 'normal').setTextColor(80, 80, 80).text(v, x + 22, yy)
    })
    y += Math.ceil(rows.length / 2) * 7 + 8

    // items table
    doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(20, 20, 20)
    doc.text('ITENS DO PEDIDO', M, y)
    doc.line(M, y + 2, W - M, y + 2)
    y += 9

    const colX = [M, M + 12, M + 30, 138, 158, 178, W - M]
    doc.setFillColor(247, 245, 240)
    doc.rect(M, y - 5, W - M * 2, 8, 'F')
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(90, 90, 90)
    doc.text('ITEM', colX[0] + 1, y)
    doc.text('CÓD.', colX[1], y)
    doc.text('PRODUTO', colX[2], y)
    doc.text('QTD', colX[3], y)
    doc.text('UNIT.', colX[4], y)
    doc.text('SUBTOTAL', colX[5], y)
    y += 8

    doc.setFont('helvetica', 'normal')
    items.forEach((i, idx) => {
      if (y > 250) { doc.addPage(); y = 22 }
      if (idx % 2 === 1) { doc.setFillColor(252, 251, 249); doc.rect(M, y - 4.5, W - M * 2, 7, 'F') }
      doc.setFontSize(8).setTextColor(40, 40, 40)
      doc.text(String(idx + 1).padStart(2, '0'), colX[0] + 1, y)
      doc.text((i.code || '—').toString().slice(0, 8), colX[1], y)
      doc.text(i.name.slice(0, 52), colX[2], y)
      doc.text(String(i.quantity), colX[3], y)
      doc.text(brl(i.price), colX[4], y)
      doc.setFont('helvetica', 'bold')
      doc.text(brl(i.price * i.quantity), colX[5], y)
      doc.setFont('helvetica', 'normal')
      y += 7
    })

    // total
    if (y > 245) { doc.addPage(); y = 22 }
    y += 4
    doc.setDrawColor(201, 162, 39).setLineWidth(0.4).line(120, y, W - M, y)
    y += 8
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(20, 20, 20)
    doc.text('TOTAL ESTIMADO:', 120, y)
    doc.setTextColor(201, 162, 39).setFontSize(13)
    doc.text(brl(total), W - M, y, { align: 'right' })

    // notes
    if (notes.trim()) {
      y += 12
      doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(20, 20, 20)
      doc.text('OBSERVAÇÕES', M, y)
      doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(80, 80, 80)
      const lines = doc.splitTextToSize(notes.trim(), W - M * 2)
      doc.text(lines, M, y + 5)
      y += 5 + lines.length * 4
    }

    // footer / rep contact
    const fy = 285
    doc.setFillColor(5, 5, 5).rect(0, fy - 2, W, 292 - fy + 12, 'F')
    doc.setFillColor(201, 162, 39).rect(0, fy - 2, W, 0.8, 'F')
    doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(201, 162, 39)
    doc.text('CONTATO DO REPRESENTANTE', M, fy + 4)
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(200, 200, 200)
    doc.text(`${settings.repName}  •  ${settings.repPhone}  •  ${settings.repEmail}`, M, fy + 9)
    doc.text('Envie este PDF pelo WhatsApp para confirmar disponibilidade, frete e prazo de entrega.', M, fy + 14)

    doc.save(`pedido-aladdin-${code}.pdf`)
  }

  const waLink = orderCode
    ? `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Segue meu pedido ${orderCode} gerado pelo catálogo Aladdin. Vou enviar o PDF em seguida.`)}`
    : `https://wa.me/${settings.whatsapp}`

  if (items.length === 0 && !orderCode) {
    return (
      <div className="mt-12 grid place-items-center rounded-2xl border border-dashed border-white/12 py-24 text-center">
        <ShoppingBag className="mb-4 h-14 w-14 text-neutral-800" />
        <h2 className="font-display text-xl font-bold text-neutral-300">Sua sacola está vazia</h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">Explore o catálogo premium e adicione os produtos da sua próxima reposição.</p>
        <Button asChild className="mt-6 bg-gold font-bold uppercase tracking-widest text-black hover:bg-gold-light">
          <Link href="/catalogo">Explorar catálogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.productId} className="flex gap-4 rounded-lg border border-white/8 bg-card p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-white/5">
                {i.image && <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold/90">{i.brand}</p>
                <Link href={`/produto/${i.slug}`} className="line-clamp-2 text-sm font-medium text-neutral-100 hover:text-gold">{i.name}</Link>
                <p className="mt-1 text-xs text-neutral-500">{brl(i.price)} / un</p>
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex h-8 items-center rounded border border-white/12 bg-white/[0.04]">
                    <button onClick={() => setQty(i.productId, Math.max(1, i.quantity - 1))} aria-label={`Diminuir ${i.name}`} className="grid h-full w-8 place-items-center text-neutral-400 hover:text-gold"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center font-display text-sm font-bold text-white">{i.quantity}</span>
                    <button onClick={() => setQty(i.productId, i.quantity + 1)} aria-label={`Aumentar ${i.name}`} className="grid h-full w-8 place-items-center text-neutral-400 hover:text-gold"><Plus className="h-3 w-3" /></button>
                  </div>
                  <span className="font-display text-sm font-bold text-gold">{brl(i.price * i.quantity)}</span>
                  <button onClick={() => remove(i.productId)} aria-label={`Remover ${i.name}`} className="ml-auto text-neutral-600 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {items.length > 0 && (
          <button onClick={clear} className="mt-4 text-xs uppercase tracking-widest text-neutral-600 hover:text-red-400 transition-colors">
            Limpar sacola
          </button>
        )}

        {orderCode && (
          <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="flex items-center gap-2 font-display font-bold text-emerald-400"><CheckCircle2 className="h-5 w-5" /> Pedido {orderCode} registrado!</p>
            <p className="mt-1.5 text-sm text-neutral-300">O PDF já foi baixado automaticamente. Finalize enviando o arquivo ao representante:</p>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-emerald-400">
              <MessageCircle className="h-4 w-4" /> Enviar ao representante
            </a>
            <button onClick={() => generatePdf(orderCode)} className="ml-3 inline-flex items-center gap-1.5 text-xs text-gold underline underline-offset-4">
              <FileText className="h-3.5 w-3.5" /> Baixar PDF novamente
            </button>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-xl border border-white/8 bg-card p-6 lg:sticky lg:top-24" aria-label="Dados e resumo do pedido">
        <h2 className="kicker">Dados do cliente</h2>
        <div className="mt-4 space-y-3">
          <Input placeholder="Seu nome *" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="border-white/10 bg-white/5" />
          <Input placeholder="Nome da loja" value={customer.shopName} onChange={(e) => setCustomer({ ...customer, shopName: e.target.value })} className="border-white/10 bg-white/5" />
          <Input placeholder="WhatsApp / Telefone *" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="border-white/10 bg-white/5" />
          <Input placeholder="E-mail" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="border-white/10 bg-white/5" />
          <div className="flex gap-2">
            <Input placeholder="Cidade" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="UF" maxLength={2} value={customer.state} onChange={(e) => setCustomer({ ...customer, state: e.target.value.toUpperCase() })} className="w-20 border-white/10 bg-white/5" />
          </div>
          <Textarea placeholder="Observações (opcional): display, cores, prazos…" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="border-white/10 bg-white/5" />
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex justify-between text-sm text-neutral-400"><span>{items.length} itens</span><span>{items.reduce((a, i) => a + i.quantity, 0)} un</span></div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm text-neutral-300">Total estimado</span>
            <span className="font-display text-2xl font-bold text-gold">{brl(total)}</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-600">Valores de atacado. Frete e prazos confirmados pelo representante.</p>
        </div>

        {error && <p className="mt-3 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

        <Button onClick={submit} disabled={loading} className="mt-5 h-13 w-full bg-gold py-4 text-sm font-bold uppercase tracking-widest text-black hover:bg-gold-light glow-gold">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
          {loading ? 'Gerando…' : 'GERAR PEDIDO PDF'}
        </Button>
      </aside>
    </div>
  )
}
