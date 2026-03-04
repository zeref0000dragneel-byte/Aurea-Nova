'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function confirmarEntregaEmpleado(prevState: unknown, formData: FormData) {
  const order_id = formData.get('order_id') as string
  if (!order_id) return { error: 'Falta order_id' }

  const supabase = createAdminClient()

  // Primero actualizar confirmed_by_employee; luego leer estado fresco para evitar race condition
  const { error: updateEmpError } = await supabase
    .from('orders')
    .update({ confirmed_by_employee: true })
    .eq('id', order_id)

  if (updateEmpError) return { error: updateEmpError.message }

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('confirmed_by_customer, status')
    .eq('id', order_id)
    .single()

  if (fetchError || !order) return { error: fetchError?.message ?? 'Pedido no encontrado' }

  if (order.confirmed_by_customer === true) {
    // Solo ejecutar cierre si el pedido NO está ya entregado (evita descontar inventario dos veces)
    if (order.status !== 'entregado') {
      const { data: items } = await supabase
        .from('order_items')
        .select('lot_id, product_id, quantity, unit_price')
        .eq('order_id', order_id)
        .not('lot_id', 'is', null)

      if (items) {
        for (const item of items) {
          const { data: lote } = await supabase
            .from('inventory_lots')
            .select('current_quantity, committed_quantity')
            .eq('id', item.lot_id)
            .single()

          if (lote) {
            await supabase
              .from('inventory_lots')
              .update({
                current_quantity: Math.max(0, Number(lote.current_quantity) - Number(item.quantity)),
                committed_quantity: Math.max(0, Number(lote.committed_quantity) - Number(item.quantity)),
              })
              .eq('id', item.lot_id)

            await supabase.from('inventory_movements').insert({
              lot_id: item.lot_id,
              product_id: item.product_id,
              movement_type: 'salida',
              quantity: item.quantity,
              unit_cost: item.unit_price,
              reference_id: order_id,
              reference_type: 'order',
              notes: 'Entrega pedido',
            })
          }
        }
      }
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'entregado',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', order_id)

    if (updateError) return { error: updateError.message }
  }

  revalidatePath('/empleado/pedidos')
  revalidatePath(`/empleado/pedidos/${order_id}`)
  return { success: true }
}
