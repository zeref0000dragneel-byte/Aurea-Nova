'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { confirmarEntregaCliente, type ConfirmarEntregaState } from './actions'
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
import { CheckCircle } from 'lucide-react'

function BotonConfirmarRecepcion() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={pending}>
      {pending ? 'Confirmando...' : 'Confirmar que lo recibí'}
    </Button>
  )
}

const statusLabel: Record<string, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusColor: Record<string, string> = {
  borrador: 'secondary',
  confirmado: 'default',
  en_preparacion: 'default',
  listo: 'default',
  entregado: 'default',
  cancelado: 'destructive',
}

const paymentColor: Record<string, string> = {
  pendiente: 'destructive',
  parcial: 'secondary',
  pagado: 'default',
}

const paymentLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagado: 'Pagado',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatMoney(n: number): string {
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

type OrderRow = {
  id: string
  order_number: string
  status: string
  payment_status: string
  subtotal: number
  discount_amount: number
  total: number
  paid_amount: number
  delivery_date: string | null
  delivery_address: string | null
  notes: string | null
  confirmed_by_customer: boolean
  confirmed_by_employee: boolean
  customers: { business_name: string } | null
}

export type ItemRow = {
  id: string
  quantity: number
  unit_price: number
  discount_pct: number
  subtotal: number
  products: { name: string; unit: string } | null
}

type PagoRow = {
  id: string
  amount: number
  payment_method: string
  reference: string | null
  created_at: string
}

export default function DetallePedidoCliente({
  order,
  items,
  pagos,
}: {
  order: OrderRow
  items: ItemRow[]
  pagos: PagoRow[]
}) {
  const [state, formAction] = useFormState(confirmarEntregaCliente, null as ConfirmarEntregaState | null)
  const saldo = Number(order.total) - Number(order.paid_amount)
  const puedeConfirmar =
    order.status === 'listo' && order.confirmed_by_customer === false
  const yaConfirmo = order.confirmed_by_customer === true

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/cliente/pedidos">← Volver a Mis Pedidos</Link>
      </Button>

      {/* Sección 1 — Cabecera */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-mono">{order.order_number}</h1>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant={statusColor[order.status] as 'secondary' | 'default' | 'destructive'}>
                  {statusLabel[order.status]}
                </Badge>
                <Badge
                  variant={paymentColor[order.payment_status] as 'secondary' | 'default' | 'destructive'}
                  className={cn(order.payment_status === 'pagado' && 'bg-green-600 hover:bg-green-600')}
                >
                  {paymentLabel[order.payment_status]}
                </Badge>
              </div>
            </div>
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
              <span className="text-muted-foreground">Dirección: </span>
              {order.delivery_address}
            </p>
          )}
          {order.notes && (
            <p>
              <span className="text-muted-foreground">Notas: </span>
              {order.notes}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sección 2 — Items */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Items del pedido</h2>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin items</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.products?.name ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.products?.unit ?? ''}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatMoney(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMoney(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-lg font-bold mt-4 text-right">
                Total: {formatMoney(order.total)}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sección 3 — Estado de pago */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Estado de pago</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">{formatMoney(order.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pagado</span>
            <span className="font-medium">{formatMoney(order.paid_amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Saldo</span>
            <span
              className={cn(
                'font-medium',
                saldo > 0 ? 'text-destructive' : 'text-green-600'
              )}
            >
              {saldo > 0 ? formatMoney(saldo) : 'Pagado'}
            </span>
          </div>
          {pagos.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Abonos registrados</h3>
              <ul className="space-y-1 text-sm">
                {pagos.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {formatDate(p.created_at)} — {p.payment_method}
                      {p.reference ? ` (${p.reference})` : ''}
                    </span>
                    <span className="font-medium">{formatMoney(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección 4 — Confirmar entrega */}
      {puedeConfirmar && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-green-900">
              ¿Recibiste este pedido?
            </h2>
            <p className="text-sm text-green-800">
              Al confirmar, registramos que recibiste el pedido correctamente.
            </p>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
              <input type="hidden" name="order_id" value={order.id} />
              <BotonConfirmarRecepcion />
            </form>
            {state?.error && (
              <p className="text-destructive text-sm mt-2">{state.error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {yaConfirmo && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 flex items-center gap-2 text-green-800 font-medium">
            <CheckCircle className="h-5 w-5 shrink-0" />
            Confirmaste la recepción de este pedido
          </CardContent>
        </Card>
      )}

      {state?.success && !yaConfirmo && (
        <p className="text-green-600 text-sm font-medium">
          Recepción confirmada correctamente.
        </p>
      )}
    </div>
  )
}
