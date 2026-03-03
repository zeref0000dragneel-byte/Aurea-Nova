'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type ConfirmarEntregaState = { success?: boolean; error?: string }

export async function confirmarEntregaCliente(
  prevState: ConfirmarEntregaState | null,
  formData: FormData
): Promise<ConfirmarEntregaState> {
  const order_id = formData.get('order_id') as string
  if (!order_id) return { error: 'Falta el identificador del pedido' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'No has iniciado sesión' }

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user.email)
    .eq('is_active', true)
    .maybeSingle()

  if (!customer) return { error: 'Cliente no encontrado' }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, customer_id, confirmed_by_employee, confirmed_by_customer, status')
    .eq('id', order_id)
    .single()

  if (orderError || !order) return { error: 'Pedido no encontrado' }
  if (order.customer_id !== customer.id) return { error: 'No tienes permiso para este pedido' }

  const update: {
    confirmed_by_customer: boolean
    status?: string
    confirmed_at?: string
  } = { confirmed_by_customer: true }

  if (order.confirmed_by_employee === true) {
    update.status = 'entregado'
    update.confirmed_at = new Date().toISOString()

    // Solo ejecutar cierre si el pedido NO está ya entregado (evita descontar inventario dos veces)
    if (order.status !== 'entregado') {
      const adminSupabase = createAdminClient()
      const { data: items, error: itemsError } = await adminSupabase
        .from('order_items')
        .select('id, lot_id, product_id, quantity, unit_price')
        .eq('order_id', order_id)

      if (itemsError) return { error: itemsError.message }
      if (items?.length) {
        for (const item of items) {
          const { data: lot, error: lotError } = await adminSupabase
            .from('inventory_lots')
            .select('current_quantity, committed_quantity')
            .eq('id', item.lot_id)
            .single()

          if (lotError || !lot) return { error: 'Lote no encontrado para el ítem del pedido' }

          const { error: updateLotError } = await adminSupabase
            .from('inventory_lots')
            .update({
              current_quantity: lot.current_quantity - item.quantity,
              committed_quantity: Math.max(0, (lot.committed_quantity ?? 0) - item.quantity),
            })
            .eq('id', item.lot_id)

          if (updateLotError) return { error: updateLotError.message }

          const { error: movError } = await adminSupabase.from('inventory_movements').insert({
            lot_id: item.lot_id,
            product_id: item.product_id,
            movement_type: 'salida',
            quantity: item.quantity,
            unit_cost: item.unit_price,
            reference_id: order_id,
            reference_type: 'order',
            notes: `Entrega pedido ${order_id}`,
            created_by: user.id,
          })
          if (movError) return { error: movError.message }
        }
      }
    }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(update)
    .eq('id', order_id)

  if (updateError) return { error: updateError.message }

  revalidatePath(`/cliente/pedidos/${order_id}`)
  revalidatePath('/cliente/dashboard')
  revalidatePath('/cliente/pedidos')
  return { success: true }
}

/*
  Si el portal del cliente muestra datos vacíos (sin error), puede ser RLS en Supabase.
  Ejecutar en el SQL Editor de Supabase:

-- Política para que clientes vean sus propias órdenes
CREATE POLICY "Clientes ven sus pedidos" ON orders FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE email = auth.jwt()->>'email'
));

-- Política para que clientes vean items de sus órdenes
CREATE POLICY "Clientes ven sus items" ON order_items FOR SELECT
USING (order_id IN (
  SELECT id FROM orders WHERE customer_id IN (
    SELECT id FROM customers WHERE email = auth.jwt()->>'email'
  )
));

-- Política para que clientes vean sus pagos
CREATE POLICY "Clientes ven sus pagos" ON payments FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE email = auth.jwt()->>'email'
));

-- Opcional: que el cliente pueda leer su registro en customers (para dashboard/precios)
CREATE POLICY "Clientes ven su propio registro" ON customers FOR SELECT
USING (email = auth.jwt()->>'email');

-- Opcional: que el cliente pueda leer precios que le aplican
CREATE POLICY "Clientes ven sus precios" ON customer_prices FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE email = auth.jwt()->>'email'
));

-- Habilitar RLS en las tablas si no está:
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_prices ENABLE ROW LEVEL SECURITY;
*/
