import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminPageTransition } from '@/components/admin/admin-page-transition'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <div className="w-full bg-amber-400 text-amber-950 text-xs font-semibold text-center py-1.5 tracking-wide fixed top-0 left-0 z-50">
        ⚡ MODO DEMO — Los datos pueden resetearse en cualquier momento
      </div>
      <div className="pt-7 flex w-full min-h-screen">
        <AdminSidebar />
        <main className="min-h-screen flex-1 overflow-auto pl-64">
          <AdminPageTransition>{children}</AdminPageTransition>
        </main>
      </div>
    </div>
  )
}
