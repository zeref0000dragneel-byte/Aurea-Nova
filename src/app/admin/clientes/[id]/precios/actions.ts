'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function agregarPrecioCliente(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const customerId = (formData.get('customer_id') as string)?.trim()
  const productId = (formData.get('product_id') as string)?.trim()
  const fixedPriceStr = (formData.get('fixed_price') as string)?.trim()
  const discountPctStr = (formData.get('discount_pct') as string)?.trim()
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!customerId || !productId) {
    return { error: 'Falta el cliente o el producto.' }
  }

  const hasFixed = fixedPriceStr !== '' && fixedPriceStr != null
  const hasDiscount = discountPctStr !== '' && discountPctStr != null
  const fixedPrice = hasFixed ? Number(fixedPriceStr) : null
  const discountPct = hasDiscount ? Number(discountPctStr) : null

  if (hasFixed && hasDiscount) {
    return { error: 'Elige solo precio fijo O descuento, no ambos.' }
  }
  if (!hasFixed && !hasDiscount) {
    return { error: 'Indica un precio fijo o un descuento %.' }
  }
  if (hasFixed && (Number.isNaN(fixedPrice) || (fixedPrice ?? 0) <= 0)) {
    return { error: 'El precio fijo debe ser mayor que 0.' }
  }
  if (hasDiscount && (Number.isNaN(discountPct) || (discountPct ?? 0) <= 0 || (discountPct ?? 0) > 100)) {
    return { error: 'El descuento debe estar entre 0 y 100.' }
  }

  try {
    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('customer_prices')
      .select('id')
      .eq('customer_id', customerId)
      .eq('product_id', productId)
      .eq('is_active', true)
      .maybeSingle()

    if (existing) {
      return {
        error: 'Este producto ya tiene un precio activo. Desactívalo primero.',
      }
    }

    const { error } = await supabase.from('customer_prices').insert({
      customer_id: customerId,
      product_id: productId,
      fixed_price: hasFixed ? fixedPrice! : null,
      discount_pct: hasDiscount ? discountPct! : null,
      notes,
      is_active: true,
    })

    if (error) {
      console.error('agregarPrecioCliente:', error)
      return { error: error.message || 'Error al agregar el precio.' }
    }

    revalidatePath(`/admin/clientes/${customerId}/precios`)
    return { success: true }
  } catch (e) {
    console.error('agregarPrecioCliente:', e)
    return { error: 'Error inesperado al agregar el precio.' }
  }
}

export async function desactivarPrecioCliente(
  _prevState: { success?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const precioId = (formData.get('precio_id') as string)?.trim()
  const customerId = (formData.get('customer_id') as string)?.trim()

  if (!precioId || !customerId) {
    return { error: 'Faltan datos para desactivar el precio.' }
  }

  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('customer_prices')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', precioId)

    if (error) {
      console.error('desactivarPrecioCliente:', error)
      return { error: error.message || 'Error al desactivar el precio.' }
    }

    revalidatePath(`/admin/clientes/${customerId}/precios`)
    return { success: true }
  } catch (e) {
    console.error('desactivarPrecioCliente:', e)
    return { error: 'Error inesperado al desactivar el precio.' }
  }
}
