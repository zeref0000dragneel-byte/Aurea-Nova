'use client'

import { useRef } from 'react'
import { useFormState } from 'react-dom'
import { UserX, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleUsuarioActivo, type ToggleUsuarioState } from './actions'

export function BotonToggleUsuario({
  userId,
  isActive,
  role,
}: {
  userId: string
  isActive: boolean
  role: string
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState(toggleUsuarioActivo, null as ToggleUsuarioState | null)

  function handleClick(e: React.MouseEvent) {
    if (isActive && !confirm('¿Desactivar este usuario? No podrá iniciar sesión.')) {
      e.preventDefault()
      return
    }
    formRef.current?.requestSubmit()
  }

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="is_active" value={String(isActive)} />
      <input type="hidden" name="role" value={role} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={isActive ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}
      >
        {isActive ? (
          <>
            <UserX className="mr-1.5 h-4 w-4" />
            Desactivar
          </>
        ) : (
          <>
            <UserCheck className="mr-1.5 h-4 w-4" />
            Activar
          </>
        )}
      </Button>
      {state?.error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  )
}
