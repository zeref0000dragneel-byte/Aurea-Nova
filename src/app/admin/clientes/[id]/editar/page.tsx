import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FormClienteEditar } from './form-cliente-editar'

type Props = { params: Promise<{ id: string }> }

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (!customer) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
        Editar cliente
      </h1>
      <Card className="max-w-2xl border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Datos del cliente</h2>
        </CardHeader>
        <CardContent>
          <FormClienteEditar
            customer={{
              id: customer.id,
              business_name: customer.business_name,
              contact_name: customer.contact_name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              rfc: customer.rfc,
              credit_days: customer.credit_days,
              credit_limit: customer.credit_limit,
              notes: customer.notes,
              is_active: customer.is_active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
