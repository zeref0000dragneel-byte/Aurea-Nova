import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FormClienteNuevo } from './form-cliente-nuevo'

export default function NuevoClientePage() {
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
        Nuevo cliente
      </h1>
      <Card className="max-w-2xl border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Datos del cliente</h2>
        </CardHeader>
        <CardContent>
          <FormClienteNuevo />
        </CardContent>
      </Card>
    </div>
  )
}
