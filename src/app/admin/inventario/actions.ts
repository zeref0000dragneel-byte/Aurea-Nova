'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

type UnitType = 'kg' | 'g' | 'l' | 'ml' | 'pza' | 'caja' | 'cubeta'

const UNITS: UnitType[] = ['kg', 'g', 'l', 'ml', 'pza', 'caja', 'cubeta']

function parseForm(
  formData: FormData
): {
  name: string
  unit: UnitType
  current_stock: number
  min_stock: number
  unit_cost: number
  supplier: string | null
  notes: string | null
  is_active: boolean
} {
  const name = (formData.get('name') as string)?.trim()
  const unit = (formData.get('unit') as string)?.trim() as UnitType
  const currentStockStr = (formData.get('current_stock') as string)?.trim()
  const minStockStr = (formData.get('min_stock') as string)?.trim()
  const unitCostStr = (formData.get('unit_cost') as string)?.trim()
  const supplier = (formData.get('supplier') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null
  const isActiveStr = formData.get('is_active') as string

  const currentStock = currentStockStr !== '' ? Number(currentStockStr) : 0
  const minStock = minStockStr !== '' ? Number(minStockStr) : 0
  const unitCost = unitCostStr !== '' ? Number(unitCostStr) : 0
  const validUnit = UNITS.includes(unit) ? unit : 'pza'
  const isActive = isActiveStr === 'activo'

  return {
    name,
    unit: validUnit,
    current_stock: currentStock,
    min_stock: minStock,
    unit_cost: unitCost,
    supplier,
    notes,
    is_active: isActive,
  }
}

function validate(
  data: ReturnType<typeof parseForm>
): { error?: string } {
  if (!data.name) {
    return { error: 'El nombre es obligatorio.' }
  }
  if (Number.isNaN(data.current_stock) || data.current_stock < 0) {
    return { error: 'Stock actual no válido.' }
  }
  if (Number.isNaN(data.min_stock) || data.min_stock < 0) {
    return { error: 'Stock mínimo no válido.' }
  }
  if (Number.isNaN(data.unit_cost) || data.unit_cost < 0) {
    return { error: 'Costo unitario no válido.' }
  }
  return {}
}

export async function crearMateriaPrima(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const data = parseForm(formData)
  const validation = validate(data)
  if (validation.error) return validation

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('raw_materials').insert({
      name: data.name,
      unit: data.unit,
      current_stock: data.current_stock,
      min_stock: data.min_stock,
      unit_cost: data.unit_cost,
      supplier: data.supplier,
      notes: data.notes,
      is_active: data.is_active,
    })

    if (error) {
      console.error('crearMateriaPrima:', error)
      return { error: error.message || 'Error al guardar la materia prima.' }
    }
  } catch (e) {
    console.error('crearMateriaPrima:', e)
    return { error: 'Error inesperado al guardar la materia prima.' }
  }

  redirect('/admin/inventario')
}

export async function actualizarMateriaPrima(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const id = (formData.get('id') as string)?.trim()
  if (!id) {
    return { error: 'Falta el ID de la materia prima.' }
  }

  const data = parseForm(formData)
  const validation = validate(data)
  if (validation.error) return validation

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('raw_materials')
      .update({
        name: data.name,
        unit: data.unit,
        current_stock: data.current_stock,
        min_stock: data.min_stock,
        unit_cost: data.unit_cost,
        supplier: data.supplier,
        notes: data.notes,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('actualizarMateriaPrima:', error)
      return { error: error.message || 'Error al actualizar la materia prima.' }
    }
  } catch (e) {
    console.error('actualizarMateriaPrima:', e)
    return { error: 'Error inesperado al actualizar la materia prima.' }
  }

  redirect('/admin/inventario')
}

export async function eliminarMateriaPrima(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const id = (formData.get('id') as string)?.trim()
  if (!id) {
    return { error: 'Falta el ID de la materia prima.' }
  }

  try {
    const supabase = createAdminClient()

    const { count, error: countError } = await supabase
      .from('production_raw_material_usage')
      .select('*', { count: 'exact', head: true })
      .eq('raw_material_id', id)

    if (countError) {
      console.error('eliminarMateriaPrima count:', countError)
      return { error: 'Error al verificar uso en órdenes de producción.' }
    }

    if (count != null && count > 0) {
      return {
        error:
          'No se puede eliminar: esta materia prima está referenciada en órdenes de producción.',
      }
    }

    const { error } = await supabase.from('raw_materials').delete().eq('id', id)

    if (error) {
      console.error('eliminarMateriaPrima:', error)
      return { error: error.message || 'Error al eliminar la materia prima.' }
    }
  } catch (e) {
    console.error('eliminarMateriaPrima:', e)
    return { error: 'Error inesperado al eliminar la materia prima.' }
  }

  redirect('/admin/inventario')
}
