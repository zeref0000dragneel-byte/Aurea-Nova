import Link from 'next/link'
import Image from 'next/image'
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
    <div className="flex min-h-screen bg-transparent">
      <div className="w-full bg-amber-400 text-amber-950 text-xs font-semibold text-center py-1.5 tracking-wide fixed top-0 left-0 z-50">
        ⚡ MODO DEMO — Los datos pueden resetearse en cualquier momento
      </div>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-10 flex h-screen w-64 flex-col border-r border-[#FFE082]/20 bg-[#FEF9F2]/95 shadow-lg backdrop-blur-sm">
        <header className="flex items-center gap-3 px-4 py-5">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-white shadow-md">
            <Image
              src="/logo.png"
              alt="Colmena OS"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <span className="font-display text-lg font-bold tracking-wide text-neutral-700">Portal Cliente</span>
        </header>
        <hr className="border-accent-miel/30" />
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-accent-miel/30 p-3">
          <form action={logoutAction}>
            <BotonCerrarSesion className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-danger transition-all hover:bg-danger/10" />
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
