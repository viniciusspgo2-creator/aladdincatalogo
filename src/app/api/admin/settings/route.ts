import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireApiUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const settings = await db.siteSettings.findFirst({ where: { id: 'singleton' } })
  return NextResponse.json({ settings })
}

export async function PUT(req: NextRequest) {
  if (!(await requireApiUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const data = {
      brandName: body.brandName, heroTitle: body.heroTitle, heroSubtitle: body.heroSubtitle,
      address: body.address, phone: body.phone, whatsapp: body.whatsapp, email: body.email,
      instagram: body.instagram, repName: body.repName, repEmail: body.repEmail, repPhone: body.repPhone,
      cnpj: body.cnpj, businessHours: body.businessHours, gaId: body.gaId || null, gtmId: body.gtmId || null,
    }
    await db.siteSettings.upsert({ where: { id: 'singleton' }, update: data, create: { id: 'singleton', ...data } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('settings update', e)
    return NextResponse.json({ error: 'Falha ao salvar configurações' }, { status: 500 })
  }
}
