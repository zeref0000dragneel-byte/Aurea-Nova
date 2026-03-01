import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DetallePedido from './detalle-pedido'

export default async function PedidoDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const supabase = await createClient()

  const [
    { data: order, error: orderError },
    { data: items },
    { data: pagos },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        *,
        customers(business_name, contact_name, phone, address),
        profiles!orders_created_by_fkey(full_name)
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('order_items')
      .select(`
        *,
        products(name, unit),
        inventory_lots(lot_number)
      `)
      .eq('order_id', id),
    supabase
      .from('payments')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (orderError || !order) {
    notFound()
  }

  return (
    <DetallePedido
      order={order}
      items={items ?? []}
      pagos={pagos ?? []}
    />
  )
}
