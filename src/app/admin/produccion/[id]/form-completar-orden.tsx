'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { completarOrden } from '@/app/admin/produccion/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-emerald-600 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      {pending ? 'Completando…' : 'Completar Orden'}
    </Button>
  )
}

export function FormCompletarOrden({
  ordenId,
  hasConsumos = true,
}: {
  ordenId: string
  hasConsumos?: boolean
}) {
  const [state, formAction] = useFormState(completarOrden, null)
  const error = state && typeof state === 'object' && 'error' in state ? (state as { error: string }).error : null

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6">
      <input type="hidden" name="orden_id" value={ordenId} />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {!hasConsumos && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          No hay materias primas registradas. Agrega al menos un consumo antes de completar la orden.
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="actual_quantity">Cantidad Real *</Label>
          <Input
            id="actual_quantity"
            name="actual_quantity"
            type="number"
            min="0"
            step="1"
            required
            placeholder="0"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="waste_quantity">Merma</Label>
          <Input
            id="waste_quantity"
            name="waste_quantity"
            type="number"
            min="0"
            step="any"
            defaultValue="0"
            placeholder="0"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="waste_notes">Notas merma</Label>
          <Textarea
            id="waste_notes"
            name="waste_notes"
            placeholder="Opcional"
            rows={2}
            className="resize-none border-gray-200"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="waste_photo">Foto merma</Label>
          <Input
            id="waste_photo"
            name="waste_photo"
            type="file"
            accept="image/*"
            className="border-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-800"
          />
        </div>
      </div>
      <SubmitButton />
    </form>
  )
}
