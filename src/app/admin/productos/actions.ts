'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

type UnitType = 'kg' | 'g' | 'l' | 'ml' | 'pza' | 'caja' | 'cubeta'

const UNITS: UnitType[] = ['kg', 'g', 'l', 'ml', 'pza', 'caja', 'cubeta']

function generateSku(): string {
  return `PROD-${Date.now()}`
}

export async function crearProducto(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  const nombre = (formData.get('nombre') as string)?.trim()
  const precioBase = formData.get('precio_base') as string
  const precioCosto = formData.get('precio_costo') as string
  const categoryId = (formData.get('category_id') as string)?.trim()
  let sku = (formData.get('sku') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const unit = (formData.get('unit') as string)?.trim() as UnitType
  const minStockStr = (formData.get('min_stock') as string)?.trim()
  const isActiveStr = formData.get('is_active') as string

  if (!nombre) {
    return { error: 'El nombre es obligatorio.' }
  }
  if (!precioBase || precioBase === '') {
    return { error: 'El precio base es obligatorio.' }
  }
  const basePrice = Number(precioBase)
  if (Number.isNaN(basePrice) || basePrice < 0) {
    return { error: 'Precio base no válido.' }
  }
  if (!precioCosto || precioCosto === '') {
    return { error: 'El precio de costo es obligatorio.' }
  }
  const costPrice = Number(precioCosto)
  if (Number.isNaN(costPrice) || costPrice < 0) {
    return { error: 'Precio de costo no válido.' }
  }
  if (!categoryId) {
    return { error: 'La categoría es obligatoria.' }
  }

  if (!sku) {
    sku = generateSku()
  }

  const minStock = minStockStr !== '' ? Number(minStockStr) : 0
  if (Number.isNaN(minStock) || minStock < 0) {
    return { error: 'Stock mínimo no válido.' }
  }

  const unitValid = UNITS.includes(unit)
  const finalUnit = unitValid ? unit : 'pza'

  const isActive = isActiveStr === 'activo'

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('products').insert({
      sku,
      name: nombre,
      description,
      category_id: categoryId,
      base_price: basePrice,
      cost_price: costPrice,
      unit: finalUnit,
      min_stock: minStock,
      is_active: isActive,
    })

    if (error) {
      console.error('crearProducto:', error)
      return { error: error.message || 'Error al guardar el producto.' }
    }
  } catch (e) {
    console.error('crearProducto:', e)
    return { error: 'Error inesperado al guardar el producto.' }
  }

  redirect('/admin/productos')
}

export async function actualizarProducto(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const id = (formData.get('id') as string)?.trim()
  if (!id) {
    return { error: 'Falta el ID del producto.' }
  }

  const nombre = (formData.get('nombre') as string)?.trim()
  const precioBase = formData.get('precio_base') as string
  const precioCosto = formData.get('precio_costo') as string
  const categoryId = (formData.get('category_id') as string)?.trim()
  let sku = (formData.get('sku') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const unit = (formData.get('unit') as string)?.trim() as UnitType
  const minStockStr = (formData.get('min_stock') as string)?.trim()
  const isActiveStr = formData.get('is_active') as string

  if (!nombre) {
    return { error: 'El nombre es obligatorio.' }
  }
  if (!precioBase || precioBase === '') {
    return { error: 'El precio base es obligatorio.' }
  }
  const basePrice = Number(precioBase)
  if (Number.isNaN(basePrice) || basePrice < 0) {
    return { error: 'Precio base no válido.' }
  }
  if (!precioCosto || precioCosto === '') {
    return { error: 'El precio de costo es obligatorio.' }
  }
  const costPrice = Number(precioCosto)
  if (Number.isNaN(costPrice) || costPrice < 0) {
    return { error: 'Precio de costo no válido.' }
  }
  if (!categoryId) {
    return { error: 'La categoría es obligatoria.' }
  }
  if (!sku) {
    sku = generateSku()
  }
  const minStock = minStockStr !== '' ? Number(minStockStr) : 0
  if (Number.isNaN(minStock) || minStock < 0) {
    return { error: 'Stock mínimo no válido.' }
  }
  const unitValid = UNITS.includes(unit)
  const finalUnit = unitValid ? unit : 'pza'
  const isActive = isActiveStr === 'activo'

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .update({
        sku,
        name: nombre,
        description,
        category_id: categoryId,
        base_price: basePrice,
        cost_price: costPrice,
        unit: finalUnit,
        min_stock: minStock,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('actualizarProducto:', error)
      return { error: error.message || 'Error al actualizar el producto.' }
    }
  } catch (e) {
    console.error('actualizarProducto:', e)
    return { error: 'Error inesperado al actualizar el producto.' }
  }

  redirect('/admin/productos')
}

export async function eliminarProducto(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const id = (formData.get('id') as string)?.trim()
  if (!id) {
    return { error: 'Falta el ID del producto.' }
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      console.error('eliminarProducto:', error)
      return { error: error.message || 'Error al eliminar el producto.' }
    }
  } catch (e) {
    console.error('eliminarProducto:', e)
    return { error: 'Error inesperado al eliminar el producto.' }
  }

  redirect('/admin/productos')
}
