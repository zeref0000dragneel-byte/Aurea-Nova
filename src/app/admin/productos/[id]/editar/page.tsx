import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FormProductoEditar } from './form-producto-editar'
import { actualizarProducto } from '../../actions'

type Props = { params: Promise<{ id: string }> }

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: product },
    { data: categories },
  ] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase
      .from('product_categories')
      .select('id, name')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
        Editar Producto
      </h1>
      <Card className="max-w-2xl border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Datos del producto</h2>
        </CardHeader>
        <CardContent>
          <FormProductoEditar
            product={product}
            categories={categories ?? []}
            action={actualizarProducto}
          />
        </CardContent>
      </Card>
    </div>
  )
}
