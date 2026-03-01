'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Ingresa tu correo y contraseña' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Correo o contraseña incorrectos' }
  }

  // Obtener rol para redirigir
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Error al obtener la sesión' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Perfil no encontrado. Contacta al administrador.' }
  }

  switch (profile.role) {
    case 'admin':
      redirect('/admin/dashboard')
    case 'empleado':
      redirect('/empleado/pedidos')
    case 'cliente':
      redirect('/cliente/dashboard')
    default:
      redirect('/login')
  }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
