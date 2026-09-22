'use client'

import { usePathname } from 'next/navigation'
import { Toaster } from '@/components/ui/toaster'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AgeGate } from '@/components/age-gate'
import { ChatWidget } from '@/components/chat-widget'

/** Chrome do site — esconde age gate e chat no painel admin. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  return (
    <>
      <div className="site-shell">
        <SiteHeader />
        <main className="site-main">{children}</main>
        <SiteFooter />
      </div>
      {!isAdmin && (
        <>
          <AgeGate />
          <ChatWidget />
        </>
      )}
      <Toaster />
    </>
  )
}
