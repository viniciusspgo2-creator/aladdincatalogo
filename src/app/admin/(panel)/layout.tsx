import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Painel Admin | Aladdin Distribuidora',
  robots: { index: false, follow: false },
}

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="flex min-h-dvh bg-ink">
      <AdminSidebar user={user} />
      <div className="flex-1 lg:pl-64">
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
