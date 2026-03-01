'use client'

import { useRef, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { Button } from '@/components/ui/button'
import { eliminarConsumoMP } from '@/app/admin/produccion/actions'

export function BotonEliminarConsumoMP({
  usageId,
  productionOrderId,
}: {
  usageId: string
  productionOrderId: string
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState(eliminarConsumoMP, null)

  useEffect(() => {
    if (state?.error) {
      alert(state.error)
    }
  }, [state])

  function handleClick() {
    if (!confirm('¿Quitar esta materia prima del consumo?')) return
    formRef.current?.requestSubmit()
  }

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="usage_id" value={usageId} />
      <input type="hidden" name="production_order_id" value={productionOrderId} />
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={handleClick}
      >
        Eliminar
      </Button>
    </form>
  )
}
