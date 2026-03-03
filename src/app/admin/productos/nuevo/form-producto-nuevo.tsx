'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { crearProducto } from '../actions'
import { cn } from '@/lib/utils'

type Category = { id: string; name: string }

const UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'pza', label: 'pza' },
  { value: 'caja', label: 'caja' },
  { value: 'cubeta', label: 'cubeta' },
] as const

function BotonGuardarProducto() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="bg-amber-500 font-medium text-white hover:bg-amber-600"
      disabled={pending}
    >
      {pending ? 'Guardando...' : 'Guardar producto'}
    </Button>
  )
}

export function FormProductoNuevo({
  categories,
  action,
}: {
  categories: Category[]
  action: typeof crearProducto
}) {
  const [state, formAction] = useFormState(action, null)
  const error = state && typeof state === 'object' && 'error' in state ? (state as { error: string }).error : null

  return (
    <form action={formAction} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            name="sku"
            placeholder="Se genera automáticamente si se deja vacío"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            name="nombre"
            required
            placeholder="Nombre del producto"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Descripción opcional"
            rows={3}
            className="border-gray-200 resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category_id">Categoría *</Label>
          <select
            id="category_id"
            name="category_id"
            required
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            )}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidad</Label>
          <select
            id="unit"
            name="unit"
            defaultValue="pza"
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
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
          <Label htmlFor="precio_base">Precio base *</Label>
          <Input
            id="precio_base"
            name="precio_base"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precio_costo">Precio de costo *</Label>
          <Input
            id="precio_costo"
            name="precio_costo"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_stock">Stock mínimo</Label>
          <Input
            id="min_stock"
            name="min_stock"
            type="number"
            min="0"
            defaultValue="0"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="is_active">Estado</Label>
          <select
            id="is_active"
            name="is_active"
            defaultValue="activo"
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            )}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>
      <BotonGuardarProducto />
    </form>
  )
}
