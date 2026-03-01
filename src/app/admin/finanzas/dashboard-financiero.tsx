'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const formatMoneda = (n: number) =>
  `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const statusLabel: Record<string, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  borrador: 'secondary',
  cancelado: 'destructive',
  confirmado: 'default',
  en_preparacion: 'default',
  listo: 'default',
  entregado: 'default',
}

const paymentLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagado: 'Pagado',
}

const paymentVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pendiente: 'destructive',
  parcial: 'secondary',
  pagado: 'default',
}

export type DeudaCliente = { business_name: string; deuda: number }
export type ProductoVendido = {
  product_id: string
  name: string
  unit: string
  quantity: number
  subtotal: number
}
export type PedidoReciente = {
  order_number: string
  status: string
  payment_status: string
  total: number
  paid_amount: number
  created_at: string
  customers: { business_name: string } | null
}

type Props = {
  ventasMesActual: number
  ventasMesAnterior: number
  pedidosMesActual: number
  ticketPromedio: number
  totalCobrado: number
  deudaTotal: number
  pedidosPendientesPago: number
  deudaPorCliente: DeudaCliente[]
  productosMasVendidos: ProductoVendido[]
  pedidosRecientes: PedidoReciente[]
}

export function DashboardFinanciero({
  ventasMesActual,
  ventasMesAnterior,
  pedidosMesActual,
  ticketPromedio,
  totalCobrado,
  deudaTotal,
  pedidosPendientesPago,
  deudaPorCliente,
  productosMasVendidos,
  pedidosRecientes,
}: Props) {
  const now = new Date()
  const mesAnioLabel = `${MESES_ES[now.getMonth()]} ${now.getFullYear()}`

  const variacionVentas =
    ventasMesAnterior > 0
      ? ((ventasMesActual - ventasMesAnterior) / ventasMesAnterior) * 100
      : null
  const porcentajeCobrado =
    ventasMesActual > 0 ? (totalCobrado / ventasMesActual) * 100 : 0
  const maxQuantity =
    productosMasVendidos.length > 0
      ? Math.max(...productosMasVendidos.map((p) => p.quantity))
      : 1

  return (
    <div className="p-8 space-y-8">
      {/* Sección 1 — Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Dashboard Financiero
          </h1>
          <p className="text-sm text-gray-500">{mesAnioLabel}</p>
        </div>
        <Badge className="bg-emerald-500/90 text-white border-0 hover:bg-emerald-500">
          En tiempo real
        </Badge>
      </div>

      {/* Sección 2 — Cards métricas principales */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-gray-900">
              {formatMoneda(ventasMesActual)}
            </p>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Ventas del Mes
            </p>
            <p className="text-xs mt-0.5">
              {variacionVentas === null ? (
                <span className="text-gray-500">Primer registro</span>
              ) : variacionVentas > 0 ? (
                <span className="text-emerald-600">
                  ↑ {variacionVentas.toFixed(1)}% vs mes anterior
                </span>
              ) : variacionVentas < 0 ? (
                <span className="text-red-600">
                  ↓ {Math.abs(variacionVentas).toFixed(1)}% vs mes anterior
                </span>
              ) : (
                <span className="text-gray-500">Sin variación</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-gray-900">
              {formatMoneda(totalCobrado)}
            </p>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Cobrado este Mes
            </p>
            <p className="text-xs mt-0.5 text-gray-600">
              De {formatMoneda(ventasMesActual)} en ventas
              {ventasMesActual > 0 && (
                <> ({porcentajeCobrado.toFixed(0)}% cobrado)</>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p
              className={cn(
                'text-2xl font-bold',
                deudaTotal > 0 ? 'text-red-600' : 'text-emerald-600'
              )}
            >
              {formatMoneda(deudaTotal)}
            </p>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Deuda Total
            </p>
            <p className="text-xs mt-0.5 text-gray-600">
              {pedidosPendientesPago} pedidos sin cobrar
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-gray-900">
              {formatMoneda(ticketPromedio)}
            </p>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Ticket Promedio
            </p>
            <p className="text-xs mt-0.5 text-gray-600">
              {pedidosMesActual} pedidos este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección 3 — Dos columnas */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Últimos Pedidos</CardTitle>
              <Link
                href="/admin/pedidos"
                className="text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                Ver todos
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-700">
                      Pedido
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Cliente
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Pago
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosRecientes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No hay pedidos recientes
                      </TableCell>
                    </TableRow>
                  ) : (
                    pedidosRecientes.map((p) => (
                      <TableRow key={p.order_number} className="border-gray-100">
                        <TableCell className="font-mono text-xs">
                          {p.order_number}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {(p.customers as { business_name: string } | null)?.business_name ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[p.status] ?? 'default'}>
                            {statusLabel[p.status] ?? p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentVariant[p.payment_status] ?? 'default'}>
                            {paymentLabel[p.payment_status] ?? p.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatMoneda(Number(p.total))}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Mayor Deuda por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {deudaPorCliente.length === 0 ? (
                <p className="text-sm text-emerald-600 font-medium">
                  Sin deuda pendiente
                </p>
              ) : (
                <ul className="space-y-3">
                  {deudaPorCliente.map((c, idx) => (
                    <li key={idx} className="flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-900">
                        {c.business_name}
                      </span>
                      <span className="text-sm text-red-600 font-medium">
                        {formatMoneda(c.deuda)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sección 4 — Productos más vendidos */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">
            Productos Más Vendidos — {mesAnioLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productosMasVendidos.length === 0 ? (
            <p className="text-sm text-gray-500">No hay ventas este mes.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-700">
                    Producto
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Unidades vendidas
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Ingresos generados
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 w-40">
                    Progreso
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosMasVendidos.map((p) => {
                  const pct = maxQuantity > 0 ? (p.quantity / maxQuantity) * 100 : 0
                  return (
                    <TableRow key={p.product_id} className="border-gray-100">
                      <TableCell className="font-medium text-gray-900">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {p.quantity.toLocaleString('es-MX')} {p.unit}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatMoneda(p.subtotal)}
                      </TableCell>
                      <TableCell>
                        <div className="w-full rounded-full h-2 bg-primary/20">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
