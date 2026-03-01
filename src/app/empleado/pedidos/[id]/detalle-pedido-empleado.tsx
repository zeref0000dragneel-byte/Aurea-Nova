'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { actualizarEstadoPedido } from '@/app/admin/pedidos/actions'
import { confirmarEntregaEmpleado } from './actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const statusLabel: Record<string, string> = {
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

function getStatusBadgeClass(status: string): string {
  if (status === 'listo') return 'default'
  if (status === 'cancelado') return 'destructive'
  return 'default'
}

type NextState = { value: string; label: string }

/** Transiciones permitidas para empleado: confirmado→en_preparacion; en_preparacion→listo; listo→entregado */
function getNextStatesEmpleado(current: string): NextState[] {
  if (current === 'confirmado') return [{ value: 'en_preparacion', label: statusLabel.en_preparacion }]
  if (current === 'en_preparacion') return [{ value: 'listo', label: statusLabel.listo }]
  if (current === 'listo') return [{ value: 'entregado', label: statusLabel.entregado }]
  return []
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

type OrderRow = {
  id: string
  order_number: string
  status: string
  delivery_date: string | null
  delivery_address: string | null
  notes: string | null
  confirmed_by_employee: boolean
  confirmed_by_customer: boolean
  customers: { business_name: string } | null
}

type ItemRow = {
  id: string
  quantity: number
  products: { name: string; unit: string } | null
  inventory_lots: { lot_number: string } | null
}

type PagoRow = {
  id: string
  amount: number
  payment_method: string
  created_at: string
}

export default function DetallePedidoEmpleado({
  order,
  items,
}: {
  order: OrderRow
  items: ItemRow[]
  pagos: PagoRow[]
}) {
  const [statusState, statusFormAction] = useFormState(actualizarEstadoPedido, null)
  const [confirmState, confirmFormAction] = useFormState(confirmarEntregaEmpleado, null)

  const nextStates = getNextStatesEmpleado(order.status)
  const showConfirmarEntrega = order.status === 'listo' && !order.confirmed_by_employee
  const customer = order.customers

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/empleado/pedidos">← Volver a Pedidos</Link>
      </Button>

      {/* Sección 1 — Cabecera */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-mono">{order.order_number}</h1>
              <p className="font-bold mt-1">{customer?.business_name ?? '—'}</p>
            </div>
            <Badge
              variant={getStatusBadgeClass(order.status) as 'default' | 'destructive'}
              className={cn(order.status === 'listo' && 'bg-green-600 hover:bg-green-600')}
            >
              {statusLabel[order.status] ?? order.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {order.delivery_date && (
            <p>
              <span className="text-muted-foreground">Fecha de entrega: </span>
              {formatDate(order.delivery_date + 'T00:00:00')}
            </p>
          )}
          {order.delivery_address && (
            <p>
              <span className="text-muted-foreground">Dirección de entrega: </span>
              {order.delivery_address}
            </p>
          )}
          {order.notes && (
            <p>
              <span className="text-muted-foreground">Notas del pedido: </span>
              {order.notes}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sección 2 — Items a preparar */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Items a preparar</h2>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin items</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Lote asignado</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.products?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      {item.inventory_lots?.lot_number ? (
                        item.inventory_lots.lot_number
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                          Sin asignar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity} {item.products?.unit ?? ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sección 3 — Actualizar estado */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Actualizar estado del pedido</h2>
        </CardHeader>
        <CardContent>
          {nextStates.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin acciones disponibles</p>
          ) : (
            <form action={statusFormAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="order_id" value={order.id} />
              <div className="space-y-2 min-w-[200px]">
                <label htmlFor="status" className="text-sm font-medium">
                  Nuevo estado
                </label>
                <select
                  id="status"
                  name="status"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Seleccionar...</option>
                  {nextStates.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit">Actualizar Estado</Button>
            </form>
          )}
          {statusState?.error && (
            <p className="text-destructive text-sm mt-2">{statusState.error}</p>
          )}
        </CardContent>
      </Card>

      {/* Sección 4 — Confirmar entrega (solo si listo y no confirmado por empleado) */}
      {showConfirmarEntrega && (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <h2 className="text-lg font-semibold">Confirmar entrega</h2>
            <p className="text-sm text-muted-foreground">¿Entregaste este pedido?</p>
          </CardHeader>
          <CardContent>
            <form action={confirmFormAction}>
              <input type="hidden" name="order_id" value={order.id} />
              <Button type="submit" className="w-full">
                Confirmar entrega
              </Button>
            </form>
            {confirmState?.error && (
              <p className="text-destructive text-sm mt-2">{confirmState.error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {order.confirmed_by_employee && (
        <Badge className="bg-green-600 hover:bg-green-600 w-full justify-center py-2">
          ✓ Entrega confirmada por ti
        </Badge>
      )}
    </div>
  )
}
