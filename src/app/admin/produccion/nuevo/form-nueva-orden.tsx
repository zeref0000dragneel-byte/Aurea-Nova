'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { crearOrdenProduccion } from '../actions'
import { cn } from '@/lib/utils'

type Producto = { id: string; name: string }
type Empleado = { id: string; full_name: string }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-amber-500 font-medium text-white hover:bg-amber-600 disabled:opacity-60"
    >
      {pending ? 'Guardando…' : 'Crear orden'}
    </Button>
  )
}

export function FormNuevaOrden({
  productos,
  empleados,
}: {
  productos: Producto[]
  empleados: Empleado[]
}) {
  const [state, formAction] = useFormState(crearOrdenProduccion, null)
  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null

  return (
    <form action={formAction} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="product_id">Producto *</Label>
          <select
            id="product_id"
            name="product_id"
            required
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
            )}
          >
            <option value="">Selecciona un producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="planned_quantity">Cantidad Planificada *</Label>
          <Input
            id="planned_quantity"
            name="planned_quantity"
            type="number"
            min="0"
            step="1"
            required
            placeholder="0"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Asignar a</Label>
          <select
            id="assigned_to"
            name="assigned_to"
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
            )}
          >
            <option value="">Ninguno</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Notas opcionales"
            rows={3}
            className="resize-none border-gray-200"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/produccion">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
