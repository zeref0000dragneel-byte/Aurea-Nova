'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { registrarCompra } from '../actions'
import { cn } from '@/lib/utils'

type MateriaPrimaOption = {
  id: string
  name: string
  unit: string
  unit_cost: number
  supplier: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-amber-500 font-medium text-white hover:bg-amber-600 disabled:opacity-60"
    >
      {pending ? 'Registrando…' : 'Registrar Compra'}
    </Button>
  )
}

export default function FormNuevaCompra({
  materiasPrimas,
}: {
  materiasPrimas: MateriaPrimaOption[]
}) {
  const [state, formAction] = useFormState(registrarCompra, null)
  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null

  const [selectedId, setSelectedId] = useState<string>('')
  const [supplier, setSupplier] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [quantity, setQuantity] = useState('')
  const [pagoInicial, setPagoInicial] = useState<'completo' | 'pendiente' | 'parcial'>('pendiente')

  const selected = useMemo(
    () => materiasPrimas.find((m) => m.id === selectedId),
    [materiasPrimas, selectedId]
  )

  const q = parseFloat(quantity) || 0
  const uc = parseFloat(unitCost) || 0
  const total = q * uc

  const handleMateriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedId(id)
    const m = materiasPrimas.find((x) => x.id === id)
    if (m) {
      setSupplier(m.supplier)
      setUnitCost(String(m.unit_cost))
    } else {
      setSupplier('')
      setUnitCost('')
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="raw_material_select">Materia prima *</Label>
        <select
          id="raw_material_select"
          name="raw_material_id"
          required
          value={selectedId}
          onChange={(e) => {
            handleMateriaChange(e)
            const id = e.target.value
            const m = materiasPrimas.find((x) => x.id === id)
            if (m) {
              setSupplier(m.supplier)
              setUnitCost(String(m.unit_cost))
            }
          }}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
          )}
        >
          <option value="">Selecciona una materia prima</option>
          {materiasPrimas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.unit})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Proveedor *</Label>
        <Input
          id="supplier"
          name="supplier"
          type="text"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Nombre del proveedor"
          required
          className="border-gray-200"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="purchase_date">Fecha de compra *</Label>
          <Input
            id="purchase_date"
            name="purchase_date"
            type="date"
            defaultValue={today}
            required
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">
            Cantidad * {selected && `(${selected.unit})`}
          </Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            step="any"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={selected ? `Ej. 10 ${selected.unit}` : '0'}
            className="border-gray-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit_cost">Costo unitario *</Label>
        <Input
          id="unit_cost"
          name="unit_cost"
          type="number"
          min="0"
          step="0.01"
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
          required
          className="border-gray-200"
        />
      </div>

      <TotalDisplay total={total} />

      <div className="space-y-2">
        <Label htmlFor="invoice_number">No. de factura / remisión</Label>
        <Input
          id="invoice_number"
          name="invoice_number"
          type="text"
          placeholder="Opcional"
          className="border-gray-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Opcional"
          rows={3}
          className="resize-none border-gray-200"
        />
      </div>

      <div className="space-y-4">
        <Label>¿Se pagó al recibir?</Label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="pago_inicial"
              value="completo"
              checked={pagoInicial === 'completo'}
              onChange={() => setPagoInicial('completo')}
              className="border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">Sí, pagado completo</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="pago_inicial"
              value="pendiente"
              checked={pagoInicial === 'pendiente'}
              onChange={() => setPagoInicial('pendiente')}
              className="border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">No, queda pendiente</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="pago_inicial"
              value="parcial"
              checked={pagoInicial === 'parcial'}
              onChange={() => setPagoInicial('parcial')}
              className="border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">Anticipo (parcial)</span>
          </label>
        </div>
        {pagoInicial === 'parcial' && (
          <div>
            <Label htmlFor="anticipo">Anticipo (opcional)</Label>
            <Input
              id="anticipo"
              name="anticipo"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="mt-1 border-gray-200"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/compras">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}

function TotalDisplay({ total }: { total: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-lg font-semibold text-gray-900">
        Total: ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}
