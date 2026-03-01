import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FormCategoriaEditar } from './form-categoria-editar'

type Props = { params: Promise<{ id: string }> }

export default async function EditarCategoriaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('product_categories')
    .select('*')
    .eq('id', id)
    .single()

  if (!category) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/configuracion"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
        Editar categoría
      </h1>
      <Card className="max-w-2xl border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Datos de la categoría</h2>
        </CardHeader>
        <CardContent>
          <FormCategoriaEditar
            category={{
              id: category.id,
              name: category.name,
              description: category.description,
              sort_order: category.sort_order,
              is_active: category.is_active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
