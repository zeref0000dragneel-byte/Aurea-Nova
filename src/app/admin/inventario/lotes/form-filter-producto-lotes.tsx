'use client'

import { useRef } from 'react'

type ProductOption = { id: string; name: string }

export function FormFilterProductoLotes({
  productOptions,
  currentProductId,
}: {
  productOptions: ProductOption[]
  currentProductId: string
}) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} method="get" action="/admin/inventario/lotes" className="mb-6">
      <label htmlFor="product_id" className="mr-2 text-sm font-medium text-gray-700">
        Filtrar por producto:
      </label>
      <select
        id="product_id"
        name="product_id"
        defaultValue={currentProductId}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      >
        <option value="">Todos los productos</option>
        {productOptions.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </form>
  )
}
