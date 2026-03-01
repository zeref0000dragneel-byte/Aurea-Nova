import Link from 'next/link'
import {
  Hexagon,
  LayoutDashboard,
  TrendingUp,
  Package,
  Warehouse,
  Factory,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
} from 'lucide-react'
import { logoutAction } from '@/app/(auth)/login/actions'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/finanzas', icon: TrendingUp, label: 'Finanzas' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
  { href: '/admin/inventario', icon: Warehouse, label: 'Inventario' },
  { href: '/admin/produccion', icon: Factory, label: 'Producción' },
  { href: '/admin/clientes', icon: Users, label: 'Clientes' },
  { href: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
  { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
] as const

export default function AdminLayout({
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
            <Hexagon className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Colmena OS</span>
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
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Cerrar sesión
            </button>
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
