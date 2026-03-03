import { createClient } from '@/lib/supabase/server'
import FormNuevoPedido from './form-nuevo-pedido'

export default async function NuevoPedidoPage() {
  const supabase = await createClient()

  // Lotes con stock disponible
  const { data: lotes } = await supabase
    .from('inventory_lots')
    .select('product_id, current_quantity')
    .gt('current_quantity', 0)

  const productIdsConStock = Array.from(new Set((lotes ?? []).map(l => l.product_id)))

  let productosConStock: Array<{
    id: string
    name: string
    unit: string
    base_price: number
    sku: string
    stock_disponible: number
  }> = []

  if (productIdsConStock.length > 0) {
    const { data: productosData } = await supabase
      .from('products')
      .select('id, name, unit, base_price, sku')
      .eq('is_active', true)
      .in('id', productIdsConStock)
      .order('name')

    const stockPorProducto: Record<string, number> = {}
    ;(lotes ?? []).forEach(l => {
      stockPorProducto[l.product_id] = (stockPorProducto[l.product_id] ?? 0) + Number(l.current_quantity)
    })

    productosConStock = (productosData ?? []).map(p => ({
      ...p,
      stock_disponible: stockPorProducto[p.id] ?? 0,
    }))
  }

  const { data: clientes } = await supabase
    .from('customers')
    .select('id, business_name, contact_name')
    .eq('is_active', true)
    .order('business_name')

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nuevo Pedido</h1>
        <p className="text-muted-foreground text-sm">
          Los precios se ajustan automáticamente según el cliente seleccionado
        </p>
      </div>
      <FormNuevoPedido
        clientes={clientes ?? []}
        productos={productosConStock}
      />
    </div>
  )
}
