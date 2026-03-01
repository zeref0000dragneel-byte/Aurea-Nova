import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Warehouse, Pencil, Package } from 'lucide-react'
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
import { BotonEliminarMateriaPrima } from '@/components/admin/boton-eliminar-materia-prima'

export default async function AdminInventarioPage() {
  const supabase = await createClient()

  const { data: materials } = await supabase
    .from('raw_materials')
    .select('*')
    .order('name')

  const materialList = materials ?? []
  const hasMaterials = materialList.length > 0

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Inventario
          </h1>
          <p className="text-sm text-gray-500">
            Materias primas y stock
          </p>
        </div>
        <div className="mt-2 flex shrink-0 gap-2 sm:mt-0">
          <Button asChild variant="outline" className="border-gray-200 font-medium text-gray-700 hover:bg-gray-50">
            <Link href="/admin/inventario/lotes">
              <Package className="mr-2 h-4 w-4" />
              Ver Lotes
            </Link>
          </Button>
          <Button asChild className="bg-amber-500 font-medium text-white hover:bg-amber-600">
            <Link href="/admin/inventario/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nueva materia prima
            </Link>
          </Button>
        </div>
      </div>

      {hasMaterials ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-transparent">
                <TableHead className="h-11 font-semibold text-gray-700">Nombre</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Unidad</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Stock Actual</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Stock Mínimo</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Costo Unitario</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Proveedor</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Estado</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialList.map((m) => {
                const stockAlert = m.current_stock <= m.min_stock
                return (
                  <TableRow key={m.id} className="border-gray-100">
                    <TableCell className="font-medium text-gray-900">
                      {m.name}
                    </TableCell>
                    <TableCell className="uppercase text-gray-600">
                      {m.unit}
                    </TableCell>
                    <TableCell>
                      {stockAlert ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
                          {m.current_stock}
                        </Badge>
                      ) : (
                        <span className="text-gray-700">{m.current_stock}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {m.min_stock}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      ${Number(m.unit_cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {m.supplier ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={m.is_active ? 'default' : 'secondary'}
                        className={
                          m.is_active
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }
                      >
                        {m.is_active ? 'Activo' : 'Inactivo'}
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
                          <Link href={`/admin/inventario/${m.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <BotonEliminarMateriaPrima materialId={m.id} />
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
            <Warehouse className="h-7 w-7 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            No hay materias primas registradas
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Agrega la primera con el botón superior
          </p>
        </div>
      )}
    </div>
  )
}
