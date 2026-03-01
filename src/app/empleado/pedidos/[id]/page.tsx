import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DetallePedidoEmpleado from './detalle-pedido-empleado'

export default async function EmpleadoPedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
        customers(business_name, contact_name, phone, address)
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
    <DetallePedidoEmpleado
      order={order}
      items={items ?? []}
      pagos={pagos ?? []}
    />
  )
}
