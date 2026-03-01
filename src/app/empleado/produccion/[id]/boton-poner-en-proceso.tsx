'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { actualizarEstadoOrden } from '@/app/admin/produccion/actions'

export function BotonPonerEnProceso({ ordenId }: { ordenId: string }) {
  const [state, formAction] = useFormState(actualizarEstadoOrden, null)
  const { pending } = useFormStatus()
  const error = state && typeof state === 'object' && 'error' in state
    ? (state as { error: string }).error
    : null

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="orden_id" value={ordenId} />
      <input type="hidden" name="nuevo_status" value="en_proceso" />
      {error && (
        <p className="mb-2 text-sm text-red-600">{error}</p>
      )}
      <Button
        type="submit"
        disabled={pending}
        variant="outline"
        size="sm"
        className="border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
      >
        <Play className="mr-1.5 h-4 w-4" />
        {pending ? 'Actualizando…' : 'Poner en proceso'}
      </Button>
    </form>
  )
}
