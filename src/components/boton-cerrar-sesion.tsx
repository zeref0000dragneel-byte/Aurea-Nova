'use client'

import { useFormStatus } from 'react-dom'
import { LogOut } from 'lucide-react'

type Props = {
  className?: string
}

export function BotonCerrarSesion({ className }: Props) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={className ?? 'flex w-full items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50'}
    >
      <LogOut className="h-5 w-5 shrink-0" />
      {pending ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  )
}
