'use client'

import { useRef, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { eliminarCategoria } from '@/app/admin/configuracion/actions'

export function BotonEliminarCategoria({ categoryId }: { categoryId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState(eliminarCategoria, null)

  useEffect(() => {
    if (state?.error) {
      alert(state.error)
    }
  }, [state])

  function handleClick() {
    if (!confirm('¿Eliminar esta categoría?')) return
    formRef.current?.requestSubmit()
  }

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="id" value={categoryId} />
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
