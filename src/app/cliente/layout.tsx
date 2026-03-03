import Link from 'next/link'
import { LayoutDashboard, ShoppingCart, Tag } from 'lucide-react'
import { logoutAction } from '@/app/(auth)/login/actions'
import { BotonCerrarSesion } from '@/components/boton-cerrar-sesion'

const navItems = [
  { href: '/cliente/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/cliente/pedidos', icon: ShoppingCart, label: 'Mis pedidos' },
  { href: '/cliente/precios', icon: Tag, label: 'Mis precios' },
] as const

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-10 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
        <header className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
            <LayoutDashboard className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Portal Cliente</span>
        </header>
        <hr className="border-gray-200" />
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <form action={logoutAction}>
            <BotonCerrarSesion className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50" />
          </form>
        </div>
      </aside>
      {/* Main content */}
      <main className="min-h-screen flex-1 overflow-auto pl-64">
        {children}
      </main>
    </div>
  )
}
