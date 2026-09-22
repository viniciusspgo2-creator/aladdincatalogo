import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Resolve DATABASE_URL robustly:
// - On Vercel/Neon, process.env.DATABASE_URL is a valid postgresql:// URL → use it.
// - In sandboxed local shells a stale DATABASE_URL (e.g. file:...) may be injected;
//   in that case, fall back to the value defined in the project's .env file.
function resolveDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && /^(postgres|postgresql):\/\//.test(envUrl)) return envUrl
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    const match = raw.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m)
    if (match && /^(postgres|postgresql):\/\//.test(match[1])) {
      process.env.DATABASE_URL = match[1]
      return match[1]
    }
  } catch { /* .env missing — keep default behavior */ }
  return envUrl
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasourceUrl: resolveDatabaseUrl(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
