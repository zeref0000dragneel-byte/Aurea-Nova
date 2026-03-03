import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ShoppingBag, Eye, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

type PurchaseRow = {
  id: string
  raw_material_id: string
  supplier: string
  quantity: number
  unit_cost: number
  total: number
  paid_amount: number
  payment_status: 'pendiente' | 'parcial' | 'pagado' | 'cancelado'
  purchase_date: string
  invoice_number: string | null
  reception_status: 'pendiente' | 'recibido_completo' | 'recibido_parcial' | 'cancelado' | null
  raw_materials: { name: string; unit: string } | null
}

type ReceptionFilter = 'todas' | 'pendientes' | 'recibidas' | 'canceladas'

const RECEPTION_BADGE: Record<string, { className: string; label: string }> = {
  pendiente: { className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100', label: '⏳ Pendiente de recibir' },
  recibido_completo: { className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100', label: '✓ Recibido completo' },
  recibido_parcial: { className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100', label: '⚠ Recibido parcial' },
  cancelado: { className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100', label: '✗ Cancelado' },
}

const PAYMENT_BADGE: Record<string, { variant: 'destructive' | 'secondary' | 'default'; className: string }> = {
  pendiente: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100' },
  parcial: { variant: 'secondary', className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100' },
  pagado: { variant: 'default', className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100' },
  cancelado: { variant: 'destructive', className: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100' },
}

const PAYMENT_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
}

export default async function AdminComprasPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  const supabase = createAdminClient()
  const statusFilter = (searchParams?.status as ReceptionFilter) ?? 'todas'

  const [
    { data: purchasesData },
  ] = await Promise.all([
    supabase
      .from('purchases')
      .select(`
        id,
        raw_material_id,
        supplier,
        quantity,
        unit_cost,
        total,
        paid_amount,
        payment_status,
        purchase_date,
        invoice_number,
        created_at,
        reception_status,
        raw_materials(name, unit)
      `)
      .order('created_at', { ascending: false }),
  ])

  let purchases = (purchasesData ?? []) as PurchaseRow[]

  if (statusFilter === 'pendientes') {
    purchases = purchases.filter((p) => (p.reception_status ?? 'pendiente') === 'pendiente')
  } else if (statusFilter === 'recibidas') {
    purchases = purchases.filter(
      (p) => p.reception_status === 'recibido_completo' || p.reception_status === 'recibido_parcial'
    )
  } else if (statusFilter === 'canceladas') {
    purchases = purchases.filter((p) => p.reception_status === 'cancelado')
  }

  const allPurchases = (purchasesData ?? []) as PurchaseRow[]
  const pendientesRecibirCount = allPurchases.filter(
    (p) => (p.reception_status ?? 'pendiente') === 'pendiente'
  ).length

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const comprasEsteMes = allPurchases.filter((p) => {
    const d = new Date(p.purchase_date)
    return d >= startOfMonth && d <= endOfMonth
  })
  const totalCompradoEsteMes = comprasEsteMes.reduce((s, p) => s + Number(p.total), 0)

  // Compras con deuda activa: solo pendiente o parcial (excluir pagado y cancelado)
  const comprasConDeudaActiva = allPurchases.filter(
    (p) => p.payment_status === 'pendiente' || p.payment_status === 'parcial'
  )
  const deudaTotal = comprasConDeudaActiva.reduce(
    (s, p) => s + (Number(p.total) - Number(p.paid_amount)),
    0
  )
  const deudaPorProveedor: Record<string, number> = {}
  comprasConDeudaActiva.forEach((p) => {
    const saldo = Number(p.total) - Number(p.paid_amount)
    deudaPorProveedor[p.supplier] = (deudaPorProveedor[p.supplier] ?? 0) + saldo
  })
  const proveedoresConDeuda = Object.entries(deudaPorProveedor).map(([supplier, amount]) => ({
    supplier,
    amount,
  }))

  const filterLinks: { value: ReceptionFilter; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'pendientes', label: 'Pendientes de recibir' },
    { value: 'recibidas', label: 'Recibidas' },
    { value: 'canceladas', label: 'Canceladas' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Compras a Proveedores
          </h1>
          <p className="text-sm text-gray-500">
            Registro de compras de materias primas
          </p>
        </div>
        <Button asChild className="mt-2 shrink-0 bg-amber-500 font-medium text-white hover:bg-amber-600 sm:mt-0">
          <Link href="/admin/compras/nuevo">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Nueva Compra
          </Link>
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Comprado este Mes
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              ${totalCompradoEsteMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className={cn('border-gray-200', deudaTotal > 0 && 'border-red-200')}>
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Deuda con Proveedores
            </p>
            <p
              className={cn(
                'mt-1 text-2xl font-bold',
                deudaTotal > 0 ? 'text-red-600' : 'text-gray-900'
              )}
            >
              ${deudaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Compras este Mes
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {comprasEsteMes.length}
            </p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'border-gray-200',
            pendientesRecibirCount > 0 && 'border-amber-200 bg-amber-50/30'
          )}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  pendientesRecibirCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
                )}
              >
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendientesRecibirCount}</p>
                <p className="text-xs font-medium text-gray-500">Pendientes de recibir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs filtro */}
      <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50/80 p-1">
        {filterLinks.map(({ value, label }) => (
          <Link
            key={value}
            href={value === 'todas' ? '/admin/compras' : `/admin/compras?status=${value}`}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              statusFilter === value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 hover:bg-transparent">
              <TableHead className="h-11 font-semibold text-gray-700">Fecha</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700">Materia Prima</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700">Proveedor</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700">Cantidad</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700">Recepción</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700">Costo Unit.</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700">Total</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700">Pagado</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700">Por pagar</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700">Estado pago</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700">Factura</TableHead>
              <TableHead className="h-11 font-semibold text-gray-700 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-gray-500">
                  No hay compras registradas.
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((p) => {
                const porPagar = Number(p.total) - Number(p.paid_amount)
                const statusConf = PAYMENT_BADGE[p.payment_status] ?? PAYMENT_BADGE.pendiente
                const receptionStatus = (p.reception_status ?? 'pendiente') as keyof typeof RECEPTION_BADGE
                const receptionConf = RECEPTION_BADGE[receptionStatus] ?? RECEPTION_BADGE.pendiente
                return (
                  <TableRow key={p.id} className="border-gray-100">
                    <TableCell className="text-gray-700">
                      {new Date(p.purchase_date).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {p.raw_materials?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-gray-700">{p.supplier}</TableCell>
                    <TableCell className="text-gray-700">
                      {Number(p.quantity).toLocaleString('es-MX')}{' '}
                      <span className="uppercase text-gray-500">{p.raw_materials?.unit ?? ''}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('border', receptionConf.className)}>
                        {receptionConf.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      ${Number(p.unit_cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      ${Number(p.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      ${Number(p.paid_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'font-medium',
                        porPagar > 0 && 'text-red-600'
                      )}
                    >
                      ${porPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConf.variant} className={cn('border', statusConf.className)}>
                        {PAYMENT_LABEL[p.payment_status] ?? p.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {p.invoice_number ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/compras/${p.id}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Deuda por Proveedor</h2>
          {proveedoresConDeuda.length === 0 ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              Sin deuda con proveedores
            </p>
          ) : (
            <ul className="space-y-2">
              {proveedoresConDeuda.map(({ supplier, amount }) => (
                <li
                  key={supplier}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-2"
                >
                  <span className="font-medium text-gray-900">{supplier}</span>
                  <span className="font-semibold text-red-600">
                    ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
