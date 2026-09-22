import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, setSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Usuário e senha obrigatórios' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { username: String(username).toLowerCase().trim() } })
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }
    await setSession(user.id)
    return NextResponse.json({ ok: true, name: user.name })
  } catch (e) {
    console.error('login api', e)
    return NextResponse.json({ error: 'Falha no login' }, { status: 500 })
  }
}
