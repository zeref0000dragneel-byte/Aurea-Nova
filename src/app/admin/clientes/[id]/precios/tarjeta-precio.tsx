'use client'

import { useRef } from 'react'
import { useFormState } from 'react-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { desactivarPrecioCliente } from './actions'

type PrecioConProducto = {
  id: string
  customer_id: string
  product_id: string
  fixed_price: number | null
  discount_pct: number | null
  notes: string | null
  is_active: boolean
  products: { name: string; unit: string; base_price: number } | null
}

type Props = {
  precio: PrecioConProducto
  customerId: string
}

function formatMonto(n: number) {
  return `$${Number(n).toFixed(2)}`
}

export function TarjetaPrecio({ precio, customerId }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState(desactivarPrecioCliente, null)

  const productName = precio.products?.name ?? 'Producto'
  const unit = precio.products?.unit ?? ''
  const basePrice = precio.products?.base_price ?? 0
  const baseLabel = `Base: ${formatMonto(basePrice)}/${unit}`

  const tieneFijo = precio.fixed_price != null && precio.fixed_price > 0
  const tieneDescuento = precio.discount_pct != null && precio.discount_pct > 0

  let precioFinal: number = basePrice
  if (tieneFijo) {
    precioFinal = precio.fixed_price!
  } else if (tieneDescuento) {
    precioFinal = basePrice * (1 - precio.discount_pct! / 100)
  }

  function handleDesactivar() {
    if (
      !confirm(
        '¿Desactivar este precio? El producto volverá al precio base.'
      )
    ) {
      return
    }
    formRef.current?.requestSubmit()
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-6">
        <p className="font-semibold text-gray-900">{productName}</p>
        <p className="text-sm text-gray-500">{baseLabel}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tieneFijo && (
            <>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
                Precio Fijo
              </Badge>
              <span className="text-lg font-bold text-gray-900">
                {formatMonto(precio.fixed_price!)}
              </span>
            </>
          )}
          {tieneDescuento && (
            <>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
                Descuento {precio.discount_pct}%
              </Badge>
              <span className="text-lg font-bold text-gray-900">
                {formatMonto(precioFinal)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatMonto(basePrice)}
              </span>
            </>
          )}
        </div>

        {precio.notes && (
          <p className="mt-2 text-sm italic text-gray-500">{precio.notes}</p>
        )}

        {state?.error && (
          <p className="mt-2 text-sm text-red-600">{state.error}</p>
        )}
      </CardContent>
      <CardFooter className="border-t border-gray-100 pt-4">
        <form ref={formRef} action={formAction} className="w-full">
          <input type="hidden" name="precio_id" value={precio.id} />
          <input type="hidden" name="customer_id" value={customerId} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            onClick={handleDesactivar}
          >
            Desactivar
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
