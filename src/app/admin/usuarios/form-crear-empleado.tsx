'use client'

import { useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { UserPlus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { crearEmpleado, type CrearEmpleadoState } from './actions'

function BotonCrearEmpleado() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="bg-amber-500 font-medium text-white hover:bg-amber-600" disabled={pending}>
      <UserPlus className="mr-2 h-4 w-4" />
      {pending ? 'Creando...' : 'Crear Empleado'}
    </Button>
  )
}

export function FormCrearEmpleado({ visible }: { visible: boolean }) {
  const [state, formAction] = useFormState(crearEmpleado, null as CrearEmpleadoState | null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state])

  if (!visible) return null

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-6"
    >
      {state?.success && (
        <p className="text-sm font-medium text-emerald-700" role="alert">
          {state.mensaje}
        </p>
      )}
      {state?.error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="empleado-full_name">Nombre completo *</Label>
          <Input
            id="empleado-full_name"
            name="full_name"
            required
            placeholder="Nombre completo"
            className="border-gray-200 bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="empleado-email">Correo electrónico *</Label>
          <Input
            id="empleado-email"
            name="email"
            type="email"
            required
            placeholder="correo@ejemplo.com"
            className="border-gray-200 bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="empleado-password">Contraseña * (mínimo 8 caracteres)</Label>
          <Input
            id="empleado-password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="border-gray-200 bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="empleado-phone">Teléfono (opcional)</Label>
          <Input
            id="empleado-phone"
            name="phone"
            placeholder="Teléfono"
            className="border-gray-200 bg-white"
          />
        </div>
      </div>
      <BotonCrearEmpleado />
    </form>
  )
}
