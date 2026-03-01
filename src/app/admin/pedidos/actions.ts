'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegram } from '@/lib/telegram'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── CREAR PEDIDO (borrador) ─────────────────────────────────────────────────
export async function crearPedido(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()

  const customer_id = formData.get('customer_id') as string
  const delivery_date = formData.get('delivery_date') as string | null
  const delivery_address = formData.get('delivery_address') as string | null
  const notes = formData.get('notes') as string | null

  // Parsear items del carrito enviados como JSON
  const itemsRaw = formData.get('items') as string
  let items: { product_id: string; quantity: number }[] = []
  try {
    items = JSON.parse(itemsRaw)
  } catch {
    return { error: 'Items del pedido inválidos' }
  }

  if (!customer_id) return { error: 'Selecciona un cliente' }
  if (!items || items.length === 0) return { error: 'Agrega al menos un producto' }

  // ── Calcular precio final por item ──
  const orderItemsToInsert = []
  let subtotal = 0

  for (const item of items) {
    // Buscar precio personalizado activo
    const { data: precioCustom } = await supabase
      .from('customer_prices')
      .select('fixed_price, discount_pct')
      .eq('customer_id', customer_id)
      .eq('product_id', item.product_id)
      .eq('is_active', true)
      .maybeSingle()

    // Buscar precio base del producto
    const { data: product } = await supabase
      .from('products')
      .select('base_price, name')
      .eq('id', item.product_id)
      .single()

    if (!product) return { error: `Producto no encontrado: ${item.product_id}` }

    let unit_price = Number(product.base_price)
    let discount_pct = 0

    if (precioCustom) {
      if (precioCustom.fixed_price !== null && precioCustom.fixed_price > 0) {
        unit_price = Number(precioCustom.fixed_price)
      } else if (precioCustom.discount_pct !== null && precioCustom.discount_pct > 0) {
        discount_pct = Number(precioCustom.discount_pct)
        unit_price = Number(product.base_price) * (1 - discount_pct / 100)
      }
    }

    const itemSubtotal = unit_price * item.quantity
    subtotal += itemSubtotal

    orderItemsToInsert.push({
      product_id: item.product_id,
      lot_id: null, // se asigna al confirmar (FIFO)
      quantity: item.quantity,
      unit_price: Math.round(unit_price * 100) / 100,
      discount_pct,
      subtotal: Math.round(itemSubtotal * 100) / 100,
    })
  }

  const total = Math.round(subtotal * 100) / 100
  const order_number = `PED-${Date.now()}`

  // ── Insertar orden ──
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number,
      customer_id,
      status: 'borrador',
      payment_status: 'pendiente',
      subtotal: total,
      discount_amount: 0,
      total,
      paid_amount: 0,
      delivery_date: delivery_date || null,
      delivery_address: delivery_address || null,
      notes: notes || null,
    })
    .select('id')
    .single()

  if (orderError) return { error: orderError.message }

  // ── Insertar items ──
  const itemsConOrden = orderItemsToInsert.map(i => ({
    ...i,
    order_id: order.id,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsConOrden)

  if (itemsError) return { error: itemsError.message }

  await sendTelegram(
    `🛒 <b>Nuevo Pedido</b>\n` +
      `📋 ${order_number}\n` +
      `👤 Cliente ID: ${customer_id}\n` +
      `💰 Total: $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}\n` +
      `📅 Creado: ${new Date().toLocaleString('es-MX')}`
  )
  redirect('/admin/pedidos')
}

// ─── CONFIRMAR PEDIDO (asignación FIFO) ──────────────────────────────────────
export async function confirmarPedido(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const order_id = formData.get('order_id') as string

  // Obtener items del pedido
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, product_id, quantity')
    .eq('order_id', order_id)

  if (itemsError) return { error: itemsError.message }

  // Para cada item: asignar lote FIFO y actualizar committed_quantity
  for (const item of items) {
    // Lote más antiguo disponible (FIFO)
    const { data: lote } = await supabase
      .from('inventory_lots')
      .select('id, current_quantity, committed_quantity')
      .eq('product_id', item.product_id)
      .gt('current_quantity', 0)
      .order('production_date', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!lote) return { error: `Sin stock disponible para producto ${item.product_id}` }

    // Actualizar committed_quantity en el lote
    const { error: loteError } = await supabase
      .from('inventory_lots')
      .update({
        committed_quantity: Number(lote.committed_quantity) + Number(item.quantity),
      })
      .eq('id', lote.id)

    if (loteError) return { error: loteError.message }

    // Asignar lot_id al item
    const { error: itemUpdateError } = await supabase
      .from('order_items')
      .update({ lot_id: lote.id })
      .eq('id', item.id)

    if (itemUpdateError) return { error: itemUpdateError.message }
  }

  // Actualizar status de la orden
  const { error: orderError } = await supabase
    .from('orders')
    .update({ status: 'confirmado' })
    .eq('id', order_id)

  if (orderError) return { error: orderError.message }

  await sendTelegram(
    `✅ <b>Pedido Confirmado</b>\n` +
      `📋 Orden ID: ${order_id}\n` +
      `📦 Lotes FIFO asignados automáticamente\n` +
      `📅 ${new Date().toLocaleString('es-MX')}`
  )
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${order_id}`)
  return { success: true }
}

// ─── ACTUALIZAR ESTADO ────────────────────────────────────────────────────────
export async function actualizarEstadoPedido(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const order_id = formData.get('order_id') as string
  const status = formData.get('status') as string

  const statusValidos = ['en_preparacion', 'listo', 'entregado', 'cancelado']
  if (!statusValidos.includes(status)) return { error: 'Estado inválido' }

  // Si se cancela: liberar committed_quantity de los lotes
  if (status === 'cancelado') {
    const { data: items } = await supabase
      .from('order_items')
      .select('lot_id, quantity')
      .eq('order_id', order_id)
      .not('lot_id', 'is', null)

    if (items) {
      for (const item of items) {
        const { data: lote } = await supabase
          .from('inventory_lots')
          .select('committed_quantity')
          .eq('id', item.lot_id)
          .single()

        if (lote) {
          await supabase
            .from('inventory_lots')
            .update({
              committed_quantity: Math.max(0, Number(lote.committed_quantity) - Number(item.quantity)),
            })
            .eq('id', item.lot_id)
        }
      }
    }
  }

  // Si se entrega: descontar current_quantity y registrar movimiento salida
  if (status === 'entregado') {
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

          // Registrar movimiento de salida
          await supabase.from('inventory_movements').insert({
            lot_id: item.lot_id,
            product_id: item.product_id,
            movement_type: 'salida',
            quantity: item.quantity,
            unit_cost: item.unit_price,
            reference_id: order_id,
            reference_type: 'order',
            notes: `Entrega pedido`,
          })
        }
      }
    }

    // Marcar confirmed_by_employee y confirmed_at
    await supabase
      .from('orders')
      .update({
        status: 'entregado',
        confirmed_by_employee: true,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', order_id)

    await sendTelegram(
      `🚚 <b>Pedido Entregado</b>\n` +
        `📋 Orden ID: ${order_id}\n` +
        `✅ Marcado como entregado\n` +
        `📅 ${new Date().toLocaleString('es-MX')}`
    )
    revalidatePath('/admin/pedidos')
    revalidatePath(`/admin/pedidos/${order_id}`)
    return { success: true }
  }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', order_id)

  if (error) return { error: error.message }

  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${order_id}`)
  return { success: true }
}

// ─── REGISTRAR PAGO / ABONO ───────────────────────────────────────────────────
export async function registrarPago(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const order_id = formData.get('order_id') as string
  const customer_id = formData.get('customer_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const payment_method = formData.get('payment_method') as string
  const reference = formData.get('reference') as string | null
  const notes = formData.get('notes') as string | null

  if (!amount || amount <= 0) return { error: 'Monto inválido' }

  // Insertar pago
  const { error: pagoError } = await supabase.from('payments').insert({
    order_id,
    customer_id,
    amount,
    payment_method,
    reference: reference || null,
    notes: notes || null,
  })

  if (pagoError) return { error: pagoError.message }

  // Recalcular paid_amount de la orden
  const { data: pagos } = await supabase
    .from('payments')
    .select('amount')
    .eq('order_id', order_id)

  const totalPagado = pagos?.reduce((acc, p) => acc + Number(p.amount), 0) ?? 0

  // Obtener total de la orden para calcular payment_status
  const { data: order } = await supabase
    .from('orders')
    .select('total')
    .eq('id', order_id)
    .single()

  let payment_status = 'pendiente'
  if (order) {
    if (totalPagado >= Number(order.total)) payment_status = 'pagado'
    else if (totalPagado > 0) payment_status = 'parcial'
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ paid_amount: totalPagado, payment_status })
    .eq('id', order_id)

  if (updateError) return { error: updateError.message }

  await sendTelegram(
    `💵 <b>Pago Registrado</b>\n` +
      `📋 Orden ID: ${order_id}\n` +
      `💰 Monto: $${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}\n` +
      `💳 Método: ${payment_method}\n` +
      `📅 ${new Date().toLocaleString('es-MX')}`
  )
  revalidatePath(`/admin/pedidos/${order_id}`)
  return { success: true }
}

// ─── REFERENCIA RLS PEDIDOS (ejecutar en Supabase: src/lib/rls-pedidos.sql) ───
/*
-- RLS para que clientes vean sus pedidos
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins y empleados ven todos los pedidos" ON orders FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'empleado'))
);

CREATE POLICY "Clientes ven sus pedidos" ON orders FOR SELECT
USING (
  customer_id IN (SELECT id FROM customers WHERE email = auth.jwt()->>'email')
);

CREATE POLICY "Admins gestionan pedidos" ON orders FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins y empleados ven items" ON order_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'empleado'))
);

CREATE POLICY "Clientes ven sus items" ON order_items FOR SELECT
USING (
  order_id IN (
    SELECT id FROM orders WHERE customer_id IN (
      SELECT id FROM customers WHERE email = auth.jwt()->>'email'
    )
  )
);

CREATE POLICY "Admins gestionan items" ON order_items FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins y empleados ven pagos" ON payments FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'empleado'))
);

CREATE POLICY "Clientes ven sus pagos" ON payments FOR SELECT
USING (
  customer_id IN (SELECT id FROM customers WHERE email = auth.jwt()->>'email')
);

CREATE POLICY "Admins gestionan pagos" ON payments FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
*/
