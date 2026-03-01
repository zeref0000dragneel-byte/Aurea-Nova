import { createClient } from '@/lib/supabase/server'
import FormNuevoPedido from './form-nuevo-pedido'

export default async function NuevoPedidoPage() {
  const supabase = await createClient()

  const [{ data: clientes }, { data: productos }] = await Promise.all([
    supabase
      .from('customers')
      .select('id, business_name, contact_name')
      .eq('is_active', true)
      .order('business_name'),
    supabase
      .from('products')
      .select('id, name, unit, base_price, sku')
      .eq('is_active', true)
      .order('name'),
  ])

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
        productos={productos ?? []}
      />
    </div>
  )
}
