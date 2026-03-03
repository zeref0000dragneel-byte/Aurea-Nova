import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Factory, CheckCircle } from 'lucide-react'
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
import { cn } from '@/lib/utils'

type OrderStatus = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'

type ProductionOrderRow = {
  id: string
  product_id: string
  planned_quantity: number
  status: OrderStatus
  assigned_to: string | null
  created_at: string
  products: { name: string } | null
  assigned_profile: { full_name: string } | null
}

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pendiente: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  en_proceso: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  completada: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  cancelada: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

type FilterValue = 'todos' | 'pendientes' | 'en_proceso'

export default async function AdminProduccionPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const filter = (searchParams?.filter as FilterValue) ?? 'todos'

  const supabase = await createClient()

  let query = supabase
    .from('production_orders')
    .select(
      `
      *,
      products(name),
      assigned_profile:profiles!production_orders_assigned_to_fkey(full_name)
    `
    )
    .order('created_at', { ascending: false })

  if (filter === 'pendientes') {
    query = query.eq('status', 'pendiente')
  } else if (filter === 'en_proceso') {
    query = query.eq('status', 'en_proceso')
  }

  const { data: orders, error } = await query

  const orderList = (orders ?? []) as unknown as ProductionOrderRow[]
  const hasOrders = orderList.length > 0

  const filterLinks: { value: FilterValue; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendientes', label: 'Pendientes' },
    { value: 'en_proceso', label: 'En proceso' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Órdenes de Producción
          </h1>
          <p className="text-sm text-gray-500">
            Gestiona y completa órdenes de producción
          </p>
        </div>
        <Button
          asChild
          className="shrink-0 bg-amber-500 font-medium text-white hover:bg-amber-600"
        >
          <Link href="/admin/produccion/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Link>
        </Button>
      </div>

      {/* Filtro tipo tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50/80 p-1">
        {filterLinks.map(({ value, label }) => (
          <Link
            key={value}
            href={value === 'todos' ? '/admin/produccion' : `/admin/produccion?filter=${value}`}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              filter === value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Tabla o estado vacío */}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50/50 px-6 py-8 text-center text-sm text-red-700">
          Error al cargar órdenes: {error.message}
        </div>
      ) : hasOrders ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-transparent">
                <TableHead className="h-11 font-semibold text-gray-700">
                  Producto
                </TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">
                  Cantidad Planificada
                </TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">
                  Estado
                </TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">
                  Asignado a
                </TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">
                  Fecha creación
                </TableHead>
                <TableHead className="h-11 font-semibold text-gray-700 text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList.map((orden) => {
                const productName = orden.products?.name ?? '—'
                const assignedDisplay = orden.assigned_profile?.full_name ?? 'Sin asignar'
                const status = (orden.status ?? 'pendiente') as OrderStatus
                const createdDate = orden.created_at
                  ? new Date(orden.created_at).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'
                return (
                  <TableRow key={orden.id} className="border-gray-100">
                    <TableCell className="font-medium text-gray-900">
                      {productName}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {Number(orden.planned_quantity).toLocaleString('es-MX')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'border font-medium',
                          STATUS_BADGE_CLASS[status]
                        )}
                      >
                        {STATUS_LABEL[status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {assignedDisplay}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {createdDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                        asChild
                      >
                        <Link href={`/admin/produccion/${orden.id}`}>
                          <CheckCircle className="mr-1.5 h-4 w-4" />
                          Ver / Completar
                        </Link>
                      </Button>
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
            <Factory className="h-7 w-7 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            No hay órdenes de producción
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {filter !== 'todos'
              ? 'Prueba otro filtro o crea una nueva orden'
              : 'Crea la primera orden con el botón superior'}
          </p>
        </div>
      )}
    </div>
  )
}
