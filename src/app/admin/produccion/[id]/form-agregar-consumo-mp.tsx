'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { agregarConsumoMP } from '@/app/admin/produccion/actions'
import { cn } from '@/lib/utils'

type MateriaPrima = { id: string; name: string; unit: string }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      size="sm"
      className="bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
    >
      {pending ? 'Agregando…' : 'Agregar'}
    </Button>
  )
}

export function FormAgregarConsumoMP({
  produccionOrdenId,
  materialesPrimas,
}: {
  produccionOrdenId: string
  materialesPrimas: MateriaPrima[]
}) {
  const [state, formAction] = useFormState(agregarConsumoMP, null)
  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <input type="hidden" name="production_order_id" value={produccionOrdenId} />
      {error && (
        <div className="w-full rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="raw_material_id" className="text-xs">
          Materia prima
        </Label>
        <select
          id="raw_material_id"
          name="raw_material_id"
          required
          className={cn(
            'flex h-9 w-full min-w-[200px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
          )}
        >
          <option value="">Selecciona una MP</option>
          {materialesPrimas.map((mp) => (
            <option key={mp.id} value={mp.id}>
              {mp.name} ({mp.unit})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="planned_quantity" className="text-xs">
          Cantidad
        </Label>
        <Input
          id="planned_quantity"
          name="planned_quantity"
          type="number"
          min="0"
          step="any"
          required
          placeholder="0"
          className="h-9 w-24 border-gray-200"
        />
      </div>
      <SubmitButton />
    </form>
  )
}
