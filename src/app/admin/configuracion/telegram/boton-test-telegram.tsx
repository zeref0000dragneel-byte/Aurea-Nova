'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { testTelegram } from './actions'

export function BotonTestTelegram() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function handleClick() {
    setStatus('loading')
    setErrorMsg('')
    const result = await testTelegram()
    if ('success' in result && result.success) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMsg('error' in result ? result.error : 'Error al enviar')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Enviando…' : 'Enviar mensaje de prueba'}
      </Button>
      {status === 'success' && (
        <span className="text-sm font-medium text-green-600">✓ Enviado</span>
      )}
      {status === 'error' && (
        <span className="text-sm font-medium text-red-600">{errorMsg}</span>
      )}
    </div>
  )
}
