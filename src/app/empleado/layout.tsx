import { logoutAction } from '@/app/(auth)/login/actions'
import { BotonCerrarSesion } from '@/components/boton-cerrar-sesion'

export default function EmpleadoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex-1">{children}</div>
      <div className="border-t border-gray-200 bg-white p-3">
        <form action={logoutAction}>
          <BotonCerrarSesion />
        </form>
      </div>
    </div>
  )
}
