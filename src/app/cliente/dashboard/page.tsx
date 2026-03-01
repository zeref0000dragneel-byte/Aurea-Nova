import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShoppingCart, DollarSign, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export default async function ClienteDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, business_name')
    .eq('email', user.email)
    .eq('is_active', true)
    .maybeSingle()

  if (!customer) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <p className="text-amber-800 font-medium">
              Tu cuenta no está vinculada a ningún cliente. Contacta al administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const customerId = customer.id
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString()

  const [
    { data: pedidosActivos },
    { data: todosPedidosParaDeuda },
    { count: conteoEntregadosRaw },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, status, payment_status, total, paid_amount, delivery_date')
      .eq('customer_id', customerId)
      .in('status', ['borrador', 'confirmado', 'en_preparacion', 'listo'])
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('total, paid_amount, payment_status')
      .eq('customer_id', customerId)
      .neq('payment_status', 'pagado'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('status', 'entregado')
      .gte('created_at', thirtyDaysAgoIso),
  ])

  const deudaTotal =
    (todosPedidosParaDeuda ?? []).reduce(
      (sum: number, o: { total: number; paid_amount: number }) =>
        sum + (Number(o.total) - Number(o.paid_amount)),
      0
    )
  const conteoEntregados = conteoEntregadosRaw ?? 0
  const activos = (pedidosActivos ?? []) as Array<{
    id: string
    order_number: string
    status: string
    payment_status: string
    total: number
    paid_amount: number
    delivery_date: string | null
  }>

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {customer.business_name}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumen de tu portal
        </p>
      </div>

      {/* Tres cards de resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activos.length}</p>
                <p className="text-xs font-medium text-gray-500">Pedidos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'border-gray-200',
            deudaTotal > 0 ? 'border-red-200 bg-red-50/50' : 'border-emerald-200 bg-emerald-50/30'
          )}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  deudaTotal > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                )}
              >
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    deudaTotal > 0 ? 'text-red-700' : 'text-green-700'
                  )}
                >
                  ${deudaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs font-medium text-gray-500">Saldo Pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{conteoEntregados}</p>
                <p className="text-xs font-medium text-gray-500">Entregas este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla pedidos activos */}
      <Card className="border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Pedidos activos</h2>
          <p className="text-sm text-muted-foreground">
            Pedidos en curso (no entregados ni cancelados)
          </p>
        </CardHeader>
        <CardContent>
          {activos.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No tienes pedidos activos.
            </p>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent bg-muted/50">
                    <TableHead className="font-semibold text-gray-700">Pedido</TableHead>
                    <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                    <TableHead className="font-semibold text-gray-700">Pago</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Total</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Por pagar</TableHead>
                    <TableHead className="font-semibold text-gray-700">Fecha entrega</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activos.map((pedido) => {
                    const porPagar = Number(pedido.total) - Number(pedido.paid_amount)
                    return (
                      <TableRow key={pedido.id} className="border-gray-100">
                        <TableCell className="font-mono text-sm font-medium">
                          {pedido.order_number}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor[pedido.status] as 'secondary' | 'default' | 'destructive'}>
                            {statusLabel[pedido.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentColor[pedido.payment_status] as 'secondary' | 'default' | 'destructive'}>
                            {pedido.payment_status.charAt(0).toUpperCase() + pedido.payment_status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(pedido.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          {porPagar > 0 ? (
                            <span className="text-destructive font-medium">
                              ${porPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-green-600 font-medium">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {pedido.delivery_date
                            ? new Date(pedido.delivery_date + 'T00:00:00').toLocaleDateString('es-MX')
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/cliente/pedidos/${pedido.id}`}>Ver detalle</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
