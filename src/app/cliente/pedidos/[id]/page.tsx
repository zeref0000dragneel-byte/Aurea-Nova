import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DetallePedidoCliente, { type ItemRow } from './detalle-pedido-cliente'

export default async function ClientePedidoDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) notFound()

  const { data: customer } = await supabase
    .from('customers')
    .select('id, business_name')
    .eq('email', user.email)
    .eq('is_active', true)
    .maybeSingle()

  if (!customer) notFound()

  const [
    { data: order, error: orderError },
    { data: items },
    { data: pagos },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        *,
        customers(business_name)
      `)
      .eq('id', id)
      .eq('customer_id', customer.id)
      .single(),
    supabase
      .from('order_items')
      .select(`
        id, product_id, quantity, unit_price, discount_pct, subtotal,
        products(name, unit),
        inventory_lots(lot_number)
      `)
      .eq('order_id', id),
    supabase
      .from('payments')
      .select('id, amount, payment_method, reference, created_at')
      .eq('order_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (orderError || !order) notFound()

  return (
    <DetallePedidoCliente
      order={order}
      items={(items ?? []) as unknown as ItemRow[]}
      pagos={pagos ?? []}
    />
  )
}
