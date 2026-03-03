'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { crearMateriaPrima } from '../actions'
import { cn } from '@/lib/utils'

const UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'pza', label: 'pza' },
  { value: 'caja', label: 'caja' },
  { value: 'cubeta', label: 'cubeta' },
] as const

function BotonGuardarMateriaPrimaNuevo() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="bg-amber-500 font-medium text-white hover:bg-amber-600"
      disabled={pending}
    >
      {pending ? 'Guardando...' : 'Guardar materia prima'}
    </Button>
  )
}

export function FormMateriaPrimaNuevo() {
  const [state, formAction] = useFormState(crearMateriaPrima, null)
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
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Nombre de la materia prima"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidad</Label>
          <select
            id="unit"
            name="unit"
            defaultValue="pza"
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
            )}
          >
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_stock">Stock Actual</Label>
          <Input
            id="current_stock"
            name="current_stock"
            type="number"
            min={0}
            defaultValue="0"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_stock">Stock Mínimo</Label>
          <Input
            id="min_stock"
            name="min_stock"
            type="number"
            min={0}
            defaultValue="0"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit_cost">Costo Unitario</Label>
          <Input
            id="unit_cost"
            name="unit_cost"
            type="number"
            step="0.01"
            min={0}
            defaultValue="0"
            placeholder="0.00"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier">Proveedor</Label>
          <Input
            id="supplier"
            name="supplier"
            placeholder="Nombre del proveedor"
            className="border-gray-200"
          />
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
        <div className="space-y-2">
          <Label htmlFor="is_active">Estado</Label>
          <select
            id="is_active"
            name="is_active"
            defaultValue="activo"
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
            )}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>
      <BotonGuardarMateriaPrimaNuevo />
    </form>
  )
}
