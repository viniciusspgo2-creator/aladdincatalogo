import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

const SESSION_COOKIE = 'aladdin_admin'
const SECRET = process.env.ADMIN_SESSION_SECRET || 'aladdin-premium-dev-secret-change-in-prod'
const TTL_MS = 1000 * 60 * 60 * 12 // 12h

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url')
}

export function createToken(userId: string): string {
  const exp = Date.now() + TTL_MS
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifyToken(token: string): string | null {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  if (sign(payload) !== sig) return null
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (Date.now() > exp) return null
    return uid
  } catch {
    return null
  }
}

export async function setSession(userId: string) {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, createToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_MS / 1000,
  })
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function getSessionUser() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  const uid = verifyToken(token)
  if (!uid) return null
  try {
    return await db.user.findUnique({ where: { id: uid }, select: { id: true, username: true, name: true, role: true } })
  } catch {
    return null
  }
}

export async function requireApiUser(): Promise<{ id: string } | null> {
  const user = await getSessionUser()
  return user ? { id: user.id } : null
}
