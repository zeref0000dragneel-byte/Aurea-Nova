'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export type CrearEmpleadoState = { success?: boolean; mensaje?: string; error?: string }
export type DarAccesoClienteState = { success?: boolean; mensaje?: string; error?: string }
export type ToggleUsuarioState = { success?: boolean; error?: string }

export async function crearEmpleado(
  _prevState: CrearEmpleadoState | null,
  formData: FormData
): Promise<CrearEmpleadoState> {
  const full_name = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string) ?? ''
  const phone = (formData.get('phone') as string)?.trim() || null

  if (!full_name || !email || !password) {
    return { error: 'Nombre completo, correo y contraseña son obligatorios.' }
  }
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  const supabase = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }
  if (!authData?.user) {
    return { error: 'No se pudo crear el usuario en Auth.' }
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    full_name,
    phone,
    role: 'empleado',
    is_active: true,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/admin/usuarios')
  return { success: true, mensaje: 'Empleado creado. Ya puede iniciar sesión.' }
}

export async function darAccesoCliente(
  _prevState: DarAccesoClienteState | null,
  formData: FormData
): Promise<DarAccesoClienteState> {
  const customer_id = (formData.get('customer_id') as string)?.trim()
  const full_name = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string) ?? ''

  if (!customer_id || !full_name || !email || !password) {
    return { error: 'Cliente, nombre, correo y contraseña son obligatorios.' }
  }
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  const supabase = createAdminClient()

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('email')
    .eq('id', customer_id)
    .single()

  if (customerError || !customer) {
    return { error: 'Cliente no encontrado.' }
  }
  const customerEmail = (customer.email as string)?.trim()
  if (!customerEmail || customerEmail.toLowerCase() !== email.toLowerCase()) {
    return { error: 'El email debe coincidir con el registrado para este cliente.' }
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }
  if (!authData?.user) {
    return { error: 'No se pudo crear el usuario en Auth.' }
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    full_name,
    role: 'cliente',
    is_active: true,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/admin/usuarios')
  return { success: true, mensaje: 'Acceso creado. El cliente ya puede iniciar sesión.' }
}

export async function toggleUsuarioActivo(
  _prevState: ToggleUsuarioState | null,
  formData: FormData
): Promise<ToggleUsuarioState> {
  const user_id = (formData.get('user_id') as string)?.trim()
  const is_activeStr = (formData.get('is_active') as string)?.trim()

  if (!user_id || !is_activeStr) {
    return { error: 'Faltan datos para actualizar.' }
  }

  const isActive = is_activeStr === 'true'
  const newIsActive = !isActive

  const supabase = createAdminClient()

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_active: newIsActive, updated_at: new Date().toISOString() })
    .eq('id', user_id)

  if (profileError) {
    return { error: profileError.message }
  }

  if (!newIsActive) {
    await supabase.auth.admin.updateUserById(user_id, { ban_duration: '87600h' })
  } else {
    await supabase.auth.admin.updateUserById(user_id, { ban_duration: 'none' })
  }

  revalidatePath('/admin/usuarios')
  return { success: true }
}
