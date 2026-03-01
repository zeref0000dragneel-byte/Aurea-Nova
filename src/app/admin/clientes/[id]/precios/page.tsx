import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { FormAgregarPrecio } from './form-agregar-precio'
import { TarjetaPrecio } from './tarjeta-precio'

type Props = { params: Promise<{ id: string }> }

type PrecioConProducto = {
  id: string
  customer_id: string
  product_id: string
  fixed_price: number | null
  discount_pct: number | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  products: { name: string; unit: string; base_price: number } | null
}

export default async function ClientePreciosPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [clienteResult, preciosResult, productosResult] = await Promise.all([
    supabase.from('customers').select('id, business_name').eq('id', id).single(),
    supabase
      .from('customer_prices')
      .select('id, customer_id, product_id, fixed_price, discount_pct, notes, is_active, created_at, updated_at, products(name, unit, base_price)')
      .eq('customer_id', id)
      .eq('is_active', true),
    supabase
      .from('products')
      .select('id, name, unit, base_price')
      .eq('is_active', true)
      .order('name'),
  ])

  const customer = clienteResult.data
  if (!customer) {
    notFound()
  }

  const preciosRaw = (preciosResult.data ?? []) as unknown as PrecioConProducto[]
  const precios = [...preciosRaw].sort((a, b) =>
    (a.products?.name ?? '').localeCompare(b.products?.name ?? '')
  )
  const todosProductos = productosResult.data ?? []

  const productIdsConPrecio = new Set(precios.map((p) => p.product_id))
  const productosDisponibles = todosProductos.filter(
    (p) => !productIdsConPrecio.has(p.id)
  )

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/admin/clientes"
              className="transition-colors hover:text-amber-600"
            >
              Clientes
            </Link>
            <span>/</span>
            <span className="text-gray-700">{customer.business_name}</span>
            <span>/</span>
            <span className="font-medium text-gray-900">
              Precios Personalizados
            </span>
          </nav>
          <Link
            href="/admin/clientes"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al cliente
          </Link>
        </div>
      </div>

      <h1 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
        Precios personalizados
      </h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Agregar precio
          </h2>
          <FormAgregarPrecio
            customerId={customer.id}
            productos={productosDisponibles}
          />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Precios actuales
          </h2>
          {precios.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {precios.map((precio) => (
                <TarjetaPrecio
                  key={precio.id}
                  precio={precio}
                  customerId={customer.id}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-sm text-gray-500">
              Aún no hay precios personalizados. Agrega uno arriba.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
