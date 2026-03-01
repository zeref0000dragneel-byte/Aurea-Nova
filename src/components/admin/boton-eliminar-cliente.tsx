'use client'

import { useRef, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { eliminarCliente } from '@/app/admin/clientes/actions'

export function BotonEliminarCliente({ customerId }: { customerId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState(eliminarCliente, null)

  useEffect(() => {
    if (state?.error) {
      alert(state.error)
    }
  }, [state])

  function handleClick() {
    if (!confirm('¿Eliminar este cliente?')) return
    formRef.current?.requestSubmit()
  }

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="id" value={customerId} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-500 hover:bg-red-50 hover:text-red-600"
        onClick={handleClick}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  )
}
