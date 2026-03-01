import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Package, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BotonEliminarProducto } from '@/components/admin/boton-eliminar-producto'

export default async function AdminProductosPage() {
  const supabase = await createClient()

  const [
    ,
    { data: products },
  ] = await Promise.all([
    supabase
      .from('product_categories')
      .select('*')
      .order('sort_order'),
    supabase
      .from('products')
      .select('*, product_categories(name)')
      .order('created_at', { ascending: false }),
  ])

  const productList = products ?? []
  const hasProducts = productList.length > 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Productos
          </h1>
          <p className="text-sm text-gray-500">
            Gestión del catálogo
          </p>
        </div>
        <Button
          asChild
          className="mt-2 shrink-0 bg-amber-500 font-medium text-white hover:bg-amber-600 sm:mt-0"
        >
          <Link href="/admin/productos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {/* Table or empty state */}
      {hasProducts ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-transparent">
                <TableHead className="h-11 font-semibold text-gray-700">SKU</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Nombre</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Categoría</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Precio Base</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Unidad</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Stock Mínimo</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Estado</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productList.map((row) => {
                const product = row as {
                  id: string
                  sku: string | null
                  name: string
                  base_price: number
                  unit: string
                  min_stock: number
                  is_active: boolean
                  product_categories: { name: string } | null
                }
                const categoryName = product.product_categories?.name ?? '—'
                return (
                  <TableRow key={product.id} className="border-gray-100">
                    <TableCell className="font-mono text-gray-600">
                      {product.sku ?? '—'}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {categoryName}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      ${Number(product.base_price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-gray-600 uppercase">
                      {product.unit}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {product.min_stock}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.is_active ? 'default' : 'secondary'}
                        className={
                          product.is_active
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }
                      >
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                          asChild
                        >
                          <Link href={`/admin/productos/${product.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <BotonEliminarProducto productId={product.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Package className="h-7 w-7 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            No hay productos registrados
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Agrega el primer producto con el botón superior
          </p>
        </div>
      )}
    </div>
  )
}
