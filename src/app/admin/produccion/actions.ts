'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegram } from '@/lib/telegram'

const STATUS_VALIDOS = ['pendiente', 'en_proceso', 'cancelada'] as const

export async function crearOrdenProduccion(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const product_id = (formData.get('product_id') as string)?.trim()
  const planned_quantity = parseFloat((formData.get('planned_quantity') as string) ?? '')
  const notes = (formData.get('notes') as string)?.trim()
  const assigned_to = (formData.get('assigned_to') as string)?.trim()

  if (!product_id || Number.isNaN(planned_quantity)) {
    return { error: 'Producto y cantidad son requeridos' }
  }

  const order_number = `OP-${Date.now()}`
  const supabase = createAdminClient()
  const { error } = await supabase.from('production_orders').insert({
    order_number,
    product_id,
    planned_quantity,
    status: 'pendiente',
    notes: notes || null,
    assigned_to: assigned_to || null,
  })

  if (error) {
    return { error: error.message }
  }
  redirect('/admin/produccion')
}

export async function actualizarEstadoOrden(
  prevState: unknown,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const orden_id = (formData.get('orden_id') as string)?.trim()
  const nuevo_status = (formData.get('nuevo_status') as string)?.trim()

  if (nuevo_status === 'completada') {
    return { error: 'Usa el formulario de completar orden' }
  }
  if (!orden_id || !nuevo_status || !STATUS_VALIDOS.includes(nuevo_status as (typeof STATUS_VALIDOS)[number])) {
    return { error: 'Estado no válido' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('production_orders')
    .update({ status: nuevo_status })
    .eq('id', orden_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/produccion')
  revalidatePath('/empleado/produccion')
  return { success: true }
}

export async function completarOrden(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const orden_id = (formData.get('orden_id') as string)?.trim()
  const actual_quantity = parseFloat((formData.get('actual_quantity') as string) ?? '')
  const waste_quantityStr = (formData.get('waste_quantity') as string)?.trim()
  const waste_quantity = parseFloat(waste_quantityStr ?? '') || 0
  const waste_notes = (formData.get('waste_notes') as string)?.trim()

  if (!orden_id || Number.isNaN(actual_quantity) || actual_quantity <= 0) {
    return { error: 'orden_id y actual_quantity son requeridos y deben ser mayor que 0' }
  }

  const supabase = createAdminClient()

  // Foto de merma: subir archivo si se envió
  let waste_photo_url = (formData.get('waste_photo_url') as string)?.trim() || null
  const file = formData.get('waste_photo') as File | null
  if (file && file.size > 0) {
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${orden_id}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('waste-photos').upload(path, file, { upsert: true })
      if (!error && data?.path) {
        const { data: urlData } = supabase.storage.from('waste-photos').getPublicUrl(data.path)
        waste_photo_url = urlData.publicUrl
      }
    } catch {
      // Si falla el bucket, se continúa sin foto
    }
  }

  // Paso A: SELECT product_id, order_number FROM production_orders WHERE id = orden_id
  const { data: orden, error: errOrden } = await supabase
    .from('production_orders')
    .select('product_id, order_number')
    .eq('id', orden_id)
    .single()

  if (errOrden || !orden) {
    return { error: errOrden?.message ?? 'Orden no encontrada' }
  }

  const product_id = orden.product_id as string

  // Paso B: consumos con JOIN a raw_materials para obtener nombre
  const { data: consumos, error: errConsumos } = await supabase
    .from('production_raw_material_usage')
    .select(`
      raw_material_id,
      planned_quantity,
      raw_materials ( name )
    `)
    .eq('production_order_id', orden_id)

  if (errConsumos) {
    return { error: errConsumos.message }
  }

  // Paso C: para cada consumo, verificar stock y descontar
  if (consumos?.length) {
    for (const c of consumos) {
      const { data: mp, error: errMp } = await supabase
        .from('raw_materials')
        .select('current_stock')
        .eq('id', c.raw_material_id)
        .single()

      if (errMp || !mp) {
        return { error: errMp?.message ?? 'Materia prima no encontrada' }
      }

      const current_stock = mp.current_stock ?? 0
      const planned_quantity = (c as { planned_quantity: number }).planned_quantity ?? 0
      if (current_stock - planned_quantity < 0) {
        const raw = (c as unknown as { raw_materials: { name: string } | null }).raw_materials
        const nombre_mp = (Array.isArray(raw) ? raw[0]?.name : raw?.name) ?? 'Materia prima'
        return { error: 'Stock insuficiente de: ' + nombre_mp }
      }

      const { error: errUpdate } = await supabase
        .from('raw_materials')
        .update({ current_stock: current_stock - planned_quantity })
        .eq('id', c.raw_material_id)

      if (errUpdate) {
        return { error: errUpdate.message }
      }
    }
  }

  // Paso D: INSERT inventory_lots y guardar id del lote
  const cantidadNeta = actual_quantity - waste_quantity
  const { data: nuevoLote, error: errLote } = await supabase
    .from('inventory_lots')
    .insert({
      product_id,
      lot_number: `LOTE-${Date.now()}`,
      production_date: new Date().toISOString(),
      initial_quantity: cantidadNeta,
      current_quantity: cantidadNeta,
      committed_quantity: 0,
      notes: `Orden de producción completada`,
    })
    .select('id')
    .single()

  if (errLote) {
    return { error: errLote.message }
  }

  const lot_id = nuevoLote?.id
  if (!lot_id) {
    return { error: 'No se pudo obtener el id del lote creado' }
  }

  // Paso E: INSERT inventory_movements
  const { error: errMov } = await supabase.from('inventory_movements').insert({
    lot_id: nuevoLote.id,
    product_id: product_id,
    movement_type: 'entrada',
    quantity: cantidadNeta,
    notes: 'Orden de producción completada',
  })

  if (errMov) {
    return { error: errMov.message }
  }

  // Paso F: UPDATE production_orders
  const { error: errUpdateOrden } = await supabase
    .from('production_orders')
    .update({
      status: 'completada',
      actual_quantity,
      waste_quantity,
      waste_notes: waste_notes || null,
      waste_photo_url: waste_photo_url || null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', orden_id)

  if (errUpdateOrden) {
    return { error: errUpdateOrden.message }
  }

  const order_number = (orden as { order_number?: string })?.order_number
  await sendTelegram(
    `🏭 <b>Producción Completada</b>\n` +
      `📋 Orden: ${order_number ?? 'N/A'}\n` +
      `📦 Lote creado en inventario\n` +
      `📅 ${new Date().toLocaleString('es-MX')}`
  )
  const redirectTo = (formData.get('redirect_to') as string)?.trim() || '/admin/produccion'
  redirect(redirectTo)
}

export async function agregarConsumoMP(
  prevState: unknown,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const production_order_id = (formData.get('production_order_id') as string)?.trim()
  const raw_material_id = (formData.get('raw_material_id') as string)?.trim()
  const planned_quantity = parseFloat((formData.get('planned_quantity') as string) ?? '')

  if (!production_order_id || !raw_material_id || Number.isNaN(planned_quantity)) {
    return { error: 'production_order_id, raw_material_id y planned_quantity son requeridos' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('production_raw_material_usage').insert({
    production_order_id,
    raw_material_id,
    planned_quantity,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/produccion/' + production_order_id)
  revalidatePath('/empleado/produccion/' + production_order_id)
  return { success: true }
}

export async function eliminarConsumoMP(
  prevState: unknown,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const usage_id = (formData.get('usage_id') as string)?.trim()
  const production_order_id = (formData.get('production_order_id') as string)?.trim()

  if (!usage_id || !production_order_id) {
    return { error: 'usage_id y production_order_id son requeridos' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('production_raw_material_usage')
    .delete()
    .eq('id', usage_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/produccion/' + production_order_id)
  return { success: true }
}
