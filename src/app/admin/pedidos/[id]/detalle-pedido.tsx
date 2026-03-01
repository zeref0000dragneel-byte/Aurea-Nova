'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { confirmarPedido, actualizarEstadoPedido, registrarPago } from '../actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

function getStatusBadgeClass(status: string): string {
  if (status === 'borrador') return 'secondary'
  if (status === 'listo') return 'default' // verde vía className
  if (status === 'cancelado') return 'destructive'
  return 'default'
}

const paymentLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagado: 'Pagado',
}

function getPaymentBadgeClass(payment_status: string): string {
  if (payment_status === 'pendiente') return 'destructive'
  if (payment_status === 'parcial') return 'secondary'
  return 'default' // pagado = verde vía className
}

type NextState = { value: string; label: string }

function getNextStates(current: string): NextState[] {
  const all: NextState[] = [
    { value: 'en_preparacion', label: statusLabel.en_preparacion },
    { value: 'listo', label: statusLabel.listo },
    { value: 'entregado', label: statusLabel.entregado },
    { value: 'cancelado', label: statusLabel.cancelado },
  ]
  if (current === 'borrador') return [{ value: 'cancelado', label: statusLabel.cancelado }]
  if (current === 'confirmado') return [all[0], all[3]]
  if (current === 'en_preparacion') return [all[1], all[3]]
  if (current === 'listo') return [all[2], all[3]]
  return []
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
  customer_id: string
  status: string
  payment_status: string
  subtotal: number
  discount_amount: number
  total: number
  paid_amount: number
  delivery_date: string | null
  delivery_address: string | null
  notes: string | null
  created_at: string
  customers: { business_name: string; contact_name: string | null; phone: string | null; address: string | null } | null
  profiles: { full_name: string } | null
}

type ItemRow = {
  id: string
  product_id: string
  lot_id: string | null
  quantity: number
  unit_price: number
  discount_pct: number
  subtotal: number
  notes: string | null
  products: { name: string; unit: string } | null
  inventory_lots: { lot_number: string } | null
}

type PagoRow = {
  id: string
  amount: number
  payment_method: string
  reference: string | null
  notes: string | null
  created_at: string
}

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'tarjeta', label: 'Tarjeta' },
] as const

export default function DetallePedido({
  order,
  items,
  pagos,
}: {
  order: OrderRow
  items: ItemRow[]
  pagos: PagoRow[]
}) {
  const [confirmState, confirmFormAction] = useFormState(confirmarPedido, null)
  const [statusState, statusFormAction] = useFormState(actualizarEstadoPedido, null)
  const [pagoState, pagoFormAction] = useFormState(registrarPago, null)

  const nextStates = getNextStates(order.status)
  const isFinalState = order.status === 'entregado' || order.status === 'cancelado'
  const saldo = Number(order.total) - Number(order.paid_amount)
  const customer = order.customers

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/pedidos">← Volver a Pedidos</Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ─── COLUMNA IZQUIERDA (col-span-2) ─── */}
        <div className="md:col-span-2 space-y-6">
          {/* Sección 1 — Cabecera del pedido */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-mono">{order.order_number}</h1>
                  <p className="font-bold mt-1">{customer?.business_name ?? '—'}</p>
                  {customer?.contact_name && (
                    <p className="text-muted-foreground text-sm">{customer.contact_name}</p>
                  )}
                  {customer?.phone && (
                    <p className="text-muted-foreground text-sm">{customer.phone}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge
                    variant={getStatusBadgeClass(order.status) as 'secondary' | 'default' | 'destructive'}
                    className={cn(order.status === 'listo' && 'bg-green-600 hover:bg-green-600')}
                  >
                    {statusLabel[order.status] ?? order.status}
                  </Badge>
                  <Badge
                    variant={getPaymentBadgeClass(order.payment_status) as 'secondary' | 'default' | 'destructive'}
                    className={cn(order.payment_status === 'pagado' && 'bg-green-600 hover:bg-green-600')}
                  >
                    {paymentLabel[order.payment_status] ?? order.payment_status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.delivery_date && (
                <p>
                  <span className="text-muted-foreground">Entrega: </span>
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
              <p className="text-muted-foreground">
                Creado {formatDate(order.created_at)}
              </p>
            </CardContent>
          </Card>

          {/* Sección 2 — Items del pedido */}
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
                        <TableHead>Lote asignado</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio unit.</TableHead>
                        <TableHead className="text-right">Descuento</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.products?.name ?? '—'}
                          </TableCell>
                          <TableCell>
                            {item.lot_id && item.inventory_lots?.lot_number ? (
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
                          <TableCell className="text-right text-muted-foreground">
                            {formatMoney(item.unit_price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {Number(item.discount_pct) > 0 ? `${item.discount_pct}%` : '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatMoney(item.subtotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex flex-col items-end gap-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Subtotal: </span>
                      {formatMoney(order.subtotal)}
                    </p>
                    <p className="text-lg font-bold">
                      Total: {formatMoney(order.total)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Sección 3 — Cambiar estado */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Cambiar estado</h2>
            </CardHeader>
            <CardContent>
              {isFinalState ? (
                <p className="text-muted-foreground text-sm">Estado final</p>
              ) : (
                <form action={statusFormAction} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="order_id" value={order.id} />
                  <div className="space-y-2 min-w-[200px]">
                    <Label htmlFor="status">Nuevo estado</Label>
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
        </div>

        {/* ─── COLUMNA DERECHA (col-span-1) ─── */}
        <div className="space-y-6">
          {/* Sección 1 — Confirmar pedido (solo borrador) */}
          {order.status === 'borrador' && (
            <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <h2 className="text-lg font-semibold">Confirmar pedido</h2>
                <p className="text-sm text-muted-foreground">
                  Al confirmar se asignarán lotes FIFO automáticamente al stock disponible.
                </p>
              </CardHeader>
              <CardContent>
                <form action={confirmFormAction}>
                  <input type="hidden" name="order_id" value={order.id} />
                  <Button type="submit" className="w-full">
                    Confirmar Pedido
                  </Button>
                </form>
                {confirmState?.error && (
                  <p className="text-destructive text-sm mt-2">{confirmState.error}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sección 2 — Resumen financiero */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Resumen financiero</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total del pedido</span>
                <span className="font-medium">{formatMoney(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total pagado</span>
                <span className="font-medium">{formatMoney(order.paid_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo pendiente</span>
                <span className={cn(
                  'font-medium',
                  saldo > 0 ? 'text-destructive' : 'text-green-600'
                )}>
                  {saldo > 0 ? formatMoney(saldo) : 'Pagado'}
                </span>
              </div>
              <div className="pt-2">
                <Badge
                  variant={getPaymentBadgeClass(order.payment_status) as 'secondary' | 'default' | 'destructive'}
                  className={cn(order.payment_status === 'pagado' && 'bg-green-600 hover:bg-green-600')}
                >
                  {paymentLabel[order.payment_status] ?? order.payment_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sección 3 — Registrar abono */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Registrar abono</h2>
            </CardHeader>
            <CardContent>
              <form action={pagoFormAction} className="space-y-4">
                <input type="hidden" name="order_id" value={order.id} />
                <input type="hidden" name="customer_id" value={order.customer_id} />
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Método de pago</Label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Seleccionar...</option>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Referencia (opcional)</Label>
                  <Input
                    id="reference"
                    name="reference"
                    type="text"
                    placeholder="No. transferencia, cheque, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Input id="notes" name="notes" type="text" />
                </div>
                <Button type="submit" className="w-full">
                  Registrar Pago
                </Button>
                {pagoState?.error && (
                  <p className="text-destructive text-sm">{pagoState.error}</p>
                )}
                {pagoState?.success && (
                  <p className="text-green-600 text-sm font-medium">Pago registrado correctamente</p>
                )}
              </form>

              {pagos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Pagos registrados</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Referencia</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...pagos]
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-muted-foreground text-xs">
                              {formatDate(p.created_at)}
                            </TableCell>
                            <TableCell className="capitalize">{p.payment_method}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {p.reference ?? '—'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatMoney(p.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
