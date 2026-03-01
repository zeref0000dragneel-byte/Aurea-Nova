'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { agregarPrecioCliente } from './actions'

type Producto = {
  id: string
  name: string
  unit: string
  base_price: number
}

type Props = {
  customerId: string
  productos: Producto[]
}

function formatPrecioBase(producto: Producto) {
  return `$${Number(producto.base_price).toFixed(2)}/${producto.unit}`
}

export function FormAgregarPrecio({ customerId, productos }: Props) {
  const [state, formAction] = useFormState(agregarPrecioCliente, null)
  const [tipoPrecio, setTipoPrecio] = useState<'fijo' | 'descuento'>('fijo')
  const [productId, setProductId] = useState<string>('')

  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null
  const success =
    state && typeof state === 'object' && 'success' in state && (state as { success?: boolean }).success

  if (productos.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Todos los productos ya tienen precio personalizado para este cliente.
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="customer_id" value={customerId} />
      <input type="hidden" name="product_id" value={productId} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Precio agregado correctamente.
        </div>
      )}

      <div className="space-y-2">
        <Label>Producto</Label>
        <Select
          value={productId}
          onValueChange={setProductId}
          required
        >
          <SelectTrigger className="w-full border-gray-200">
            <SelectValue placeholder="Selecciona un producto" />
          </SelectTrigger>
          <SelectContent>
            {productos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} — {formatPrecioBase(p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Precio base actual como referencia
        </p>
      </div>

      <div className="space-y-3">
        <Label>Tipo de precio</Label>
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="tipo"
              checked={tipoPrecio === 'fijo'}
              onChange={() => setTipoPrecio('fijo')}
              className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium">Precio fijo</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="tipo"
              checked={tipoPrecio === 'descuento'}
              onChange={() => setTipoPrecio('descuento')}
              className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium">Descuento %</span>
          </label>
        </div>

        {tipoPrecio === 'fijo' ? (
          <div className="space-y-2">
            <Label htmlFor="fixed_price">Precio fijo</Label>
            <Input
              id="fixed_price"
              name="fixed_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="border-gray-200"
            />
            <input type="hidden" name="discount_pct" value="" />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="discount_pct">Descuento %</Label>
            <div className="flex items-center gap-2">
              <Input
                id="discount_pct"
                name="discount_pct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0 – 100"
                className="border-gray-200"
              />
              <span className="text-sm font-medium text-gray-500">%</span>
            </div>
            <input type="hidden" name="fixed_price" value="" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Input
          id="notes"
          name="notes"
          placeholder="Acuerdo comercial, contrato, etc."
          className="border-gray-200"
        />
      </div>

      <Button
        type="submit"
        disabled={!productId}
        className="bg-amber-500 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
      >
        Agregar Precio
      </Button>
    </form>
  )
}
