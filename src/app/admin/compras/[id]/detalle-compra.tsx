'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { registrarPagoProveedor, registrarRecepcion, cancelarCompra } from '../actions'
import { cn } from '@/lib/utils'

type PurchaseData = {
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
  notes: string | null
  received_quantity: number | null
  reception_notes: string | null
  reception_status: 'pendiente' | 'recibido_completo' | 'recibido_parcial' | 'cancelado'
  raw_materials: { name: string; unit: string } | null
}

type PaymentRow = {
  id: string
  amount: number
  payment_method: string
  reference: string | null
  notes: string | null
  created_at: string
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

const RECEPTION_BADGE: Record<string, { className: string; label: string }> = {
  pendiente: { className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100', label: '⏳ Pendiente de recibir' },
  recibido_completo: { className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100', label: '✓ Recibido completo' },
  recibido_parcial: { className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100', label: '⚠ Recibido parcial' },
  cancelado: { className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100', label: '✗ Cancelado' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatMoney(n: number) {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2 })
}

function capitalizeMethod(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function SubmitPagoButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-amber-500 font-medium text-white hover:bg-amber-600 disabled:opacity-60"
    >
      {pending ? 'Registrando…' : 'Registrar Pago'}
    </Button>
  )
}

function SubmitRecepcionButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-emerald-600 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      {pending ? 'Guardando…' : 'Confirmar Recepción'}
    </Button>
  )
}

export function DetalleCompra({
  compra,
  pagos,
}: {
  compra: PurchaseData
  pagos: PaymentRow[]
}) {
  const [state, formAction] = useFormState(registrarPagoProveedor, null)
  const [stateRecepcion, formActionRecepcion] = useFormState(registrarRecepcion, null)
  const [stateCancelar, formActionCancelar] = useFormState(cancelarCompra, null)
  const formCancelarRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const success = state && typeof state === 'object' && 'success' in state && (state as { success?: boolean }).success
  const error = state && typeof state === 'object' && 'error' in state ? (state as { error: string }).error : null
  const successRecepcion = stateRecepcion && typeof stateRecepcion === 'object' && 'success' in stateRecepcion && (stateRecepcion as { success?: boolean }).success
  const errorRecepcion = stateRecepcion && typeof stateRecepcion === 'object' && 'error' in stateRecepcion ? (stateRecepcion as { error: string }).error : null
  const errorCancelar = stateCancelar && typeof stateCancelar === 'object' && 'error' in stateCancelar ? (stateCancelar as { error: string }).error : null

  useEffect(() => {
    if (success || successRecepcion || (stateCancelar && typeof stateCancelar === 'object' && 'success' in stateCancelar)) router.refresh()
  }, [success, successRecepcion, stateCancelar, router])

  const materialName = compra.raw_materials?.name ?? '—'
  const unit = compra.raw_materials?.unit ?? ''
  const total = Number(compra.total)
  const paid = Number(compra.paid_amount)
  const saldo = total - paid
  const statusConf = PAYMENT_BADGE[compra.payment_status] ?? PAYMENT_BADGE.pendiente
  const receptionStatus = (compra.reception_status ?? 'pendiente') as keyof typeof RECEPTION_BADGE
  const receptionConf = RECEPTION_BADGE[receptionStatus] ?? RECEPTION_BADGE.pendiente
  const fechaCompra = formatDate(compra.purchase_date)
  const totalPagadoFromPagos = pagos.reduce((s, p) => s + Number(p.amount), 0)
  const receivedQty = compra.received_quantity != null ? Number(compra.received_quantity) : null

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/compras"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          ← Volver a Compras
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Columna izquierda: 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1 — Cabecera */}
          <Card className="border-gray-200">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">{materialName}</h2>
              <p className="text-lg font-bold text-gray-900">{compra.supplier}</p>
              <p className="text-sm text-gray-600">{fechaCompra}</p>
              {compra.invoice_number && (
                <Badge variant="secondary" className="mt-1 w-fit bg-gray-100 text-gray-700 border-gray-200">
                  No. factura: {compra.invoice_number}
                </Badge>
              )}
              {compra.notes && (
                <p className="mt-2 text-sm italic text-muted-foreground whitespace-pre-wrap">
                  {compra.notes}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={statusConf.variant} className={cn('border', statusConf.className)}>
                  {PAYMENT_LABEL[compra.payment_status] ?? compra.payment_status}
                </Badge>
                <Badge variant="outline" className={cn('border', receptionConf.className)}>
                  {receptionConf.label}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Card 2 — Detalle de la compra */}
          <Card className="border-gray-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Detalle de la compra</h3>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent">
                    <TableHead className="w-[50%] font-semibold text-gray-700"></TableHead>
                    <TableHead className="font-semibold text-gray-700"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-gray-100">
                    <TableCell className="text-muted-foreground">Cantidad pedida</TableCell>
                    <TableCell className="font-medium">
                      {Number(compra.quantity).toLocaleString('es-MX')} {unit}
                    </TableCell>
                  </TableRow>
                  {receivedQty != null && (
                    <TableRow className="border-gray-100">
                      <TableCell className="text-muted-foreground">Cantidad recibida</TableCell>
                      <TableCell
                        className={cn(
                          'font-medium',
                          receivedQty >= Number(compra.quantity) ? 'text-emerald-600' : 'text-amber-600'
                        )}
                      >
                        {receivedQty.toLocaleString('es-MX')} {unit}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className="border-gray-100">
                    <TableCell className="text-muted-foreground">Costo unitario</TableCell>
                    <TableCell className="font-medium">
                      {formatMoney(Number(compra.unit_cost))}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-gray-100">
                    <TableCell className="text-muted-foreground">Total de la compra</TableCell>
                    <TableCell className="font-bold text-gray-900">
                      {formatMoney(total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="mt-4 text-sm text-muted-foreground">
                El stock de <strong>{materialName}</strong> se incrementó automáticamente al registrar esta compra.
              </p>
            </CardContent>
          </Card>

          {/* Card — Recepción de Mercancía */}
          <Card className="border-gray-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recepción de Mercancía</h3>
            </CardHeader>
            <CardContent>
              {receptionStatus === 'cancelado' && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                  Esta compra fue cancelada. El stock fue revertido automáticamente.
                </p>
              )}
              {receptionStatus === 'recibido_completo' && (
                <>
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    ✓ Mercancía recibida completa. Cantidad: {(receivedQty ?? 0).toLocaleString('es-MX')} {unit}.
                  </p>
                  {compra.reception_notes && (
                    <p className="mt-2 text-sm italic text-muted-foreground whitespace-pre-wrap">
                      {compra.reception_notes}
                    </p>
                  )}
                </>
              )}
              {(receptionStatus === 'pendiente' || receptionStatus === 'recibido_parcial') && (
                <form action={formActionRecepcion} className="space-y-4">
                  <input type="hidden" name="purchase_id" value={compra.id} />
                  <input type="hidden" name="reception_status" value={receptionStatus} />
                  <h4 className="font-medium text-gray-900">Registrar Recepción</h4>
                  {receptionStatus === 'recibido_parcial' && receivedQty != null && (
                    <p className="text-sm text-muted-foreground">
                      Recepción anterior: {receivedQty.toLocaleString('es-MX')} {unit}
                    </p>
                  )}
                  {successRecepcion && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                      {stateRecepcion && typeof stateRecepcion === 'object' && 'mensaje' in stateRecepcion
                        ? (stateRecepcion as { mensaje?: string }).mensaje
                        : 'Recepción registrada.'}
                    </div>
                  )}
                  {errorRecepcion && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {errorRecepcion}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="received_quantity">Cantidad recibida *</Label>
                    <Input
                      id="received_quantity"
                      name="received_quantity"
                      type="number"
                      min="0"
                      step="any"
                      required
                      placeholder={String(Number(compra.quantity))}
                      className="border-gray-200"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ingresa la cantidad que físicamente llegó
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reception_notes">Notas de recepción</Label>
                    <Textarea
                      id="reception_notes"
                      name="reception_notes"
                      placeholder="Diferencias, daños, faltantes, aclaraciones con proveedor..."
                      rows={3}
                      className="resize-none border-gray-200"
                    />
                  </div>
                  <SubmitRecepcionButton />
                </form>
              )}
            </CardContent>
          </Card>

          {/* Card 3 — Historial de pagos */}
          <Card className="border-gray-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Pagos registrados</h3>
            </CardHeader>
            <CardContent>
              {pagos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin pagos registrados aún.</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 hover:bg-transparent">
                        <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                        <TableHead className="font-semibold text-gray-700">Método</TableHead>
                        <TableHead className="font-semibold text-gray-700">Referencia</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagos.map((p) => (
                        <TableRow key={p.id} className="border-gray-100">
                          <TableCell className="text-gray-700">
                            {formatDate(p.created_at)}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {capitalizeMethod(p.payment_method)}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {p.reference ?? '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-900">
                            {formatMoney(Number(p.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 space-y-1 border-t border-gray-100 pt-4">
                    <p className="font-bold text-gray-900">
                      Total pagado: {formatMoney(totalPagadoFromPagos)}
                    </p>
                    <p
                      className={cn(
                        'font-semibold',
                        saldo > 0 ? 'text-red-600' : 'text-emerald-600'
                      )}
                    >
                      Saldo pendiente: {formatMoney(saldo)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: 1/3 */}
        <div className="space-y-6">
          {/* Card 1 — Resumen financiero */}
          <Card className="border-gray-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Resumen financiero</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de la compra</span>
                <span className="font-medium text-gray-900">{formatMoney(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total pagado</span>
                <span className="font-medium text-gray-900">{formatMoney(paid)}</span>
              </div>
              {compra.payment_status === 'cancelado' ? (
                <div className="text-sm">
                  <span className="text-muted-foreground">Estado: </span>
                  <span className="font-medium text-gray-600">Compra cancelada — sin deuda generada</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo pendiente</span>
                  <span
                    className={cn(
                      'font-semibold',
                      saldo > 0 ? 'text-red-600' : 'text-emerald-600'
                    )}
                  >
                    {formatMoney(saldo)}
                  </span>
                </div>
              )}
              <div className="pt-2">
                <Badge variant={statusConf.variant} className={cn('border', statusConf.className)}>
                  {PAYMENT_LABEL[compra.payment_status] ?? compra.payment_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 — Registrar pago o Completamente pagada */}
          {compra.payment_status === 'pagado' ? (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="pt-6">
                <p className="font-medium text-emerald-800">
                  ✓ Esta compra está completamente pagada.
                </p>
              </CardContent>
            </Card>
          ) : compra.payment_status !== 'cancelado' ? (
            <Card className="border-gray-200">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Registrar Pago</h3>
              </CardHeader>
              <CardContent>
                <form action={formAction} className="space-y-4">
                  <input type="hidden" name="purchase_id" value={compra.id} />
                  {success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                      ✓ Pago registrado correctamente
                    </div>
                  )}
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Método de pago</Label>
                    <select
                      id="payment_method"
                      name="payment_method"
                      defaultValue="efectivo"
                      className={cn(
                        'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
                      )}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="cheque">Cheque</option>
                      <option value="tarjeta">Tarjeta</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Referencia / No. transferencia</Label>
                    <Input
                      id="reference"
                      name="reference"
                      type="text"
                      placeholder="Opcional"
                      className="border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes_pago">Notas</Label>
                    <Input
                      id="notes_pago"
                      name="notes"
                      type="text"
                      placeholder="Opcional"
                      className="border-gray-200"
                    />
                  </div>
                  <SubmitPagoButton />
                </form>
              </CardContent>
            </Card>
          ) : null}

          {/* Card — Cancelar Compra */}
          {receptionStatus !== 'cancelado' && receptionStatus !== 'recibido_completo' && (
            <Card className="border-red-200 bg-red-50/30">
              <CardContent className="pt-6">
                <p className="mb-2 font-bold text-red-700">Zona de peligro</p>
                <p className="mb-4 text-sm text-red-800">
                  Cancelar esta compra revertirá el stock agregado automáticamente.
                </p>
                <form
                  ref={formCancelarRef}
                  action={formActionCancelar}
                  className="space-y-3"
                >
                  <input type="hidden" name="purchase_id" value={compra.id} />
                  {errorCancelar && (
                    <div className="rounded-lg border border-red-200 bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
                      {errorCancelar}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                    onClick={() => {
                      if (confirm('¿Cancelar esta compra? El stock será revertido. Esta acción no se puede deshacer.')) {
                        formCancelarRef.current?.requestSubmit()
                      }
                    }}
                  >
                    Cancelar Compra
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
