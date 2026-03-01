'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function crearCliente(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const businessName = (formData.get('business_name') as string)?.trim()
  const contactName = (formData.get('contact_name') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null
  const rfc = (formData.get('rfc') as string)?.trim() || null
  const creditDaysStr = (formData.get('credit_days') as string)?.trim()
  const creditLimitStr = (formData.get('credit_limit') as string)?.trim()
  const notes = (formData.get('notes') as string)?.trim() || null
  const isActiveStr = formData.get('is_active') as string

  if (!businessName) {
    return { error: 'El nombre de empresa es obligatorio.' }
  }

  const creditDays = creditDaysStr !== '' ? Number(creditDaysStr) : 0
  if (Number.isNaN(creditDays) || creditDays < 0) {
    return { error: 'Días de crédito no válidos.' }
  }

  const creditLimit = creditLimitStr !== '' ? Number(creditLimitStr) : 0
  if (Number.isNaN(creditLimit) || creditLimit < 0) {
    return { error: 'Límite de crédito no válido.' }
  }

  const isActive = isActiveStr === 'activo'

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('customers').insert({
      business_name: businessName,
      contact_name: contactName,
      email,
      phone,
      address,
      rfc,
      credit_days: creditDays,
      credit_limit: creditLimit,
      notes,
      is_active: isActive,
    })

    if (error) {
      console.error('crearCliente:', error)
      return { error: error.message || 'Error al guardar el cliente.' }
    }
  } catch (e) {
    console.error('crearCliente:', e)
    return { error: 'Error inesperado al guardar el cliente.' }
  }

  redirect('/admin/clientes')
}

export async function actualizarCliente(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const id = (formData.get('id') as string)?.trim()
  if (!id) {
    return { error: 'Falta el ID del cliente.' }
  }

  const businessName = (formData.get('business_name') as string)?.trim()
  const contactName = (formData.get('contact_name') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null
  const rfc = (formData.get('rfc') as string)?.trim() || null
  const creditDaysStr = (formData.get('credit_days') as string)?.trim()
  const creditLimitStr = (formData.get('credit_limit') as string)?.trim()
  const notes = (formData.get('notes') as string)?.trim() || null
  const isActiveStr = formData.get('is_active') as string

  if (!businessName) {
    return { error: 'El nombre de empresa es obligatorio.' }
  }

  const creditDays = creditDaysStr !== '' ? Number(creditDaysStr) : 0
  if (Number.isNaN(creditDays) || creditDays < 0) {
    return { error: 'Días de crédito no válidos.' }
  }

  const creditLimit = creditLimitStr !== '' ? Number(creditLimitStr) : 0
  if (Number.isNaN(creditLimit) || creditLimit < 0) {
    return { error: 'Límite de crédito no válido.' }
  }

  const isActive = isActiveStr === 'activo'

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('customers')
      .update({
        business_name: businessName,
        contact_name: contactName,
        email,
        phone,
        address,
        rfc,
        credit_days: creditDays,
        credit_limit: creditLimit,
        notes,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('actualizarCliente:', error)
      return { error: error.message || 'Error al actualizar el cliente.' }
    }
  } catch (e) {
    console.error('actualizarCliente:', e)
    return { error: 'Error inesperado al actualizar el cliente.' }
  }

  redirect('/admin/clientes')
}

export async function eliminarCliente(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const id = (formData.get('id') as string)?.trim()
  if (!id) {
    return { error: 'Falta el ID del cliente.' }
  }

  try {
    const supabase = createAdminClient()

    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id)

    if (countError) {
      console.error('eliminarCliente count:', countError)
      return { error: 'Error al verificar pedidos asociados.' }
    }

    if (count != null && count > 0) {
      return {
        error: 'No se puede eliminar: este cliente tiene pedidos asociados.',
      }
    }

    const { error } = await supabase.from('customers').delete().eq('id', id)

    if (error) {
      console.error('eliminarCliente:', error)
      return { error: error.message || 'Error al eliminar el cliente.' }
    }
  } catch (e) {
    console.error('eliminarCliente:', e)
    return { error: 'Error inesperado al eliminar el cliente.' }
  }

  redirect('/admin/clientes')
}
