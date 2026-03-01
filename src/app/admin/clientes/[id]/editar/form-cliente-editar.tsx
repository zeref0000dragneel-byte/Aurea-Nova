'use client'

import { useFormState } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { actualizarCliente } from '@/app/admin/clientes/actions'
import { cn } from '@/lib/utils'

type Customer = {
  id: string
  business_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  rfc: string | null
  credit_days: number
  credit_limit: number
  notes: string | null
  is_active: boolean
}

export function FormClienteEditar({ customer }: { customer: Customer }) {
  const [state, formAction] = useFormState(actualizarCliente, null)
  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={customer.id} />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="business_name">Nombre de empresa *</Label>
          <Input
            id="business_name"
            name="business_name"
            required
            defaultValue={customer.business_name}
            placeholder="Razón social"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_name">Nombre de contacto</Label>
          <Input
            id="contact_name"
            name="contact_name"
            defaultValue={customer.contact_name ?? ''}
            placeholder="Persona de contacto"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={customer.email ?? ''}
            placeholder="correo@ejemplo.com"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={customer.phone ?? ''}
            placeholder="Teléfono"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            name="address"
            defaultValue={customer.address ?? ''}
            placeholder="Dirección"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rfc">RFC</Label>
          <Input
            id="rfc"
            name="rfc"
            defaultValue={customer.rfc ?? ''}
            placeholder="RFC"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="credit_days">Días de crédito</Label>
          <Input
            id="credit_days"
            name="credit_days"
            type="number"
            min={0}
            defaultValue={customer.credit_days}
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="credit_limit">Límite de crédito</Label>
          <Input
            id="credit_limit"
            name="credit_limit"
            type="number"
            step="0.01"
            min={0}
            defaultValue={customer.credit_limit}
            placeholder="0.00"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={customer.notes ?? ''}
            placeholder="Notas opcionales"
            rows={3}
            className="resize-none border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="is_active">Estado</Label>
          <select
            id="is_active"
            name="is_active"
            defaultValue={customer.is_active ? 'activo' : 'inactivo'}
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
            )}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>
      <Button
        type="submit"
        className="bg-amber-500 font-medium text-white hover:bg-amber-600"
      >
        Guardar cambios
      </Button>
    </form>
  )
}
