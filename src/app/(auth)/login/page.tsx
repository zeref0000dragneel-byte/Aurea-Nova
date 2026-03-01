'use client'

import { useState, useTransition } from 'react'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Hexagon, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo y marca */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl mb-4 shadow-lg shadow-amber-200">
            <Hexagon className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Colmena OS
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Colmena OS — Amor de Colmena
          </p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Iniciar sesión
          </h2>

          <form action={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                autoComplete="email"
                className="h-11 border-gray-200 focus:border-amber-400 focus:ring-amber-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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
                  className="h-11 pr-10 border-gray-200 focus:border-amber-400 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all shadow-md shadow-amber-200 hover:shadow-amber-300 mt-2"
            >
              {isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</>
                : 'Entrar al sistema'
              }
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Acceso restringido. Solo personal autorizado.
        </p>
      </div>
    </div>
  )
}
