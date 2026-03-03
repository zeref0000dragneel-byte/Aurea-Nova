import { createAdminClient } from '@/lib/supabase/admin'
import { UsuariosContent } from './usuarios-content'

export default async function AdminUsuariosPage() {
  const supabase = createAdminClient()

  const [profilesResult, customersResult, authResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, phone, is_active, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('customers')
      .select('id, business_name, email')
      .eq('is_active', true),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const profiles = profilesResult.data ?? []
  const customers = customersResult.data ?? []
  const authUsers = authResult.data?.users ?? []

  const emailById = new Map<string, string>()
  for (const u of authUsers) {
    if (u.email) emailById.set(u.id, u.email)
  }

  const emailToBusinessName = new Map<string, string>()
  for (const c of customers) {
    const email = (c as { email?: string }).email
    const business_name = (c as { business_name: string }).business_name
    if (email) emailToBusinessName.set(email.toLowerCase().trim(), business_name)
  }

  const empleados = profiles
    .filter((p) => (p as { role: string }).role === 'empleado')
    .map((p) => {
      const row = p as {
        id: string
        full_name: string | null
        phone: string | null
        is_active: boolean
        created_at: string
      }
      return {
        ...row,
        email: emailById.get(row.id) ?? '—',
      }
    })

  const clientesAcceso = profiles
    .filter((p) => (p as { role: string }).role === 'cliente')
    .map((p) => {
      const row = p as {
        id: string
        full_name: string | null
        is_active: boolean
        created_at: string
      }
      const email = emailById.get(row.id) ?? ''
      const business_name = email ? (emailToBusinessName.get(email.toLowerCase()) ?? '—') : '—'
      return {
        ...row,
        email: email || '—',
        business_name,
      }
    })

  const clientesParaSelect = customers.map((c) => ({
    id: (c as { id: string }).id,
    business_name: (c as { business_name: string }).business_name,
    email: ((c as { email?: string }).email ?? '').trim(),
  }))

  return (
    <UsuariosContent
      empleados={empleados}
      clientesAcceso={clientesAcceso}
      clientesParaSelect={clientesParaSelect}
    />
  )
}
