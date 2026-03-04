'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function registrarCompra(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const raw_material_id = (formData.get('raw_material_id') as string)?.trim()
  const supplier = (formData.get('supplier') as string)?.trim()
  const quantityStr = (formData.get('quantity') as string)?.trim()
  const unit_costStr = (formData.get('unit_cost') as string)?.trim()
  const purchase_date = (formData.get('purchase_date') as string)?.trim()
  const invoice_number = (formData.get('invoice_number') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null
  const pago_inicial = (formData.get('pago_inicial') as string)?.trim() as
    | 'completo'
    | 'pendiente'
    | 'parcial'
    | ''
  const anticipoStr = (formData.get('anticipo') as string)?.trim()

  if (!raw_material_id || !supplier) {
    return { error: 'Materia prima y proveedor son requeridos.' }
  }
  const quantity = parseFloat(quantityStr ?? '')
  const unit_cost = parseFloat(unit_costStr ?? '')
  if (Number.isNaN(quantity) || quantity <= 0) {
    return { error: 'La cantidad debe ser mayor que 0.' }
  }
  if (Number.isNaN(unit_cost) || unit_cost <= 0) {
    return { error: 'El costo unitario debe ser mayor que 0.' }
  }
  if (!purchase_date) {
    return { error: 'La fecha de compra es requerida.' }
  }

  const total = Math.round(quantity * unit_cost * 100) / 100
  let paid_amount = 0
  let payment_status: 'pendiente' | 'parcial' | 'pagado' = 'pendiente'

  if (pago_inicial === 'completo') {
    paid_amount = total
    payment_status = 'pagado'
  } else if (pago_inicial === 'parcial') {
    const anticipo = parseFloat(anticipoStr ?? '') || 0
    if (anticipo > 0) {
      paid_amount = Math.min(anticipo, total)
      payment_status = paid_amount >= total ? 'pagado' : 'parcial'
    }
  }

  let created_by: string | null = null
  try {
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    created_by = user?.id ?? null
  } catch {
    // seguir sin created_by
  }

  const supabase = createAdminClient()

  const { data: purchase, error: errPurchase } = await supabase
    .from('purchases')
    .insert({
      raw_material_id,
      supplier,
      quantity,
      unit_cost,
      total,
      paid_amount,
      payment_status,
      purchase_date,
      invoice_number,
      notes,
      created_by,
    })
    .select('id')
    .single()

  if (errPurchase) {
    return { error: errPurchase.message }
  }
  if (!purchase?.id) {
    return { error: 'No se pudo crear la compra.' }
  }

  if (paid_amount > 0) {
    const { error: errPayment } = await supabase.from('purchase_payments').insert({
      purchase_id: purchase.id,
      amount: paid_amount,
      payment_method: 'efectivo',
      reference: null,
      notes: pago_inicial === 'completo' ? 'Pago completo al recibir' : 'Anticipo inicial',
      created_by,
    })
    if (errPayment) {
      return { error: errPayment.message }
    }
  }

  const { data: rawMaterial } = await supabase
    .from('raw_materials')
    .select('current_stock')
    .eq('id', raw_material_id)
    .single()

  if (rawMaterial) {
    const newStock = (Number(rawMaterial.current_stock) ?? 0) + quantity
    const { error: errUpdateStock } = await supabase
      .from('raw_materials')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', raw_material_id)
    if (errUpdateStock) {
      return { error: errUpdateStock.message }
    }
  }

  revalidatePath('/admin/compras')
  redirect('/admin/compras')
}

export async function registrarPagoProveedor(
  prevState: unknown,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const purchase_id = (formData.get('purchase_id') as string)?.trim()
  const amountStr = (formData.get('amount') as string)?.trim()
  const payment_method = (formData.get('payment_method') as string)?.trim() || 'efectivo'
  const reference = (formData.get('reference') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  const amount = parseFloat(amountStr ?? '')
  if (!purchase_id || Number.isNaN(amount) || amount <= 0) {
    return { error: 'Compra y monto son requeridos; el monto debe ser mayor que 0.' }
  }

  let created_by: string | null = null
  try {
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    created_by = user?.id ?? null
  } catch {}

  const supabase = createAdminClient()

  const { error: errPayment } = await supabase.from('purchase_payments').insert({
    purchase_id,
    amount,
    payment_method,
    reference,
    notes,
    created_by,
  })
  if (errPayment) {
    return { error: errPayment.message }
  }

  const { data: payments } = await supabase
    .from('purchase_payments')
    .select('amount')
    .eq('purchase_id', purchase_id)

  const totalPagado = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0)

  const { data: purchase } = await supabase
    .from('purchases')
    .select('total')
    .eq('id', purchase_id)
    .single()

  const total = purchase ? Number(purchase.total) : 0
  const payment_status: 'pendiente' | 'parcial' | 'pagado' =
    totalPagado >= total ? 'pagado' : totalPagado > 0 ? 'parcial' : 'pendiente'

  const { error: errUpdate } = await supabase
    .from('purchases')
    .update({
      paid_amount: totalPagado,
      payment_status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchase_id)

  if (errUpdate) {
    return { error: errUpdate.message }
  }

  revalidatePath('/admin/compras')
  revalidatePath(`/admin/compras/${purchase_id}`)
  return { success: true }
}

// ─── Recepción de mercancía ─────────────────────────────────────────────────
export async function registrarRecepcion(
  prevState: unknown,
  formData: FormData
): Promise<{ success?: boolean; mensaje?: string; error?: string }> {
  const purchase_id = (formData.get('purchase_id') as string)?.trim()
  const received_quantityStr = (formData.get('received_quantity') as string)?.trim()
  const reception_notes = (formData.get('reception_notes') as string)?.trim() || null

  const received_quantity = parseFloat(received_quantityStr ?? '')
  if (!purchase_id || Number.isNaN(received_quantity) || received_quantity <= 0) {
    return { error: 'La cantidad recibida es requerida y debe ser mayor que 0.' }
  }

  const supabase = createAdminClient()

  const { data: purchase, error: errPurchase } = await supabase
    .from('purchases')
    .select('id, raw_material_id, quantity, unit_cost, received_quantity, reception_status')
    .eq('id', purchase_id)
    .single()

  if (errPurchase || !purchase) {
    return { error: errPurchase?.message ?? 'Compra no encontrada.' }
  }

  const status = (purchase.reception_status as string) ?? 'pendiente'
  if (status === 'recibido_completo' || status === 'cancelado') {
    return { error: 'Esta compra ya fue procesada y no puede modificarse.' }
  }

  const quantity = Number(purchase.quantity)
  const unit_cost = Number(purchase.unit_cost)
  const raw_material_id = purchase.raw_material_id as string
  const prevReceived = purchase.received_quantity != null ? Number(purchase.received_quantity) : 0
  // Si es primera recepción (prevReceived = 0), ajustar contra quantity pedida
  // Si es recepción adicional, ajustar contra lo ya recibido
  const ajuste = prevReceived === 0
    ? received_quantity - quantity   // primera vez: diff contra lo pedido
    : received_quantity - prevReceived // corrección: diff contra recepción anterior

  if (ajuste !== 0) {
    const { data: rawMaterial } = await supabase
      .from('raw_materials')
      .select('current_stock')
      .eq('id', raw_material_id)
      .single()

    if (rawMaterial) {
      const current = Number(rawMaterial.current_stock) ?? 0
      const newStock = ajuste > 0 ? current + ajuste : current - Math.abs(ajuste)
      const { error: errStock } = await supabase
        .from('raw_materials')
        .update({ current_stock: Math.max(0, newStock), updated_at: new Date().toISOString() })
        .eq('id', raw_material_id)
      if (errStock) return { error: errStock.message }
    }
  }

  const nuevo_total = Math.round(received_quantity * unit_cost * 100) / 100
  const final_reception_status: 'recibido_completo' | 'recibido_parcial' =
    received_quantity >= quantity ? 'recibido_completo' : 'recibido_parcial'

  const { error: errUpdate } = await supabase
    .from('purchases')
    .update({
      received_quantity,
      reception_notes,
      reception_status: final_reception_status,
      total: nuevo_total,
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchase_id)

  if (errUpdate) return { error: errUpdate.message }

  const { data: purchaseAfter } = await supabase
    .from('purchases')
    .select('paid_amount')
    .eq('id', purchase_id)
    .single()

  const paid_amount = purchaseAfter ? Number(purchaseAfter.paid_amount) : 0
  const payment_status: 'pendiente' | 'parcial' | 'pagado' =
    paid_amount >= nuevo_total ? 'pagado' : paid_amount > 0 ? 'parcial' : 'pendiente'

  const { error: errPaymentUpdate } = await supabase
    .from('purchases')
    .update({ payment_status, updated_at: new Date().toISOString() })
    .eq('id', purchase_id)

  if (errPaymentUpdate) return { error: errPaymentUpdate.message }

  revalidatePath('/admin/compras')
  revalidatePath(`/admin/compras/${purchase_id}`)
  return { success: true, mensaje: 'Recepción registrada. Stock actualizado.' }
}

export async function cancelarCompra(
  prevState: unknown,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const purchase_id = (formData.get('purchase_id') as string)?.trim()
  if (!purchase_id) return { error: 'Falta el ID de la compra.' }

  const supabase = createAdminClient()

  const { data: purchase, error: errPurchase } = await supabase
    .from('purchases')
    .select('id, raw_material_id, quantity, received_quantity, reception_status')
    .eq('id', purchase_id)
    .single()

  if (errPurchase || !purchase) {
    return { error: errPurchase?.message ?? 'Compra no encontrada.' }
  }

  const status = (purchase.reception_status as string) ?? 'pendiente'
  if (status === 'cancelado') {
    return { error: 'Esta compra ya está cancelada.' }
  }
  if (status === 'recibido_completo') {
    return {
      error:
        'No se puede cancelar una compra completamente recibida. Usa una nota de ajuste de inventario.',
    }
  }

  const received_qty = purchase.received_quantity != null ? Number(purchase.received_quantity) : 0
  const quantity_to_revert = received_qty > 0 ? received_qty : Number(purchase.quantity)
  const raw_material_id = purchase.raw_material_id as string

  if (raw_material_id && quantity_to_revert > 0) {
    const { data: rawMaterial } = await supabase
      .from('raw_materials')
      .select('current_stock')
      .eq('id', raw_material_id)
      .single()
    if (rawMaterial) {
      const current = Number(rawMaterial.current_stock) ?? 0
      const newStock = Math.max(0, current - quantity_to_revert)
      const { error: errStock } = await supabase
        .from('raw_materials')
        .update({ current_stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', raw_material_id)
      if (errStock) return { error: errStock.message }
    }
  }

  const { error: errUpdate } = await supabase
    .from('purchases')
    .update({
      reception_status: 'cancelado',
      payment_status: 'cancelado',
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchase_id)

  if (errUpdate) return { error: errUpdate.message }

  revalidatePath('/admin/compras')
  revalidatePath('/admin/compras/' + purchase_id)
  return { success: true }
}

export async function actualizarNotasRecepcion(
  prevState: unknown,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const purchase_id = (formData.get('purchase_id') as string)?.trim()
  const reception_notes = (formData.get('reception_notes') as string)?.trim() || null
  if (!purchase_id) return { error: 'Falta el ID de la compra.' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('purchases')
    .update({ reception_notes, updated_at: new Date().toISOString() })
    .eq('id', purchase_id)

  if (error) return { error: error.message }
  revalidatePath('/admin/compras/' + purchase_id)
  return { success: true }
}
