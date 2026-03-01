import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormAgregarConsumoMP } from '@/app/admin/produccion/[id]/form-agregar-consumo-mp'
import { FormCompletarOrden } from '@/app/admin/produccion/[id]/form-completar-orden'
import { BotonPonerEnProceso } from './boton-poner-en-proceso'
import { cn } from '@/lib/utils'

type OrderStatus = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'

type OrderData = {
  id: string
  product_id: string
  planned_quantity: number
  status: OrderStatus
  assigned_to: string | null
  created_at: string
  notes: string | null
  actual_quantity: number | null
  waste_quantity: number | null
  waste_notes: string | null
  waste_photo_url: string | null
  completed_at: string | null
  products: { name: string } | null
  profiles: { full_name: string } | null
}

type ConsumoRow = {
  id: string
  raw_material_id: string
  planned_quantity: number
  raw_materials: { name: string; unit: string } | null
}

type RawMaterialOption = { id: string; name: string; unit: string }

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

export default async function EmpleadoOrdenProduccionDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [
    { data: order, error: orderError },
    { data: consumos },
    { data: rawMaterials },
  ] = await Promise.all([
    supabase
      .from('production_orders')
      .select(
        `
        id,
        product_id,
        planned_quantity,
        status,
        assigned_to,
        created_at,
        notes,
        actual_quantity,
        waste_quantity,
        waste_notes,
        waste_photo_url,
        completed_at,
        products ( name ),
        profiles ( full_name )
      `
      )
      .eq('id', id)
      .single(),
    supabase
      .from('production_raw_material_usage')
      .select(
        `
        id,
        raw_material_id,
        planned_quantity,
        raw_materials ( name, unit )
      `
      )
      .eq('production_order_id', id)
      .order('raw_material_id'),
    supabase
      .from('raw_materials')
      .select('id, name, unit')
      .eq('is_active', true)
      .order('name'),
  ])

  if (orderError || !order) {
    notFound()
  }

  const orden = order as unknown as OrderData
  if (orden.assigned_to !== user.id) {
    notFound()
  }

  const consumosList = (consumos ?? []) as unknown as ConsumoRow[]
  const materiasPrimas = (rawMaterials ?? []).map((r) => ({
    id: (r as { id: string }).id,
    name: (r as { name: string }).name,
    unit: (r as { unit: string }).unit,
  })) as RawMaterialOption[]

  const productName = orden.products?.name ?? '—'
  const assignedName = orden.profiles?.full_name ?? '—'
  const status = orden.status ?? 'pendiente'
  const createdDate = orden.created_at
    ? new Date(orden.created_at).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'
  const canComplete = status === 'pendiente' || status === 'en_proceso'
  const isFinished = status === 'completada' || status === 'cancelada'

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/empleado/produccion"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis órdenes
        </Link>
      </div>

      {/* Sección 1 — Cabecera de la orden */}
      <Card className="mb-8 border-gray-200">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Orden de producción
            </h1>
            {status === 'pendiente' && <BotonPonerEnProceso ordenId={id} />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Producto
              </p>
              <p className="mt-0.5 font-medium text-gray-900">{productName}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Estado
              </p>
              <div className="mt-0.5">
                <Badge
                  variant="outline"
                  className={cn('border font-medium', STATUS_BADGE_CLASS[status])}
                >
                  {STATUS_LABEL[status]}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Cantidad planificada
              </p>
              <p className="mt-0.5 font-medium text-gray-900">
                {Number(orden.planned_quantity).toLocaleString('es-MX')}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Asignado a
              </p>
              <p className="mt-0.5 text-gray-900">{assignedName}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Fecha creación
              </p>
              <p className="mt-0.5 text-gray-900">{createdDate}</p>
            </div>
          </div>
          {orden.notes && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Notas
              </p>
              <p className="mt-0.5 text-gray-700 whitespace-pre-wrap">{orden.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección 2 — Materias primas a consumir (sin botón eliminar) */}
      <Card className="mb-8 border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Materias primas a consumir
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {consumosList.length > 0 ? (
            <div className="rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-700">Nombre</TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Cantidad a usar
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">Unidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumosList.map((c) => (
                    <TableRow key={c.id} className="border-gray-100">
                      <TableCell className="font-medium text-gray-900">
                        {c.raw_materials?.name ?? '—'}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {Number(c.planned_quantity).toLocaleString('es-MX')}
                      </TableCell>
                      <TableCell className="text-gray-600 uppercase">
                        {c.raw_materials?.unit ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay materias primas registradas para esta orden.
            </p>
          )}
          <FormAgregarConsumoMP
            produccionOrdenId={id}
            materialesPrimas={materiasPrimas}
          />
        </CardContent>
      </Card>

      {/* Sección 3 — Completar orden o resumen */}
      {canComplete && (
        <Card className="mb-8 border-gray-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Completar orden</h2>
          </CardHeader>
          <CardContent>
            <FormCompletarOrden
              ordenId={id}
              hasConsumos={consumosList.length > 0}
            />
          </CardContent>
        </Card>
      )}

      {isFinished && (
        <Card className="mb-8 border-gray-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'completada' && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Cantidad real producida
                    </p>
                    <p className="mt-0.5 font-medium text-gray-900">
                      {orden.actual_quantity != null
                        ? Number(orden.actual_quantity).toLocaleString('es-MX')
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Merma
                    </p>
                    <p className="mt-0.5 font-medium text-gray-900">
                      {orden.waste_quantity != null
                        ? Number(orden.waste_quantity).toLocaleString('es-MX')
                        : '0'}
                    </p>
                  </div>
                </div>
                {orden.waste_notes && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Notas de merma
                    </p>
                    <p className="mt-0.5 text-gray-700 whitespace-pre-wrap">
                      {orden.waste_notes}
                    </p>
                  </div>
                )}
                {orden.waste_photo_url && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                      Foto de merma
                    </p>
                    <a
                      href={orden.waste_photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-lg border border-gray-200 overflow-hidden max-w-xs"
                    >
                      <img
                        src={orden.waste_photo_url}
                        alt="Foto de merma"
                        className="h-auto w-full object-cover"
                      />
                    </a>
                  </div>
                )}
                {orden.completed_at && (
                  <p className="text-sm text-gray-500">
                    Completada el{' '}
                    {new Date(orden.completed_at).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </>
            )}
            {status === 'cancelada' && (
              <p className="text-sm text-gray-600">Esta orden fue cancelada.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
