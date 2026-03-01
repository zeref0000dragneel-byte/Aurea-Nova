'use client'

import { useFormState } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { actualizarCategoria } from '@/app/admin/configuracion/actions'

type Category = {
  id: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
}

export function FormCategoriaEditar({ category }: { category: Category }) {
  const [state, formAction] = useFormState(actualizarCategoria, null)
  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={category.id} />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          name="nombre"
          required
          defaultValue={category.name}
          placeholder="Nombre de la categoría"
          className="border-gray-200"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="descripcion"
          name="descripcion"
          defaultValue={category.description ?? ''}
          placeholder="Opcional"
          className="border-gray-200"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sort_order">Orden</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          min={0}
          defaultValue={category.sort_order}
          className="border-gray-200"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <select
          id="estado"
          name="estado"
          defaultValue={category.is_active ? 'activo' : 'inactivo'}
          className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
      <Button type="submit" className="bg-amber-500 font-medium text-white hover:bg-amber-600">
        Guardar cambios
      </Button>
    </form>
  )
}
