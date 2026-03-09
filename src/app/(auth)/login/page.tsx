'use client'

import { useState } from 'react'
import Image from 'next/image'
import { loginAction } from './actions'
import { DemoButtons } from './demo-buttons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsPending(true)
    const result = await loginAction(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
    // Si hay redirect, el componente se desmonta — no necesita setIsPending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <div className="w-full max-w-md">

        {/* Logo y marca */}
        <div className="text-center mb-16">
          <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-3xl bg-white shadow-xl mb-6">
            <Image
              src="/logo.png"
              alt="HiveCore"
              fill
              className="object-cover"
              sizes="80px"
              priority
            />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">
            HiveCore
          </h1>
          <p className="text-neutral-700/80 mt-2 text-sm font-medium">
            Sistema de gestión — Amor de Colmena
          </p>
        </div>

        {/* Card del formulario */}
        <div className="rounded-3xl border border-[#FFE082]/30 bg-white/95 shadow-xl p-6 transition-all duration-300 hover:shadow-2xl backdrop-blur-sm">
          <h2 className="font-display text-2xl font-bold tracking-wide text-neutral-700 mb-6">
            Iniciar sesión
          </h2>

          <form action={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                autoComplete="email"
                className="h-11 rounded-xl focus-visible:ring-4 focus-visible:ring-accent-miel/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10 rounded-xl focus-visible:ring-4 focus-visible:ring-accent-miel/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                <p className="text-sm text-danger font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 mt-2 font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              {isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</>
                : 'Entrar al sistema'
              }
            </Button>
          </form>
        </div>

        <DemoButtons />

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-8 italic font-medium">
          Acceso restringido. Solo personal autorizado.
        </p>
      </div>
    </div>
  )
}
