'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Beaker } from 'lucide-react'
import { loginDemo } from './actions'

// ──────────────────────────────────────────────
// Botón individual — se deshabilita si pending
// ──────────────────────────────────────────────
function DemoButton({
    rol,
    label,
    description,
}: {
    rol: string
    label: string
    description: string
}) {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            name="rol"
            value={rol}
            disabled={pending}
            className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition-all duration-200 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <p className="text-sm font-semibold text-amber-900">{label}</p>
            <p className="mt-0.5 text-xs text-amber-700/80">{description}</p>
        </button>
    )
}

// ──────────────────────────────────────────────
// Componente principal exportado
// ──────────────────────────────────────────────
export function DemoButtons() {
    const [state, formAction] = useFormState(loginDemo, null)

    return (
        <div className="mt-6">
            {/* Separador con etiqueta "Modo demo" */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 border-t border-amber-200" />
                <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    <Beaker className="h-3.5 w-3.5" />
                    Modo demo
                </span>
                <div className="flex-1 border-t border-amber-200" />
            </div>

            {/* Mensaje de error */}
            {state?.error && (
                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
                    <p className="text-xs font-medium text-red-700">{state.error}</p>
                </div>
            )}

            {/* Tres botones dentro de un único form */}
            <form action={formAction} className="space-y-2">
                <DemoButton
                    rol="admin"
                    label="Entrar como Admin"
                    description="Acceso completo al panel de administración"
                />
                <DemoButton
                    rol="empleado"
                    label="Entrar como Empleado"
                    description="Vista de producción y pedidos asignados"
                />
                <DemoButton
                    rol="cliente"
                    label="Entrar como Cliente"
                    description="Portal de seguimiento de pedidos y precios"
                />
            </form>
        </div>
    )
}
