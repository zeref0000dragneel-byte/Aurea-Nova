import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener rol del perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
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
