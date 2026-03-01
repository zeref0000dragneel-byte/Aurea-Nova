'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function crearCategoria(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const nombre = (formData.get('nombre') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null

  if (!nombre) {
    return { error: 'El nombre es obligatorio.' }
  }

  try {
    const supabase = createAdminClient()

    const { data: maxOrder } = await supabase
      .from('product_categories')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const sortOrder = (maxOrder?.sort_order ?? -1) + 1

    const { error } = await supabase.from('product_categories').insert({
      name: nombre,
      description: descripcion,
      sort_order: sortOrder,
      is_active: true,
    })

    if (error) {
      console.error('crearCategoria:', error)
      return { error: error.message || 'Error al crear la categoría.' }
    }
  } catch (e) {
    console.error('crearCategoria:', e)
    return { error: 'Error inesperado al crear la categoría.' }
  }

  revalidatePath('/admin/configuracion')
  return {}
}

export async function eliminarCategoria(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const id = (formData.get('id') as string)?.trim()
  if (!id) {
    return { error: 'Falta el ID de la categoría.' }
  }

  try {
    const supabase = createAdminClient()

    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (countError) {
      console.error('eliminarCategoria count:', countError)
      return { error: 'Error al verificar productos asociados.' }
    }

    if (count != null && count > 0) {
      return {
        error: 'No se puede eliminar: esta categoría tiene productos asociados.',
      }
    }

    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('eliminarCategoria:', error)
      return { error: error.message || 'Error al eliminar la categoría.' }
    }
  } catch (e) {
    console.error('eliminarCategoria:', e)
    return { error: 'Error inesperado al eliminar la categoría.' }
  }

  revalidatePath('/admin/configuracion')
  return {}
}

export async function actualizarCategoria(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const id = (formData.get('id') as string)?.trim()
  const nombre = (formData.get('nombre') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const sortOrderStr = (formData.get('sort_order') as string)?.trim()
  const estado = formData.get('estado') as string

  if (!id) {
    return { error: 'Falta el ID de la categoría.' }
  }
  if (!nombre) {
    return { error: 'El nombre es obligatorio.' }
  }

  const sortOrder = sortOrderStr !== '' ? Number(sortOrderStr) : 0
  if (Number.isNaN(sortOrder) || sortOrder < 0) {
    return { error: 'El orden debe ser un número mayor o igual a 0.' }
  }

  const isActive = estado === 'activo'

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('product_categories')
      .update({
        name: nombre,
        description: descripcion,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .eq('id', id)

    if (error) {
      console.error('actualizarCategoria:', error)
      return { error: error.message || 'Error al actualizar la categoría.' }
    }
  } catch (e) {
    console.error('actualizarCategoria:', e)
    return { error: 'Error inesperado al actualizar la categoría.' }
  }

  redirect('/admin/configuracion')
}
