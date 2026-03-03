'use client'

import { useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { crearCategoria } from './actions'

function BotonAgregarCategoria() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="shrink-0 bg-amber-500 font-medium text-white hover:bg-amber-600" disabled={pending}>
      {pending ? 'Agregando...' : 'Agregar'}
    </Button>
  )
}

export function FormCrearCategoriaInline() {
  const [state, formAction] = useFormState(crearCategoria, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4"
    >
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="nombre-inline" className="mb-1 block text-xs font-medium text-gray-600">
          Nombre
        </label>
        <Input
          id="nombre-inline"
          name="nombre"
          placeholder="Nombre de la categoría"
          required
          className="bg-white"
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="descripcion-inline" className="mb-1 block text-xs font-medium text-gray-600">
          Descripción
        </label>
        <Input
          id="descripcion-inline"
          name="descripcion"
          placeholder="Opcional"
          className="bg-white"
        />
      </div>
      <BotonAgregarCategoria />
      {state?.error && (
        <p className="w-full text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  )
}
