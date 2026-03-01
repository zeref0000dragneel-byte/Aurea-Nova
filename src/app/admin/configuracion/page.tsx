import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Pencil, FolderTree, MessageCircle } from 'lucide-react'
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
import { BotonEliminarCategoria } from '@/components/admin/boton-eliminar-categoria'
import { FormCrearCategoriaInline } from './form-crear-categoria-inline'

export default async function AdminConfiguracionPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('product_categories')
    .select('*')
    .order('sort_order')

  const categoryList = categories ?? []
  const hasCategories = categoryList.length > 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Configuración
          </h1>
          <p className="text-sm text-gray-500">
            Administración del sistema
          </p>
        </div>
      </div>

      {/* Enlaces de configuración */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="border-gray-200 font-medium text-gray-700 hover:bg-gray-50">
            <Link href="/admin/configuracion/telegram">
              <MessageCircle className="mr-2 h-4 w-4" />
              Telegram
            </Link>
          </Button>
        </div>
      </section>

      {/* Categorías de Productos */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Categorías de Productos
          </h2>
          <Button
            asChild
            className="shrink-0 bg-amber-500 font-medium text-white hover:bg-amber-600"
          >
            <Link href="#agregar-categoria">
              <Plus className="mr-2 h-4 w-4" />
              Nueva categoría
            </Link>
          </Button>
        </div>

        {hasCategories ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="h-11 font-semibold text-gray-700">
                    Orden
                  </TableHead>
                  <TableHead className="h-11 font-semibold text-gray-700">
                    Nombre
                  </TableHead>
                  <TableHead className="h-11 font-semibold text-gray-700">
                    Descripción
                  </TableHead>
                  <TableHead className="h-11 font-semibold text-gray-700">
                    Estado
                  </TableHead>
                  <TableHead className="h-11 font-semibold text-gray-700 text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryList.map((cat) => (
                  <TableRow key={cat.id} className="border-gray-100">
                    <TableCell className="font-medium text-gray-700">
                      {cat.sort_order}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {cat.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-600">
                      {cat.description ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={cat.is_active ? 'default' : 'secondary'}
                        className={
                          cat.is_active
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }
                      >
                        {cat.is_active ? 'Activo' : 'Inactivo'}
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
                          <Link href={`/admin/configuracion/categorias/${cat.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <BotonEliminarCategoria categoryId={cat.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <FolderTree className="h-7 w-7 text-gray-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-600">
              No hay categorías registradas
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Agrega la primera categoría con el formulario de abajo
            </p>
          </div>
        )}

        {/* Formulario inline para crear categoría */}
        <div id="agregar-categoria" className="pt-2">
          <FormCrearCategoriaInline />
        </div>
      </section>
    </div>
  )
}
