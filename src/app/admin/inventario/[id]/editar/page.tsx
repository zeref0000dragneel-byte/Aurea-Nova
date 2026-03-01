import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FormMateriaPrimaEditar } from './form-materia-prima-editar'

type Props = { params: Promise<{ id: string }> }

export default async function EditarMateriaPrimaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: material } = await supabase
    .from('raw_materials')
    .select('*')
    .eq('id', id)
    .single()

  if (!material) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/inventario"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
        Editar materia prima
      </h1>
      <Card className="max-w-2xl border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Datos de la materia prima</h2>
        </CardHeader>
        <CardContent>
          <FormMateriaPrimaEditar
            material={{
              id: material.id,
              name: material.name,
              unit: material.unit,
              current_stock: material.current_stock,
              min_stock: material.min_stock,
              unit_cost: material.unit_cost,
              supplier: material.supplier,
              notes: material.notes,
              is_active: material.is_active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
