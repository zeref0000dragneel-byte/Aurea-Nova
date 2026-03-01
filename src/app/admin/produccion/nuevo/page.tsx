import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FormNuevaOrden } from './form-nueva-orden'

export default async function NuevaOrdenProduccionPage() {
  const supabase = await createClient()

  const [
    { data: products },
    { data: empleados },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('id, name')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'empleado')
      .order('full_name'),
  ])

  const productos = (products ?? []).map((p) => ({
    id: p.id,
    name: (p as { name: string }).name,
  }))
  const empleadosList = (empleados ?? []).map((e) => ({
    id: (e as { id: string }).id,
    full_name: (e as { full_name: string }).full_name,
  }))

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/produccion"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
        Nueva orden de producción
      </h1>
      <Card className="max-w-2xl border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Datos de la orden</h2>
        </CardHeader>
        <CardContent>
          <FormNuevaOrden productos={productos} empleados={empleadosList} />
        </CardContent>
      </Card>
    </div>
  )
}
